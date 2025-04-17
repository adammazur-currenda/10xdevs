# API Endpoint Implementation Plan: Get Audit Details

## 1. Przegląd punktu końcowego
This endpoint is designed to retrieve audit details for a specific audit owned by the authenticated user. It ensures that only the owner of the audit can access its details.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET
- **Struktura URL:** /audits/{id}
- **Parametry:**
  - **Wymagane:**
    - `id`: Audit UUID (path parameter)
  - **Opcjonalne:** None
- **Request Body:** None

## 3. Wykorzystywane typy
- **DTO:** `GetAuditResponseDTO` (alias for `AuditDTO`), which includes:
  - id: UUID
  - audit_order_number: string
  - description: string
  - protocol: string
  - summary: string
  - status: string
  - created_at: timestamp
  - updated_at: timestamp
  - user_id: UUID
- **Command Models:** None (GET operations do not require a command model)

## 4. Szczegóły odpowiedzi
- **Sukces (200 OK):**
  ```json
  {
    "id": "uuid",
    "audit_order_number": "string",
    "description": "string",
    "protocol": "string",
    "summary": "string",
    "status": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "user_id": "uuid"
  }
  ```
- **Błędy:**
  - 401 Unauthorized: Jeśli użytkownik nie jest uwierzytelniony.
  - 404 Not Found: Jeśli audyt nie istnieje lub nie należy do użytkownika.
  - 400 Bad Request: Jeśli podany identyfikator nie jest poprawnym UUID.
  - 500 Internal Server Error: W przypadku niespodziewanych błędów.

## 5. Przepływ danych
1. Odebranie żądania i wyodrębnienie parametru `id` z URL.
2. Walidacja formatu `id` jako poprawnego UUID (np. za pomocą Zod).
3. Weryfikacja sesji uwierzytelniającej przy użyciu mechanizmu dostępnego w `context.locals` (np. Supabase).
4. Wywołanie funkcji serwisowej (np. `getAuditDetails`) w celu pobrania rekordu audytu z bazy danych, przy czym dodatkowo filtrowany jest po `user_id` równym identyfikatorowi sesji.
5. Zwrócenie danych audytu w formacie JSON przy sukcesie (200 OK).
6. Jeśli audyt nie zostanie znaleziony, zwrócenie błędu 404 Not Found.

## 6. Względy bezpieczeństwa
- **Uwierzytelnienie:** Endpoint musi być dostępny tylko dla uwierzytelnionych użytkowników. Wykorzystanie middleware lub sprawdzenie sesji z `context.locals`.
- **Autoryzacja:** Zweryfikowanie, że `user_id` rekordu audytu odpowiada identyfikatorowi zalogowanego użytkownika.
- **Walidacja:** Użycie schematu (np. Zod) do walidacji poprawności formatu UUID.
- **Logowanie błędów:** Mechanizm logowania nieprawidłowych prób dostępu i innych krytycznych błędów.

## 7. Obsługa błędów
- **400 Bad Request:** Jeśli `id` nie jest poprawnym UUID, zwrócić opisowy komunikat błędu.
- **401 Unauthorized:** Jeśli użytkownik nie jest uwierzytelniony, zwrócić ten kod oraz komunikat o braku autoryzacji.
- **404 Not Found:** Jeśli audyt nie został znaleziony lub nie należy do użytkownika.
- **500 Internal Server Error:** W przypadku niespodziewanych błędów; logować błąd dla dalszej analizy.

## 8. Rozważania dotyczące wydajności
- Upewnić się, że zapytanie do tabeli `audits` jest zoptymalizowane (indeksy na `id` i `user_id`).
- Rozważyć zastosowanie cache'owania dla żądań o wysokiej częstotliwości, przy jednoczesnym dbaniu o poprawność danych.
- Wykorzystać wydajność zapytań oferowaną przez Supabase.

## 9. Etapy wdrożenia
1. Utworzyć nowy plik endpointu API, np. `src/pages/api/audits/[id].ts`.
2. Implementować walidację parametru `id` (np. przez Zod) i zwracanie błędu 400 w przypadku niepoprawnego formatu.
3. Zaimplementować middleware uwierzytelniające, weryfikujące sesję użytkownika (używając `context.locals`).
4. Utworzyć lub rozbudować funkcję serwisową (np. `getAuditDetails` w `src/lib/services/audit.service.ts`), która:
   - Pobierze rekord z tabeli `audits` filtrując po `id` oraz `user_id` zgodnym z zalogowanym użytkownikiem.
   - Zwróci szczegóły audytu lub wskaże, że rekord nie istnieje.
5. Zagwarantować, że odpowiedź API zwraca dane audytu zgodnie z wymaganym schematem przy sukcesie (200 OK).
6. Ustalić obsługę błędów, zwracając odpowiednie kody: 401, 404, 400, oraz 500.
7. Napisać testy jednostkowe i integracyjne, obejmujące scenariusze: prawidłowego pobrania audytu, próby dostępu przez nieautoryzowanego użytkownika, podania nieprawidłowego `id` oraz braku rekordu.
8. Dokonać przeglądu kodu wraz z zespołem i przeprowadzić testy end-to-end w środowisku testowym.
9. Wdrożyć zmiany na środowisko staging oraz monitorować logi i wydajność endpointu. 