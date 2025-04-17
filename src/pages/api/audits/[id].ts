import type { APIRoute } from "astro";
import { z } from "zod";
import type { GetAuditResponseDTO, UpdateAuditCommand } from "../../../types";
import { supabaseClient, DEFAULT_USER_ID } from "../../../db/supabase.client";

// Disable prerendering for dynamic API route
export const prerender = false;

// UUID validation schema
const uuidSchema = z.string().uuid({
  message: "Invalid audit ID format - must be a valid UUID",
});

// Schema for validating update audit request
const updateAuditSchema = z
  .object({
    protocol: z.string().min(1000).max(10000).optional(),
    description: z.string().optional(),
    summary: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "At least one field must be provided for update" });

export const GET: APIRoute = async ({ params }) => {
  const operation = "GET /audits/[id]";
  try {
    // 1. Validate UUID format
    const result = uuidSchema.safeParse(params.id);
    if (!result.success) {
      console.warn(`${operation} - Invalid UUID format:`, params.id);
      return new Response(
        JSON.stringify({
          error: "Invalid request",
          details: result.error.issues[0].message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const auditId = result.data;

    // 2. Query the database for the audit
    const { data: audit, error } = await supabaseClient
      .from("audits")
      .select()
      .eq("id", auditId)
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    if (error) {
      console.error(`${operation} - Database error for audit ${auditId}:`, {
        error,
        user_id: DEFAULT_USER_ID,
      });
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!audit) {
      console.warn(`${operation} - Audit not found:`, {
        audit_id: auditId,
        user_id: DEFAULT_USER_ID,
      });
      return new Response(JSON.stringify({ error: "Audit not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(audit as GetAuditResponseDTO), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`${operation} - Unexpected error:`, {
      error,
      params,
      user_id: DEFAULT_USER_ID,
    });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    // Validate the ID parameter
    const validationResult = uuidSchema.safeParse(params.id);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid audit ID format",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const auditId = validationResult.data;

    // Get the audit record to check if it exists and its status
    const { data: audit, error: fetchError } = await supabaseClient
      .from("audits")
      .select("*")
      .eq("id", auditId)
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    if (fetchError || !audit) {
      return new Response(
        JSON.stringify({
          error: "Audit not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if audit is approved
    if (audit.status === "approved") {
      return new Response(
        JSON.stringify({
          error: "Cannot delete approved audit",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Delete the audit
    const { error: deleteError } = await supabaseClient
      .from("audits")
      .delete()
      .eq("id", auditId)
      .eq("user_id", DEFAULT_USER_ID);

    if (deleteError) {
      throw deleteError;
    }

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error("Error deleting audit:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const operation = "PATCH /audits/[id]";
  try {
    const { id } = params;

    // Validate UUID format
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      console.warn(`${operation} - Invalid UUID format:`, id);
      return new Response(JSON.stringify({ error: "Invalid audit ID format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateAuditSchema.safeParse(body);

    if (!validationResult.success) {
      console.warn(`${operation} - Invalid request data for audit ${id}:`, {
        errors: validationResult.error.errors,
        body,
      });
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const updateData = validationResult.data as UpdateAuditCommand;

    // Check if audit exists and is not approved
    const { data: existingAudit, error: fetchError } = await supabaseClient
      .from("audits")
      .select("*")
      .eq("id", id)
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    if (fetchError) {
      console.error(`${operation} - Error fetching audit ${id}:`, {
        error: fetchError,
        user_id: DEFAULT_USER_ID,
      });
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!existingAudit) {
      console.warn(`${operation} - Audit not found:`, {
        audit_id: id,
        user_id: DEFAULT_USER_ID,
      });
      return new Response(JSON.stringify({ error: "Audit not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if audit is approved
    if (existingAudit.status === "approved") {
      console.warn(`${operation} - Attempt to update approved audit ${id}`);
      return new Response(JSON.stringify({ error: "Cannot update approved audit" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update audit
    const { data: updatedAudit, error: updateError } = await supabaseClient
      .from("audits")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", DEFAULT_USER_ID)
      .select()
      .single();

    if (updateError) {
      console.error(`${operation} - Error updating audit ${id}:`, {
        error: updateError,
        update_data: updateData,
        user_id: DEFAULT_USER_ID,
      });
      return new Response(JSON.stringify({ error: "Failed to update audit" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(updatedAudit), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`${operation} - Unexpected error:`, {
      error,
      params,
      user_id: DEFAULT_USER_ID,
    });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
