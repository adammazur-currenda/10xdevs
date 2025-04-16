# API Endpoint Implementation Plan: Create a New Audit

## 1. Przegląd punktu końcowego
Celem endpointu jest stworzenie nowego rekordu audytu i powiązanie go z aktualnie uwierzytelnionym użytkownikiem. Po przesłaniu prawidłowo sformułowanego żądania, rekord zostanie zapisany w tabeli `audits` z automatycznie generowanymi polami (id, created_at, updated_at) oraz polami status ustawionym na "pending" i pustym polem `summary`.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- URL: `/audits`
- Parametry:
  - Wymagane:
    - `audit_order_number`: string (długość od 2 do 20 znaków)
    - `protocol`: string (długość od 1000 do 10000 znaków)
  - Opcjonalne:
    - `description`: string
- Request Body:
```json
{
  "audit_order_number": "string",
  "protocol": "string",
  "description": "string (optional)"
}
```

## 3. Wykorzystywane typy
- `CreateAuditCommand` – komenda do tworzenia audytu, definiowana w `src/types.ts`.
- `AuditDTO` – DTO reprezentujące rekord audytu, które zawiera pola:
  - `id`, `audit_order_number`, `description`, `protocol`, `summary`, `status`, `created_at`, `updated_at`, `user_id`.

## 4. Szczegóły odpowiedzi
- Status odpowiedzi: 201 Created w przypadku pomyślnego utworzenia audytu.
- Struktura odpowiedzi:
```json
{
  "id": "uuid",
  "audit_order_number": "string",
  "description": "string",
  "protocol": "string",
  "summary": "",
  "status": "pending",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "user_id": "uuid"
}
```
- Kody błędów:
  - 400 Bad Request – dla błędów walidacji danych wejściowych
  - 401 Unauthorized – gdy użytkownik nie jest uwierzytelniony

## 5. Przepływ danych
1. Klient wysyła żądanie POST do `/audits` z odpowiednim payloadem.
2. Endpoint w Astro pobiera uwierzytelnionego użytkownika (np. z `context.locals` Supabase).
3. Dane wejściowe są walidowane za pomocą Zod schema, sprawdzając:
   - Długość `audit_order_number` (2-20 znaków)
   - Długość `protocol` (1000-10000 znaków)
4. Po pomyślnej walidacji, wywoływana jest logika serwisowa (np. w `src/lib/services/auditService.ts`), która wykonuje insercję rekordu do tabeli `audits`.
5. Rekord uzupełniany jest o dodatkowe pola:
   - `status`: ustawione domyślnie na "pending"
   - `summary`: puste
   - `created_at` i `updated_at` z wartością domyślną (aktualny timestamp)
6. W przypadku sukcesu, rekord jest zwracany w odpowiedzi z kodem 201 Created.

## 6. Względy bezpieczeństwa
- Endpoint musi być dostępny tylko dla użytkowników uwierzytelnionych (autoryzacja przez Supabase Auth).
- Walidacja danych wejściowych zapewnia ochronę przed atakami typu SQL Injection oraz innymi nieprawidłowymi danymi.
- Użycie supabaseClient z `context.locals` gwarantuje właściwą konfigurację połączenia z bazą danych.
- Odpowiednie zarządzanie uprawnieniami zapewnia, że użytkownik może tworzyć tylko własne audyty.

## 7. Obsługa błędów
- 400 Bad Request – dla błędów walidacji (np. niepoprawna długość `audit_order_number` lub `protocol`).
- 401 Unauthorized – gdy użytkownik nie jest uwierzytelniony.
- 500 Internal Server Error – dla nieoczekiwanych błędów serwerowych, takich jak problemy z bazą danych.
- Każdy błąd powinien być logowany, aby ułatwić diagnozę i poprawę problemów.

## 8. Rozważania dotyczące wydajności
- Walidacja wejściowych danych zanim nastąpi ew. operacja na bazie, zmniejszając obciążenie bazy przy niepoprawnych żądaniach.
- Indeksowanie pól, takich jak `user_id`, aby optymalizować zapytania dotyczące audytów powiązanych z użytkownikiem.
- Używanie odpowiednich zapytań Supabase, które są zoptymalizowane pod kątem wydajności.

## 9. Etapy wdrożenia
1. Utworzyć Zod schema w celu walidacji danych wejściowych dla `CreateAuditCommand` (sprawdzanie długości `audit_order_number` oraz `protocol`, opcjonalnie `description`).
2. Rozwinąć lub utworzyć serwis w `src/lib/services/auditService.ts` odpowiedzialny za logikę tworzenia audytu, w tym:
   - Przetwarzanie danych wejściowych
   - Walidację
   - Insercję rekordu do bazy danych przy użyciu Supabase (z `context.locals`)
3. Utworzyć endpoint API w `src/pages/api/audits.ts`:
   - Upewnić się, że tylko uwierzytelnieni użytkownicy mogą wywołać endpoint
   - Pobierać i walidować dane wejściowe
   - Wywoływać serwis tworzenia audytu
   - Zwracać odpowiedź 201 lub odpowiedni błąd
4. Zaktualizować dokumentację API oraz dodać przykłady użycia endpointu. 