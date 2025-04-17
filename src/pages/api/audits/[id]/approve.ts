import { z } from "zod";
import type { APIRoute } from "astro";
import { supabaseClient, DEFAULT_USER_ID } from "../../../../db/supabase.client";

// Validation schema for the approve audit command
const approveAuditSchema = z.object({
  confirm: z.boolean().optional(),
});

// Validation schema for the URL parameter
const paramsSchema = z.object({
  id: z.string().uuid("Invalid audit ID format"),
});

export const prerender = false;

export const POST: APIRoute = async ({ params, request }) => {
  const operation = "POST /audits/[id]/approve";
  try {
    // 1. Validate URL parameters
    const paramsResult = paramsSchema.safeParse(params);
    if (!paramsResult.success) {
      console.warn(`${operation} - Invalid UUID format:`, params.id);
      return new Response(
        JSON.stringify({
          error: "Invalid parameters",
          details: paramsResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const { id } = paramsResult.data;

    // 2. Get and validate request body if present
    if (request.headers.get("content-type")?.includes("application/json")) {
      const body = await request.json();
      const bodyResult = approveAuditSchema.safeParse(body);
      if (!bodyResult.success) {
        console.warn(`${operation} - Invalid request body for audit ${id}:`, bodyResult.error);
        return new Response(
          JSON.stringify({
            error: "Invalid request body",
            details: bodyResult.error.errors,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // 3. Get audit from database and validate its state
    const { data: audit, error: fetchError } = await supabaseClient
      .from("audits")
      .select()
      .eq("id", id)
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    if (fetchError) {
      console.error(`${operation} - Database error fetching audit ${id}:`, fetchError);
      return new Response(JSON.stringify({ error: "Failed to fetch audit" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!audit) {
      console.warn(`${operation} - Audit not found:`, { audit_id: id });
      return new Response(JSON.stringify({ error: "Audit not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Validate audit state
    if (audit.status === "approved") {
      console.warn(`${operation} - Attempt to approve already approved audit:`, { audit_id: id });
      return new Response(JSON.stringify({ error: "Audit is already approved" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Validate summary field
    if (!audit.summary || audit.summary.trim() === "") {
      console.warn(`${operation} - Attempt to approve audit without summary:`, { audit_id: id });
      return new Response(
        JSON.stringify({
          error: "Missing required information",
          message: "Przed zatwierdzeniem audytu należy wypełnić podsumowanie protokołu.",
          action: {
            type: "navigate",
            target: `/audits/${id}/edit`,
            label: "Przejdź do edycji audytu",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 6. Update audit status
    const { data: updatedAudit, error: updateError } = await supabaseClient
      .from("audits")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", DEFAULT_USER_ID)
      .select()
      .single();

    if (updateError) {
      console.error(`${operation} - Error updating audit ${id}:`, updateError);
      return new Response(JSON.stringify({ error: "Failed to update audit" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 7. Return updated audit
    return new Response(JSON.stringify(updatedAudit), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`${operation} - Unexpected error:`, error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
