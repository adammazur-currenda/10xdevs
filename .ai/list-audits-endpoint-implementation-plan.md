# API Endpoint Implementation Plan: List Audits

## 1. Przegląd punktu końcowego
Endpoint służący do pobrania listy audytów powiązanych z uwierzytelnionym użytkownikiem. Umożliwia paginację, sortowanie (opcjonalnie) oraz filtrowanie wyników, dzięki czemu użytkownik otrzymuje tylko swoje audyty.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET
- **URL:** /audits
- **Parametry zapytania:**
  - `page` (opcjonalny, domyślnie: 1) – numer strony wyników
  - `limit` (opcjonalny, domyślnie: 10) – liczba rekordów na stronie
  - `sort` (opcjonalny) – parametr określający kolejność sortowania
- **Request Body:** Brak (GET request)

## 3. Wykorzystywane typy
- `AuditDTO` – reprezentuje pojedynczy rekord audytu
- `PaginationDTO` – zawiera informacje o paginacji (strona, limit, łączna liczba rekordów)
- `ListAuditsResponseDTO` – struktura odpowiedzi zawierająca listę audytów oraz dane paginacji

## 4. Szczegóły odpowiedzi
- **Struktura odpowiedzi:**
  ```json
  {
    "audits": [
      {
        "id": "uuid",
        "audit_order_number": "string",
        "description": "string",
        "protocol": "string",
        "summary": "string",
        "status": "string",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100
    }
  }
  ```
- **Kody statusu:**
  - 200 OK: Sukces
  - 401 Unauthorized: Brak uwierzytelnienia
  - 500 Internal Server Error: Błąd po stronie serwera

## 5. Przepływ danych
1. Żądanie trafia do endpointu `/audits`.
2. Weryfikacja uwierzytelnienia użytkownika (użycie supabase z `context.locals`).
3. Walidacja parametrów zapytania (`page`, `limit`, `sort`) przy użyciu Zod lub podobnej biblioteki.
4. Przekazanie zapytania do warstwy serwisowej (np. `auditService.ts`), która wykonuje zapytanie do bazy danych filtrując wyniki wg `user_id`.
5. Zastosowanie paginacji i opcjonalnego sortowania w zapytaniu do bazy.
6. Formatowanie wyników zgodnie z `ListAuditsResponseDTO`.
7. Zwrot odpowiedzi w formacie JSON.

## 6. Względy bezpieczeństwa
- Weryfikacja, że użytkownik jest uwierzytelniony przy każdym żądaniu.
- Walidacja i sanityzacja parametrów zapytania, aby zapobiec atakom typu SQL Injection i innym nieprawidłowym danym wejściowym.
- Ograniczenie wyników do audytów powiązanych z danym użytkownikiem (filtracja wg `user_id`).
- Używanie zapytań przygotowanych lub ORM zapewniających bezpieczeństwo przy interakcji z bazą danych.

## 7. Obsługa błędów
- **401 Unauthorized:** Zwracać w przypadku braku uwierzytelnienia.
- **400 Bad Request:** Zwracać w przypadku niepoprawnych lub brakujących parametrów wejściowych.
- **500 Internal Server Error:** Zwracać w przypadku błędów wewnętrznych serwera oraz nieoczekiwanych wyjątków. Warto rejestrować szczegóły błędów do systemu logowania.

## 8. Rozważania dotyczące wydajności
- Użycie indeksów (np. na kolumnach `user_id` i `created_at`) w tabeli `audits`, aby zoptymalizować wyszukiwanie.
- Optymalizacja zapytań bazodanowych poprzez pobieranie wyłącznie niezbędnych pól.
- Rozważenie wprowadzenia mechanizmu cache, jeśli endpoint jest często wywoływany.
- Efektywna implementacja paginacji przy użyciu LIMIT i OFFSET.

## 9. Etapy wdrożenia
1. Utworzenie nowej ścieżki endpointu `/audits` przy użyciu Astro API routes.
2. Implementacja weryfikacji uwierzytelnienia użytkownika oraz walidacji parametrów zapytania.
3. Przeniesienie logiki biznesowej do dedykowanego serwisu (np. `audit.service.ts`).
4. Wykonanie zapytania do bazy danych poprzez Supabase, filtrując po `user_id` i stosując paginację oraz sortowanie.
5. Formatowanie wyników zgodnie ze strukturą `ListAuditsResponseDTO`.
6. Implementacja kompleksowej obsługi błędów i logowania błędów.