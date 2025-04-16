import type { APIRoute } from "astro";
import { createAuditSchema } from "../../lib/schemas/audit.schema";
import { AuditService } from "../../lib/services/audit.service";
import { DEFAULT_USER_ID, supabaseClient } from "../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = createAuditSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          details: result.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create audit using service
    const auditService = new AuditService(supabaseClient);
    const audit = await auditService.createAudit(result.data, DEFAULT_USER_ID);

    return new Response(JSON.stringify(audit), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating audit:", error);
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
