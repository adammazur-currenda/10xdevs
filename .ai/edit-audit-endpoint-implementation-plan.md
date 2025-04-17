# API Endpoint Implementation Plan: Update Audit Endpoint

## 1. Przegląd punktu końcowego
Punkt końcowy umożliwia aktualizację audytu, pod warunkiem, że audyt nie został zatwierdzony. Endpoint pozwala na modyfikację pól `protocol`, `description` oraz `summary`, przy czym pole `audit_order_number` pozostaje niezmienne.

## 2. Szczegóły żądania
- **Metoda HTTP:** PATCH
- **Struktura URL:** /audits/{id}
- **Parametry:**
  - **Path Parameter:** 
    - id (UUID) – identyfikator audytu do aktualizacji.
- **Request Body:** 
  - Zawiera pola:
    - `protocol` (string, wymaga wartości o długości od 1000 do 10000 znaków)
    - `description` (string, opcjonalne)
    - `summary` (string, opcjonalne)

## 3. Wykorzystywane typy
- **DTOs i Command Modele:**
  - `AuditDTO` – reprezentacja audytu.
  - `UpdateAuditCommand` – model komendy aktualizacji, zawierający pola: `protocol`, `description`, `summary`.
  - `GetAuditResponseDTO` – typ odpowiedzi przy pobieraniu szczegółów audytu.

## 4. Szczegóły odpowiedzi
- **Kod Stanu:** 200 OK przy sukcesie.
- **Struktura Odpowiedzi:** Zwraca zaktualizowane dane audytu w strukturze analogicznej do GET endpointu.
- **Kody błędów:**
  - `400 Bad Request` – nieprawidłowe dane wejściowe.
  - `401 Unauthorized` – brak autoryzacji.
  - `403 Forbidden` – audyt został zatwierdzony i nie może być aktualizowany.
  - `404 Not Found` – audyt nie został znaleziony.
  - `500 Internal Server Error` – błąd po stronie serwera.

## 5. Przepływ danych
1. Klient wysyła żądanie PATCH do `/audits/{id}` z odpowiednim `id` oraz danymi w ciele żądania.
2. Żądanie przechodzi przez middleware uwierzytelniające oraz autoryzacyjne.
3. Walidacja danych wejściowych przy użyciu Zod, korzystając ze schematu odpowiadającego `UpdateAuditCommand`.
4. Sprawdzenie, czy audyt istnieje w bazie danych oraz czy nie jest zatwierdzony (np. poprzez sprawdzenie pola `status`).
5. Ignorowanie lub odrzucenie próby modyfikacji pola `audit_order_number`.
6. Aktualizacja pól `protocol`, `description` i `summary` w bazie danych.
7. Zwrócenie zaktualizowanej reprezentacji audytu jako odpowiedź.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie i autoryzacja:** Walidacja tokena sesji lub innego mechanizmu autoryzacji (np. Supabase Auth).
- **Weryfikacja właściciela audytu:** Upewnienie się, że tylko właściciel audytu lub użytkownik z odpowiednimi uprawnieniami może dokonać aktualizacji.
- **Ochrona przed modyfikacją niezmiennych pól:** Zapewnienie, że pole `audit_order_number` nie zostanie zmodyfikowane nawet, jeśli pojawi się w żądaniu.
- **Walidacja danych wejściowych:** Użycie Zod do sprawdzania długości i formatu danych, zgodnie z constraintami bazy.

## 7. Obsługa błędów
- **400 Bad Request:** W przypadku nieprawidłowych danych wejściowych lub złamania constraintów.
- **401 Unauthorized:** Gdy użytkownik nie jest uwierzytelniony.
- **403 Forbidden:** Gdy audyt został zatwierdzony i nie można go modyfikować.
- **404 Not Found:** Gdy podany audyt nie istnieje w bazie danych.
- **500 Internal Server Error:** W przypadku nieprzewidzianych błędów serwerowych.
- Logowanie wszystkich błędów wraz z kontekstem operacji dla ułatwienia diagnostyki.

## 8. Rozważania dotyczące wydajności
- **Indeksowanie:** Upewnić się, że kolumny `id` i `user_id` są odpowiednio indeksowane.
- **Optymalizacja zapytań:** Grupowanie operacji aktualizacyjnych w jednym zapytaniu, aby zmniejszyć obciążenie bazy.
- **Caching (opcjonalnie):** Rozważenie mechanizmów cache'owania dla danych audytu, przy jednoczesnym zachowaniu aktualności danych.
- **Szybka walidacja:** Walidacja danych wejściowych przed wykonaniem zapytań do bazy.

## 9. Etapy wdrożenia
1. Utworzenie schematu walidacji danych wejściowych przy użyciu Zod zgodnie ze specyfikacją `UpdateAuditCommand`.
2. Implementacja middleware odpowiedzialnego za uwierzytelnianie i autoryzację, jeśli nie jest jeszcze dostępne.
3. Rozbudowa lub stworzenie funkcji serwisowej:
   - Sprawdzenie istnienia audytu oraz weryfikacja, czy nie jest zatwierdzony.
   - Zapewnienie, że pole `audit_order_number` nie zostanie zmodyfikowane.
4. Modyfikacja endpointu w Astro (np. `src/pages/api/audits/[id].ts`):
   - Dodanie logiki wywołującej odpowiednią funkcję serwisową.
   - Obsługa walidacji oraz przekazywanie komunikatów o błędach.
5. Testowanie jednostkowe i integracyjne:
   - Testy pozytywne: poprawna aktualizacja audytu.
   - Testy negatywne: próby aktualizacji audytu zatwierdzonego, nieprawidłowe dane, brak autoryzacji, próba zmiany `audit_order_number`.
6. Przeprowadzenie code review i testów w środowisku testowym.
7. Wdrożenie na środowisko produkcyjne po pomyślnym zakończeniu testów.
8. Monitorowanie i logowanie występujących błędów w celu dalszej optymalizacji i poprawy jakości oprogramowania. 