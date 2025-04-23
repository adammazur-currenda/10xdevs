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

interface SupabaseContext {
  headers: Headers;
  cookies: AstroCookies;
  env?: {
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    OPENROUTER_API_KEY?: string;
  };
}

export const createSupabaseServerInstance = (context: SupabaseContext) => {
  const supabaseUrl = context.env?.SUPABASE_URL ?? import.meta.env.SUPABASE_URL;
  const supabaseKey = context.env?.SUPABASE_KEY ?? import.meta.env.SUPABASE_KEY;

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
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
