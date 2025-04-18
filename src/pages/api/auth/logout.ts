import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.server";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Utwórz nową instancję Supabase z obsługą ciasteczek
    const supabase = createSupabaseServerInstance({
      headers: request.headers,
      cookies,
    });

    // Wyloguj użytkownika
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error during logout:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to logout",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(null, {
      status: 204,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("Unexpected error during logout:", error);
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
