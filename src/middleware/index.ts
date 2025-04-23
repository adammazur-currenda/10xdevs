import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.server";

// Lista ścieżek publicznych
const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/auth/reset-password"];
// Lista ścieżek API, które nie wymagają przekierowania
const API_PATHS = ["/api/auth/login", "/api/auth/register", "/api/auth/reset-password"];

export const onRequest = defineMiddleware(async ({ cookies, request, redirect, locals }, next) => {
  try {
    // Add runtime environment to locals
    locals.runtime = {
      env: {
        SUPABASE_URL: import.meta.env.SUPABASE_URL,
        SUPABASE_KEY: import.meta.env.SUPABASE_KEY,
        OPENROUTER_API_KEY: import.meta.env.OPENROUTER_API_KEY,
      },
    };

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
      env: locals.runtime.env,
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const url = new URL(request.url);
    const isPublicPath = PUBLIC_PATHS.includes(url.pathname);
    const isApiPath = url.pathname.startsWith("/api/");

    // Dodaj informacje o sesji i instancję Supabase do locals
    locals.supabase = supabase;
    locals.auth = {
      user,
      validate: async () => user,
    };

    // Dla ścieżek API nie robimy przekierowania, tylko zwracamy błąd 401
    if (isApiPath && !API_PATHS.includes(url.pathname) && !user) {
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

    // Przekieruj zalogowanych użytkowników z public paths na /audits
    if (user && isPublicPath) {
      return redirect("/audits");
    }

    // Przekieruj niezalogowanych użytkowników do logowania dla chronionych ścieżek
    if (!user && !isPublicPath && !isApiPath) {
      return redirect("/auth/login");
    }

    // Wywołaj następne middleware z zaktualizowanym kontekstem
    const response = await next();

    // Zwróć odpowiedź z zachowaniem nagłówków
    if (response instanceof Response) {
      return response;
    }

    // Jeśli odpowiedź nie jest instancją Response, utwórz nową odpowiedź
    return new Response(response, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Middleware error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
