/// <reference types="astro/client" />
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      auth: {
        user: User | null;
        validate: () => Promise<User | null>;
      };
    }
  }
}

declare module "astro:env/server" {
  export const SUPABASE_URL: string;
  export const SUPABASE_KEY: string;
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
