import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.server";

// Lista ścieżek publicznych
const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/auth/reset-password"];
// Lista ścieżek API, które nie wymagają przekierowania
const API_PATHS = ["/api/auth/login", "/api/auth/register", "/api/auth/reset-password"];

export const onRequest = defineMiddleware(async ({ cookies, request, redirect, locals }, next) => {
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = new URL(request.url);
  const isPublicPath = PUBLIC_PATHS.includes(url.pathname);
  const isApiPath = url.pathname.startsWith("/api/");

  // Dodaj informacje o sesji i instancję Supabase do locals
  locals.supabase = supabase;
  locals.auth = {
    session,
    validate: async () => session,
  };

  // Dla ścieżek API nie robimy przekierowania, tylko zwracamy błąd 401
  if (isApiPath && !API_PATHS.includes(url.pathname) && !session) {
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
  if (session && isPublicPath) {
    return redirect("/audits");
  }

  // Przekieruj niezalogowanych użytkowników do logowania dla chronionych ścieżek
  if (!session && !isPublicPath && !isApiPath) {
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
});
