/// <reference types="astro/client" />
import type { SupabaseClient, Session } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

declare namespace App {
  interface Locals {
    supabase: SupabaseClient<Database>;
    auth: {
      session: Session | null;
      validate: () => Promise<Session | null>;
    };
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
