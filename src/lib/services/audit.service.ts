import type { supabaseClient } from "../../db/supabase.client";
import type { ListAuditsResponseDTO } from "../../types";
import { AuditListError, InvalidSortingError } from "../errors/audit.errors";

type SupabaseClient = typeof supabaseClient;

interface ListAuditsOptions {
  page: number;
  limit: number;
  sort?: string;
}

const ALLOWED_SORT_COLUMNS = ["created_at", "audit_order_number"] as const;
type AllowedSortColumn = (typeof ALLOWED_SORT_COLUMNS)[number];

export class AuditService {
  constructor(private readonly supabase: SupabaseClient) {}

  private validateSortColumn(column: string): asserts column is AllowedSortColumn {
    if (!ALLOWED_SORT_COLUMNS.includes(column as AllowedSortColumn)) {
      throw new InvalidSortingError(column);
    }
  }

  async listAudits(
    supabase: SupabaseClient,
    userId: string,
    options: ListAuditsOptions
  ): Promise<ListAuditsResponseDTO> {
    try {
      console.log("[AuditService] Listing audits", { userId, options });

      const { page, limit, sort } = options;
      const offset = (page - 1) * limit;

      // Build query
      let query = supabase
        .from("audits")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .range(offset, offset + limit - 1);

      // Apply sorting if specified
      if (sort) {
        const [column, order] = sort.startsWith("-") ? [sort.slice(1), "desc" as const] : [sort, "asc" as const];

        // Validate sort column
        this.validateSortColumn(column);

        query = query.order(column, { ascending: order === "asc" });
        console.log("[AuditService] Applied sorting", { column, order });
      } else {
        // Default sorting by created_at desc
        query = query.order("created_at", { ascending: false });
        console.log("[AuditService] Applied default sorting");
      }

      const { data: audits, error, count } = await query;

      if (error) {
        console.error("[AuditService] Database error while listing audits", error);
        throw new AuditListError(`Failed to fetch audits: ${error.message}`, error);
      }

      const response: ListAuditsResponseDTO = {
        audits: audits || [],
        pagination: {
          page,
          limit,
          total: count || 0,
        },
      };

      console.log("[AuditService] Successfully retrieved audits", {
        total: response.pagination.total,
        count: response.audits.length,
      });

      return response;
    } catch (error) {
      if (error instanceof AuditListError) {
        throw error;
      }
      console.error("[AuditService] Unexpected error while listing audits", error);
      throw new AuditListError("Unexpected error while listing audits", error);
    }
  }
}
