import type { APIRoute } from "astro";
import { z } from "zod";
import { supabaseClient, DEFAULT_USER_ID } from "../../../db/supabase.client";
import type { ListAuditsResponseDTO } from "../../../types";

export const prerender = false;

// Schema for query parameters
const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.enum(["created_at", "-created_at", "audit_order_number", "-audit_order_number"]).default("-created_at"),
});

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const { page, limit, sort } = querySchema.parse(searchParams);

    // Calculate offset
    const offset = (page - 1) * limit;

    // Determine sort column and direction
    const sortColumn = sort.startsWith("-") ? sort.slice(1) : sort;
    const sortDirection = sort.startsWith("-") ? "desc" : "asc";

    // Get audits with pagination
    const {
      data: audits,
      error: fetchError,
      count,
    } = await supabaseClient
      .from("audits")
      .select("*", { count: "exact" })
      .eq("user_id", DEFAULT_USER_ID)
      .order(sortColumn, { ascending: sortDirection === "asc" })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      throw fetchError;
    }

    const response: ListAuditsResponseDTO = {
      audits: audits || [],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching audits:", error);
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
