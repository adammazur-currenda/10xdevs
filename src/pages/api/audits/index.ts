import type { APIRoute } from "astro";
import type { ListAuditsResponseDTO } from "../../../types";
import { AuditService } from "../../../lib/services/audit.service";
import { AuditListError, InvalidSortingError } from "../../../lib/errors/audit.errors";
import { createAuditSchema } from "../../../lib/schemas/audit.schema";

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    if (!locals.auth.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const auditService = new AuditService(locals.supabase);
    const response: ListAuditsResponseDTO = await auditService.listAudits(locals.auth.user.id, {
      page: Number(url.searchParams.get("page")) || 1,
      limit: Number(url.searchParams.get("limit")) || 10,
      sort: url.searchParams.get("sort") || undefined,
      filter: url.searchParams.get("filter") || undefined,
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

export const POST: APIRoute = async ({ request, locals }) => {
  const operation = "POST /audits";
  try {
    // Sprawdź czy użytkownik jest zalogowany i pobierz jego ID
    const user = locals.auth.user;
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

    // Parse and validate request body
    const body = await request.json();
    const result = createAuditSchema.safeParse(body);

    if (!result.success) {
      console.warn(`${operation} - Validation error:`, result.error.errors);
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

    const { audit_order_number } = result.data;

    // Check if audit order number already exists
    const { data: existingAudit, error: checkError } = await locals.supabase
      .from("audits")
      .select("audit_order_number")
      .eq("audit_order_number", audit_order_number)
      .eq("user_id", user.id)
      .maybeSingle();

    if (checkError) {
      console.error(`${operation} - Error checking audit number uniqueness:`, checkError);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          message: "Wystąpił błąd podczas weryfikacji numeru zlecenia. Proszę spróbować ponownie.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (existingAudit) {
      console.warn(`${operation} - Duplicate audit order number:`, { audit_order_number });
      return new Response(
        JSON.stringify({
          error: "Duplicate audit order number",
          message: `Numer zlecenia "${audit_order_number}" jest już zajęty. Proszę wybrać inny numer zlecenia.`,
          code: "DUPLICATE_AUDIT_NUMBER",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Initialize audit service with Supabase instance from locals
    const auditService = new AuditService(locals.supabase);

    // Create audit using service
    const audit = await auditService.createAudit(result.data, user.id);
    return new Response(JSON.stringify(audit), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`${operation} - Unexpected error:`, error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Wystąpił nieoczekiwany błąd. Proszę spróbować ponownie.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
