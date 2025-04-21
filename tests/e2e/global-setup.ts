import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Upewniamy się, że zmienne są ładowane z .env.test
dotenv.config({ path: ".env.test" });

let supabase: SupabaseClient;

async function globalSetup() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const userId = process.env.E2E_USERNAME_ID;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing required environment variables: SUPABASE_URL or SUPABASE_KEY");
  }

  if (!userId) {
    throw new Error("Missing required environment variable: E2E_USERNAME_ID");
  }

  // Inicjalizacja klienta Supabase dla środowiska testowego
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });

  // Czyszczenie i przygotowanie bazy danych przed testami
  await cleanupDatabase(userId);
}

async function cleanupDatabase(userId: string) {
  // Czyścimy dane testowe przed uruchomieniem testów
  const { error: deleteError } = await supabase.from("audits").delete().eq("user_id", userId);

  if (deleteError) {
    console.error("Error cleaning up database:", deleteError);
    throw deleteError;
  }
}

export default globalSetup;
