# Specyfikacja Architektury Modułu Autentykacji

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1. Nowe Strony i Komponenty

#### Strony Astro (src/pages/auth/):
- `login.astro` - strona logowania
- `register.astro` - strona rejestracji
- `reset-password.astro` - strona resetowania hasła
- `update-password.astro` - strona aktualizacji hasła

#### Komponenty React (src/components/auth/):
- `LoginForm.tsx` - formularz logowania
- `RegisterForm.tsx` - formularz rejestracji
- `ResetPasswordForm.tsx` - formularz resetowania hasła
- `UpdatePasswordForm.tsx` - formularz aktualizacji hasła
- `AuthHeader.tsx` - nagłówek sekcji auth z logo i opisem
- `AuthFooter.tsx` - stopka z linkami pomocniczymi
- `AuthLayout.tsx` - wspólny layout dla stron auth
- `AuthNav.tsx` - komponent nawigacji z przyciskami logowania/wylogowania w prawym górnym rogu

### 1.2. Modyfikacje Istniejących Komponentów

#### AuditsDashboard.tsx:
- Dodanie obsługi stanu autentykacji
- Ukrycie przycisków edycji/usuwania dla niezalogowanych
- Dodanie komunikatu zachęcającego do zalogowania

#### CreateAuditForm.tsx i EditAuditForm.tsx:
- Dodanie przekierowania do /auth/login dla niezalogowanych
- Aktualizacja logiki zapisywania o identyfikator użytkownika

#### Layout.astro:
- Dodanie komponentu `AuthNav` w prawym górnym rogu
- Obsługa stanu sesji przez `locals.session`

### 1.3. Przepływ Użytkownika i Walidacja

#### Rejestracja:
1. Pola formularza:
   - Email (required, format email)
   - Hasło (min. 8 znaków, 1 wielka litera, 1 cyfra)
   - Potwierdzenie hasła
2. Walidacja:
   - Frontend: Zod schema
   - Backend: Supabase Auth constraints
3. Komunikaty błędów:
   - Zajęty email
   - Niezgodne hasła
   - Niespełnione wymagania hasła

#### Logowanie:
1. Pola formularza:
   - Email
   - Hasło
2. Walidacja:
   - Frontend: Zod schema
   - Backend: Supabase Auth
3. Komunikaty błędów:
   - Nieprawidłowe dane
   - Konto nieaktywne
   - Przekroczony limit prób

#### Reset Hasła:
1. Krok 1 - Żądanie resetu:
   - Email (walidacja formatu)
2. Krok 2 - Ustawienie nowego hasła:
   - Token (z URL)
   - Nowe hasło
   - Potwierdzenie hasła

## 2. LOGIKA BACKENDOWA

### 2.1. Endpointy API (src/pages/api/auth/)

```typescript
// Struktura endpointów
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/reset-password
POST /api/auth/update-password
GET /api/auth/session
GET /api/auth/check
```

### 2.2. Modele Danych

```typescript
// src/types.ts
interface AuthDTO {
  user: {
    id: string;
    email: string;
    created_at: string;
  };
  session: {
    access_token: string;
    expires_at: number;
  };
}

interface RegisterCommand {
  email: string;
  password: string;
  password_confirmation: string;
}

interface LoginCommand {
  email: string;
  password: string;
}

interface ResetPasswordCommand {
  email: string;
}

interface UpdatePasswordCommand {
  token: string;
  password: string;
  password_confirmation: string;
}
```

### 2.3. Walidacja i Obsługa Błędów

```typescript
// src/lib/schemas/auth.schema.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  password_confirmation: z.string()
}).refine((data) => data.password === data.password_confirmation);

// Analogiczne schematy dla pozostałych operacji
```

### 2.4. Hooki React

```typescript
// src/hooks/useSession.ts
export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await fetch('/api/auth/check').then(r => r.json());
      setSession(data);
      setLoading(false);
    };
    checkSession();
  }, []);

  return { session, loading };
};
```

### 2.5. Middleware Autentykacji

```typescript
// src/middleware/auth.ts
export const authMiddleware = defineMiddleware(async ({ locals, request }, next) => {
  const { supabase } = locals;
  const { data: { session } } = await supabase.auth.getSession();

  // Dodanie informacji o sesji do locals
  locals.session = session;
  
  // Lista ścieżek wymagających autentykacji
  const protectedPaths = [
    '/audits/new',
    '/audits/edit',
    '/api/audits/*/edit',
    '/api/audits/*/delete'
  ];

  // Lista ścieżek dostępnych tylko dla niezalogowanych
  const publicOnlyPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/reset-password'
  ];

  const url = new URL(request.url);
  const isProtectedPath = protectedPaths.some(path => 
    url.pathname.includes(path) || 
    url.pathname.match(path?.replace('*', '.*'))
  );
  const isPublicOnlyPath = publicOnlyPaths.some(path => 
    url.pathname === path
  );

  // Przekierowanie z chronionych ścieżek
  if (!session && isProtectedPath) {
    return Response.redirect('/auth/login?returnUrl=' + encodeURIComponent(url.pathname));
  }

  // Przekierowanie zalogowanych z public-only paths
  if (session && isPublicOnlyPath) {
    return Response.redirect('/audits');
  }

  return next();
});
```

### 2.6. Obsługa Wylogowania

```typescript
// src/lib/services/auth.service.ts
export class AuthService {
  [...]

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    // Czyszczenie lokalnego stanu
    window.location.href = '/audits';
  }
}
```

### 2.7. Migracja Danych

```sql
-- src/db/migrations/[timestamp]_add_user_audits_relation.sql

-- 1. Tymczasowo wyłącz RLS
ALTER TABLE audits DISABLE ROW LEVEL SECURITY;

-- 2. Dodaj NOT NULL constraint z domyślnym użytkownikiem dla istniejących rekordów
UPDATE audits 
SET user_id = (
  SELECT id FROM auth.users WHERE email = 'system@example.com'
) 
WHERE user_id IS NULL;

-- 3. Włącz z powrotem RLS
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- 4. Uproszczone polityki RLS zgodne z MVP
CREATE POLICY "public can view audits"
    ON audits FOR SELECT
    TO public
    USING (true);

CREATE POLICY "authenticated can manage own audits"
    ON audits FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

### 2.8. Serwis Audytów

```typescript
// src/lib/services/audit.service.ts
export class AuditService {
  constructor(private readonly supabase: SupabaseClient) {}

  async createAudit(command: CreateAuditCommand): Promise<AuditDTO> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create audit');
    }

    const { data, error } = await this.supabase
      .from('audits')
      .insert({
        ...command,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async listAudits(): Promise<AuditDTO[]> {
    // Brak filtrowania po user_id - wszystkie audyty są publiczne
    const { data, error } = await this.supabase
      .from('audits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async updateAudit(id: string, command: UpdateAuditCommand): Promise<AuditDTO> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to update audit');
    }

    // RLS zapewni dostęp tylko do własnych audytów
    const { data, error } = await this.supabase
      .from('audits')
      .update(command)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
```

### 2.9. Obsługa Błędów Autentykacji

```typescript
// src/lib/errors/auth.errors.ts
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

// src/middleware/error.ts
export const errorMiddleware = defineMiddleware(async ({ request }, next) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return new Response(JSON.stringify({
        error: 'Authentication required'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (error instanceof AuthorizationError) {
      return new Response(JSON.stringify({
        error: 'Access denied'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw error;
  }
});
```

## 3. SYSTEM AUTENTYKACJI

### 3.1. Konfiguracja Supabase Auth

```typescript
// src/lib/services/auth.service.ts
export class AuthService {
  constructor(private readonly supabase: SupabaseClient) {}

  async register(command: RegisterCommand): Promise<AuthDTO> {
    const { data, error } = await this.supabase.auth.signUp({
      email: command.email,
      password: command.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    // Obsługa błędów i mapowanie odpowiedzi
  }

  // Analogiczne metody dla pozostałych operacji
}
```

### 3.2. Integracja z Astro

```typescript
// src/pages/auth/callback.astro
---
import { supabase } from '../db/supabase.server';

const { searchParams } = new URL(Astro.request.url);
const code = searchParams.get('code');

if (code) {
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (!error) {
    return Astro.redirect('/audits');
  }
}

return Astro.redirect('/auth/login?error=auth_callback_error');
---
```

## 4. UWAGI IMPLEMENTACYJNE

1. Wszystkie formularze używają komponentów z src/components
2. Obsługa stanu ładowania i błędów przez komponenty Feedback
3. Persystencja sesji przez Supabase Auth
4. Automatyczne odświeżanie tokenów
5. Obsługa wylogowania przy wygaśnięciu sesji
6. Responsywny design zgodny z Tailwind
7. Dostępność (ARIA) zgodna z wytycznymi

## 5. BEZPIECZEŃSTWO

1. CSRF protection przez Supabase
2. Sanityzacja danych wejściowych
3. Rate limiting na endpointach auth
4. Bezpieczne przechowywanie tokenów
5. Automatyczne czyszczenie sesji
6. Walidacja siły hasła
7. Logowanie prób nieudanego logowania