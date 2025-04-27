import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types";

if (!import.meta.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is not defined");
}

if (!import.meta.env.SUPABASE_KEY) {
  throw new Error("SUPABASE_KEY is not defined");
}

const SUPABASE_URL = import.meta.env.SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.SUPABASE_KEY;

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
}

export const createSupabaseServerInstance = (context: SupabaseContext) => {
  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
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
