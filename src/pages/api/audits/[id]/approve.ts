import type { APIRoute } from "astro";
import { z } from "zod";

// Disable prerendering for dynamic API route
export const prerender = false;

// UUID validation schema
const uuidSchema = z.string().uuid({
  message: "Invalid audit ID format - must be a valid UUID",
});

export const POST: APIRoute = async ({ params, locals }) => {
  const operation = "POST /audits/[id]/approve";
  try {
    // Check if user is authenticated
    const user = locals.auth?.user;
    if (!user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate UUID format
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

    // Fetch audit to check if it exists and its current status
    const { data: audit, error: fetchError } = await locals.supabase
      .from("audits")
      .select("*")
      .eq("id", auditId)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      console.error(`${operation} - Database error fetching audit ${auditId}:`, fetchError);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          details: "Failed to fetch audit",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!audit) {
      console.warn(`${operation} - Audit not found:`, { audit_id: auditId });
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

    if (audit.status === "approved") {
      console.warn(`${operation} - Audit already approved:`, { audit_id: auditId });
      return new Response(
        JSON.stringify({
          error: "Audit is already approved",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate that audit has required fields before approval
    if (!audit.protocol || !audit.summary) {
      console.warn(`${operation} - Audit missing required fields:`, { audit_id: auditId });
      return new Response(
        JSON.stringify({
          error: "Audit cannot be approved - missing required fields (protocol or summary)",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update audit status to approved
    const { data: updatedAudit, error: updateError } = await locals.supabase
      .from("audits")
      .update({ status: "approved" })
      .eq("id", auditId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error(`${operation} - Database error updating audit ${auditId}:`, updateError);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          details: "Failed to update audit status",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(updatedAudit), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`${operation} - Unexpected error:`, error);
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
