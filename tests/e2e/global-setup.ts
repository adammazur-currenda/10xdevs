import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient;

async function globalSetup() {
  // Inicjalizacja klienta Supabase dla środowiska testowego
  supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!, {
    auth: {
      persistSession: false,
    },
  });

  // Czyszczenie i przygotowanie bazy danych przed testami
  await cleanupDatabase();
  await seedTestData();
}

async function cleanupDatabase() {
  // Tutaj dodaj logikę czyszczenia bazy danych
  // Na przykład:
  const { error: deleteError } = await supabase.from("users").delete().neq("id", process.env.E2E_USERNAME_ID);

  if (deleteError) {
    console.error("Error cleaning up database:", deleteError);
    throw deleteError;
  }
}

async function seedTestData() {
  // Tutaj dodaj logikę seedowania danych testowych
  // Na przykład:
  const { error: insertError } = await supabase.from("users").upsert([
    {
      id: process.env.E2E_USERNAME_ID,
      email: process.env.E2E_USERNAME,
      // Nie przechowujemy hasła w bazie, tylko hash
      // W prawdziwej aplikacji użyj bcrypt lub podobnej biblioteki
      password_hash: process.env.E2E_PASSWORD,
    },
  ]);

  if (insertError) {
    console.error("Error seeding test data:", insertError);
    throw insertError;
  }
}

export default globalSetup;
