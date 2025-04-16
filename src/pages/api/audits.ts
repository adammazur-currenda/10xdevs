import { z } from "zod";
import type { APIRoute } from "astro";
import type { ListAuditsResponseDTO } from "../../types";
import { AuditService } from "../../lib/services/audit.service";
import { supabaseClient, DEFAULT_USER_ID } from "../../db/supabase.client";
import { AuditListError, InvalidSortingError } from "../../lib/errors/audit.errors";

// Initialize audit service
const auditService = new AuditService(supabaseClient);

// Validation schema for query parameters
const queryParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().min(1).max(100).default(10),
  sort: z.enum(["created_at", "-created_at", "audit_order_number", "-audit_order_number"]).optional(),
});

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    console.log("[GET /audits] Processing request", { url: request.url });

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryResult = queryParamsSchema.safeParse({
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
      sort: url.searchParams.get("sort"),
    });

    if (!queryResult.success) {
      console.warn("[GET /audits] Invalid query parameters", queryResult.error.issues);
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: queryResult.error.issues,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { page, limit, sort } = queryResult.data;
    console.log("[GET /audits] Validated parameters", { page, limit, sort });

    // Get audits from service layer using default user ID
    const response: ListAuditsResponseDTO = await auditService.listAudits(supabaseClient, DEFAULT_USER_ID, {
      page,
      limit,
      sort,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[GET /audits] Error processing request:", error);

    if (error instanceof InvalidSortingError) {
      return new Response(
        JSON.stringify({
          error: "Invalid sorting parameter",
          message: error.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (error instanceof AuditListError) {
      return new Response(
        JSON.stringify({
          error: "Failed to retrieve audits",
          message: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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
