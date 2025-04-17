import type { APIContext } from "astro";
import { z } from "zod";
import { supabaseClient, DEFAULT_USER_ID } from "../../db/supabase.client";

// Schema for validating the id parameter
const paramsSchema = z.object({
  id: z.string().uuid("Invalid audit ID format"),
});

export async function deleteAudit({ params }: APIContext) {
  try {
    // Validate the ID parameter
    const result = paramsSchema.safeParse(params);
    if (!result.success) {
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

    // Get the audit record
    const { data: audit, error: fetchError } = await supabaseClient
      .from("audits")
      .select("*")
      .eq("id", result.data.id)
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
      .eq("id", result.data.id)
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
}
