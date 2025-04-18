import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  try {
    const session = await locals.auth?.validate();

    return new Response(
      JSON.stringify({
        session: session
          ? {
              user: session.user,
              expiresAt: session.expiresAt,
            }
          : null,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Session validation error:", error);
    return new Response(JSON.stringify({ session: null }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }
};
