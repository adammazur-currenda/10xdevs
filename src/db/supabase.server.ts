import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types";

export const cookieOptions: CookieOptionsWithName = {
  name: "sb-auth",
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    cookies: {
      get(name) {
        return context.cookies.get(name)?.value;
      },
      set(name, value, options) {
        context.cookies.set(name, value, options);
      },
      remove(name, options) {
        context.cookies.delete(name, options);
      },
    },
  });

  return supabase;
};
