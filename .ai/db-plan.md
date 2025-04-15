# Schemat bazy danych dla MVP

## 1. Lista tabel z ich kolumnami, typami danych i ograniczeniami

This table is managed by Supabase Auth.

- **id**: UUID PRIMARY KEY
- **email**: VARCHAR(255) NOT NULL UNIQUE
- **encrypted_password**: TEXT NOT NULL
- **created_at**: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- **confirmed_at**: TIMESTAMP NULL

### Tabela: audits
- **id**: VARCHAR(20) PRIMARY KEY
- **description**: TEXT NOT NULL
- **protocol_text**: TEXT NOT NULL CHECK (char_length(protocol_text) BETWEEN 1000 AND 10000)
- **protocol_summary**: TEXT
- **status**: audit_status NOT NULL -- ENUM values: 'new', 'accepted'
- **created_at**: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
- **updated_at**: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
- **user_id**: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
  
_Uwaga_: ENUM type musi być wcześniej stworzony.

### Tabela: generations
- **id**: SERIAL PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
- **model**: VARCHAR(100) NOT NULL
- **generated_count**: INTEGER NOT NULL
- **protocol_text**: TEXT NOT NULL
- **generated_result**: TEXT NOT NULL
- **created_at**: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
- **generation_time**: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

### Tabela: generation_error_logs
- **id**: SERIAL PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
- **model**: VARCHAR(100) NOT NULL
- **protocol_text**: TEXT NOT NULL
- **error_code**: VARCHAR(50) NOT NULL
- **error_message**: TEXT NOT NULL
- **created_at**: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

## 2. Relacje między tabelami
- Tabela `audits` posiada kolumnę **user_id** (UUID) jako odniesienie do użytkownika zarządzanego przez Supabase Auth. Relacja ta jest typu jeden-do-wielu (jeden użytkownik może mieć wiele audytów).
- Tabele `generations` oraz `generation_error_logs` również zawierają kolumnę **user_id** i mają relację jeden-do-wielu z użytkownikami.
- Bezpośrednie relacje między tabelami `audits`, `generations` i `generation_error_logs` nie są definiowane.

## 3. Indeksy
- Indeks na kolumnie **user_id** w tabeli `audits`:
  ```sql
  CREATE INDEX idx_audits_user_id ON audits(user_id);
  ```
- Indeks na kolumnie **created_at** w tabeli `audits`:
  ```sql
  CREATE INDEX idx_audits_created_at ON audits(created_at);
  ```
- Opcjonalnie, indeks na kolumnie **status** w tabeli `audits`:
  ```sql
  CREATE INDEX idx_audits_status ON audits(status);
  ```
- Indeksy na kolumnie **user_id** w tabelach `generations` i `generation_error_logs`:
  ```sql
  CREATE INDEX idx_generations_user_id ON generations(user_id);
  CREATE INDEX idx_generation_error_logs_user_id ON generation_error_logs(user_id);
  ```

## 4. Zasady PostgreSQL (RLS i triggery)

### Row-Level Security (RLS)
- W tabeli `audits`:
  ```sql
  ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
  CREATE POLICY select_own_audits ON audits
      USING (user_id = current_setting('jwt.claims.user_id')::uuid);
  ```
- Podobne zasady można zastosować do tabel `generations` i `generation_error_logs`:
  ```sql
  ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
  CREATE POLICY select_own_generations ON generations
      USING (user_id = current_setting('jwt.claims.user_id')::uuid);

  ALTER TABLE generation_error_logs ENABLE ROW LEVEL SECURITY;
  CREATE POLICY select_own_generation_error_logs ON generation_error_logs
      USING (user_id = current_setting('jwt.claims.user_id')::uuid);
  ```

### Trigger dla aktualizacji pola updated_at
- Funkcja triggera:
  ```sql
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```
- Wyzwalacz na tabeli `audits`:
  ```sql
  CREATE TRIGGER trg_update_updated_at
  BEFORE UPDATE ON audits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
  ```

## 5. Dodatkowe uwagi i wyjaśnienia dotyczące decyzji projektowych
- **ENUM dla statusu audytu** musi być stworzony przed utworzeniem tabeli. Przykład tworzenia ENUM:
  ```sql
  DO $$
  BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_status') THEN
          CREATE TYPE audit_status AS ENUM ('new', 'accepted');
      END IF;
  END$$;
  ```
- Pole **user_id** we wszystkich tabelach jest typu UUID, aby zapewnić spójność z danymi uwierzytelniania Supabase Auth.
- Wszystkie znaczniki czasu są przechowywane jako `TIMESTAMP WITH TIME ZONE` dla zachowania informacji o strefach czasowych.
- Schemat jest zaprojektowany zgodnie z zasadami normalizacji (3NF) oraz zoptymalizowany poprzez indeksy i polityki RLS, co zapewnia bezpieczeństwo i wydajność operacji. 