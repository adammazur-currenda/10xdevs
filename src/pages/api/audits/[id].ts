import type { APIRoute } from "astro";
import { z } from "zod";
import type { GetAuditResponseDTO } from "../../../types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../db/database.types";
import { supabaseClient, DEFAULT_USER_ID } from "../../../db/supabase.client";

// Validate UUID format
const uuidSchema = z.string().uuid({
  message: "Invalid audit ID format - must be a valid UUID",
});

interface Locals {
  supabase: SupabaseClient<Database>;
}

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    // 1. Validate UUID format
    const validationResult = uuidSchema.safeParse(params.id);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: validationResult.error.issues[0].message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const auditId = validationResult.data;

    // 2. Get audit details
    const { supabase } = locals as Locals;
    const { data: audit, error: dbError } = await supabase
      .from("audits")
      .select("*")
      .eq("id", auditId)
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({
          error: "Failed to retrieve audit details",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!audit) {
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

    // 3. Return formatted response
    const response: GetAuditResponseDTO = audit;
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /audits/[id]:", error);
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
