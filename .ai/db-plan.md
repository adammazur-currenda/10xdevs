# Schemat bazy danych PostgreSQL - MVP

## 1. Tabele

Table `users` is managed by Supabase Auth and is already created.
### Tabela: users
- id: UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- email: TEXT NOT NULL UNIQUE
- encrypted_password: TEXT NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- confirmed_at: TIMESTAMPTZ

### Tabela: audits
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- audit_order_number: VARCHAR(20) NOT NULL
  CONSTRAINT chk_audit_order_number_length CHECK (char_length(audit_order_number) BETWEEN 2 AND 20)
- description: TEXT
- protocol: TEXT NOT NULL
  CONSTRAINT chk_protocol_length CHECK (char_length(protocol) BETWEEN 1000 AND 10000)
- summary: TEXT
- status: TEXT NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE

## 2. Relacje między tabelami
- Relacja jeden-do-wielu między `users` i `audits`: Jeden użytkownik może mieć wiele audytów, ale każdy audyt należy wyłącznie do jednego użytkownika.

## 3. Indeksy
- Unikalny indeks na kolumnie `audit_order_number` (zdefiniowany jako PRIMARY KEY).
- Indeks na kolumnie `user_id` w tabeli `audits` (dla przyspieszenia zapytań filtrujących audyty według użytkownika).

## 4. Zasady PostgreSQL (RLS)
```sql
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY audits_rls_policy ON audits
    FOR ALL
    USING (user_id = auth.uid());
```

## 5. Dodatkowe uwagi
- Schemat zakłada, że identyfikatory użytkowników są zarządzane przez Supabase przy użyciu UUID.
- Kolumna `audit_order_number` jest nieedytowalna i pełni rolę unikalnego identyfikatora audytu.
- Aktualizacja kolumny `updated_at` powinna być realizowana za pomocą wyzwalacza przy modyfikacji rekordu. 