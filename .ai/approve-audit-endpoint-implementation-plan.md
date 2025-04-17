# API Endpoint Implementation Plan: Approve Audit

## 1. Przegląd punktu końcowego
Endpoint służy do zatwierdzenia audytu, ustawiając jego status na \"approved\" i przechodząc tym samym do stanu tylko do odczytu. Umożliwia to uniemożliwienie dalszych modyfikacji zatwierdzonego audytu.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** `/audits/{id}/approve`
- **Parametry:**
  - **Wymagane:**
    - `id` – identyfikator audytu (UUID) podany w ścieżce URL
  - **Opcjonalne:**
    - `confirm` – flaga potwierdzająca zatwierdzenie, przekazywana w ciele żądania (typ: boolean)
- **Request Body:**
  - Może być pusty lub zawierać strukturę zgodną z modelem `ApproveAuditCommand` (np. `{ "confirm": true }`).

## 3. Wykorzystywane typy
- **ApproveAuditCommand:**
  - Definiuje opcjonalny parametr `confirm` (boolean).
- **AuditDTO:**
  - Reprezentuje pełny rekord audytu, w tym zaktualizowany status.

## 4. Szczegóły odpowiedzi
- **Struktura odpowiedzi:** Zwracany jest zaktualizowany rekord audytu z polem `status` ustawionym na wartość \"approved\".
- **Kody statusu:**
  - 200 OK – operacja zakończona sukcesem
  - 403 Forbidden – audyt już zatwierdzony lub w nieprawidłowym stanie
  - 401 Unauthorized – brak autoryzacji
  - 404 Not Found – audyt nie został odnaleziony
  - 500 Internal Server Error – błąd po stronie serwera

## 5. Przepływ danych
1. **Autoryzacja:** Upewnić się, że użytkownik jest autoryzowany (sprawdzenie sesji/supabase z `supabase.client.ts`).
2. **Pobranie audytu:** Wyszukanie audytu o podanym `id` w bazie danych przy użyciu klienta Supabase.
3. **Walidacja stanu:** Sprawdzenie, czy audyt nie jest już zatwierdzony.
4. **Aktualizacja:** Zaktualizowanie rekordu w bazie danych, ustawiając pole `status` na \"approved\". Opcjonalnie, w zależności od parametru `confirm`.
5. **Odpowiedź:** Zwrócenie zaktualizowanego rekordu audytu w formacie DTO.

## 6. Względy bezpieczeństwa
- **Autoryzacja:** Weryfikacja sesji użytkownika i uprawnień do modyfikacji danego audytu.
- **Walidacja danych:** Użycie bibliotek takich jak Zod do walidacji danych wejściowych.
- **Kontrola stanu:** Zabezpieczenie przed ponownym zatwierdzeniem audytu (zapobieganie nieuczciwym przejściom stanów).
- **Bezpieczeństwo bazy:** Ochrona przed SQL Injection dzięki użyciu klienta Supabase i bezpiecznych zapytań.

## 7. Obsługa błędów
- **403 Forbidden:** Gdy audyt jest już zatwierdzony lub znajduje się w nieprawidłowym stanie umożliwiającym zatwierdzenie.
- **401 Unauthorized:** Brak autoryzacji użytkownika.
- **404 Not Found:** Nie znaleziono audytu o podanym identyfikatorze.
- **500 Internal Server Error:** Ogólne błędy serwera i nieoczekiwane wyjątki.

## 8. Rozważania dotyczące wydajności
- Endpoint jest operacją niskoczęstą, dlatego wymagania wydajnościowe są umiarkowane.
- Zapewnienie optymalnych zapytań do bazy danych oraz indeksów na kluczowych kolumnach (np. `id`, `status`).
- Potencjalne strategie cachingowe nie są niezbędne, ale warto monitorować czas odpowiedzi przy zwiększonym obciążeniu.

## 9. Etapy wdrożenia
1. **Utworzenie ścieżki endpointa:** Utworzenie pliku np. w `src/pages/api/audits/[id]/approve.ts`.
2. **Walidacja wejścia:** Implementacja walidacji danych wejściowych przy użyciu Zod (sprawdzenie struktury ciała żądania).
3. **Autoryzacja:** Integracja mechanizmu weryfikacji użytkownika używając `supabase.client.ts`.
4. **Logika biznesowa:** Przeniesienie logiki zatwierdzania audytu do dedykowanej warstwy serwisów (np. `AuditService`).
5. **Interakcje z bazą danych:** Pobranie audytu, sprawdzenie jego stanu i aktualizacja rekordu w bazie danych.
6. **Obsługa błędów:** Implementacja obsługi błędów i logowania wszelkich wyjątków.
7. **Testy:** Napisanie testów jednostkowych i e2e, aby upewnić się, że endpoint działa zgodnie z oczekiwaniami.
8. **Dokumentacja:** Zaktualizowanie dokumentacji API i komunikacja zmian zespołowi. 