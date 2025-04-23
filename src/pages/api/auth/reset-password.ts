import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.server";

export const POST: APIRoute = async ({ request, cookies }) => {
  const { email } = await request.json();

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${new URL(request.url).origin}/auth/update-password`,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ message: "Password reset email sent" }), {
    status: 200,
  });
};
