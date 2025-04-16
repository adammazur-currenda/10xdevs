# Plan implementacji widoku Tworzenia Audytu

## 1. Przegląd
Widok ten służy do tworzenia nowych zleceń audytów IT. Umożliwia użytkownikowi wprowadzenie numeru zlecenia, opisu (opcjonalnie) oraz szczegółowego protokołu audytu. Kluczową funkcjonalnością jest możliwość wygenerowania podsumowania protokołu za pomocą AI, edycja obu pól (protokołu i podsumowania) oraz finalne zatwierdzenie audytu, co przełącza go w tryb tylko do odczytu. Widok wykorzystuje komponenty React osadzone w stronie Astro.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką `/audits/new`.

## 3. Struktura komponentów
```
src/pages/audits/new.astro
└── src/components/CreateAuditForm.tsx (client:load)
    ├── src/components/ui/Input.tsx (dla numeru zlecenia)
    ├── src/components/ui/Textarea.tsx (dla opisu)
    ├── src/components/ui/Textarea.tsx (dla protokołu)
    ├── src/components/ui/Textarea.tsx (dla podsumowania, początkowo disabled)
    ├── src/components/ui/Button.tsx (Generuj podsumowanie)
    ├── src/components/ui/Button.tsx (Zapisz - obsługa tworzenia audytu)
    └── src/components/ui/Button.tsx (Zatwierdź - obsługa zatwierdzania audytu)
```

## 4. Szczegóły komponentów
### `CreateAuditForm.tsx`
- **Opis komponentu:** Główny komponent formularza, zarządzający stanem danych audytu, obsługujący interakcje użytkownika (wprowadzanie danych, kliknięcia przycisków), walidację oraz komunikację z API. Renderuje pola formularza i przyciski akcji.
- **Główne elementy:** Komponenty `Input` i `Textarea` z `shadcn/ui` dla pól formularza, `Button` dla akcji (generowanie podsumowania, zapis, zatwierdzenie). Logika zarządzania stanem formularza, walidacji i wywołań API.
- **Obsługiwane interakcje:**
    - Wprowadzanie danych w polach: `audit_order_number`, `description`, `protocol`.
    - Edycja pola `summary` po wygenerowaniu.
    - Kliknięcie przycisku "Generuj podsumowanie": wywołuje API `/audits/generate-summary`. Wyświetla stan ładowania.
    - Kliknięcie przycisku "Zapisz": wywołuje API `POST /audits`.
    - Kliknięcie przycisku "Zatwierdź": wywołuje API `POST /audits/{id}/approve` (przycisk dostępny po zapisaniu audytu).
- **Obsługiwana walidacja:**
    - `audit_order_number`: wymagane, długość 2-20 znaków.
    - `protocol`: wymagane, długość 1000-10000 znaków.
    - `description`: opcjonalne.
    - `summary`: generowane, edytowalne.
    - Walidacja wykonywana po stronie klienta przed wysłaniem do API. Wyświetlanie komunikatów o błędach przy polach.
- **Typy:**
    - `CreateAuditFormViewModel` (opisany w sekcji Typy)
    - `CreateAuditCommand` (z `src/types.ts`)
    - `GenerateSummaryRequestDTO` (z `src/types.ts`)
    - `GenerateSummaryResponseDTO` (z `src/types.ts`)
    - `ApproveAuditCommand` (z `src/types.ts`)
    - `AuditDTO` (z `src/types.ts` - dla odpowiedzi z API)
- **Propsy:** Brak (komponent strony).

### Komponenty UI (`Input.tsx`, `Textarea.tsx`, `Button.tsx`)
- Są to standardowe komponenty z biblioteki `shadcn/ui`, dostosowane do potrzeb projektu (jeśli konieczne). Będą przyjmować standardowe propsy HTML oraz dodatkowe propsy do obsługi stanu (np. `disabled`, `loading` dla przycisku) i walidacji (np. `error`).

## 5. Typy
- **`CreateAuditFormViewModel`**: Niestandardowy typ ViewModel do zarządzania stanem formularza w komponencie `CreateAuditForm.tsx`.
  ```typescript
  interface CreateAuditFormViewModel {
    id: string | null; // ID audytu po zapisaniu, null dla nowego
    audit_order_number: string;
    description: string;
    protocol: string;
    summary: string;
    status: 'pending' | 'approved' | 'new'; // 'new' przed pierwszym zapisem
    isLoadingSummary: boolean; // Stan ładowania dla generowania podsumowania
    isSaving: boolean; // Stan ładowania dla zapisu/zatwierdzania
    errors: { // Błędy walidacji dla poszczególnych pól
      audit_order_number?: string;
      protocol?: string;
      // inne błędy np. z API
    };
  }
  ```
- Istniejące typy DTO/Command z `src/types.ts` będą wykorzystane zgodnie z ich przeznaczeniem: `AuditDTO`, `CreateAuditCommand`, `GenerateSummaryRequestDTO`, `GenerateSummaryResponseDTO`, `ApproveAuditCommand`.

## 6. Zarządzanie stanem
- Stan formularza (`CreateAuditFormViewModel`) będzie zarządzany lokalnie w komponencie `CreateAuditForm.tsx` za pomocą hooka `useState` lub `useReducer` z React.
- Stan ładowania (`isLoadingSummary`, `isSaving`) będzie używany do wyświetlania wskaźników ładowania i blokowania przycisków podczas operacji API.
- Stan błędów (`errors`) będzie aktualizowany na podstawie wyników walidacji klienta i odpowiedzi błędów z API.
- Nie przewiduje się potrzeby tworzenia dedykowanego customowego hooka na tym etapie, chyba że logika stanu stanie się zbyt skomplikowana.

## 7. Integracja API
- **Tworzenie audytu:**
    - Akcja: Kliknięcie przycisku "Zapisz".
    - Metoda/URL: `POST /audits`
    - Typy:
        - Request Body: `CreateAuditCommand` (`{ audit_order_number, protocol, description }`)
        - Response Body (Success 201): `AuditDTO`
    - Logika: Po pomyślnym utworzeniu, zaktualizować stan formularza (`id`, `status`, `created_at` itp.) na podstawie odpowiedzi. Przycisk "Zatwierdź" staje się aktywny.
- **Generowanie podsumowania:**
    - Akcja: Kliknięcie przycisku "Generuj podsumowanie".
    - Metoda/URL: `POST /audits/generate-summary`
    - Typy:
        - Request Body: `GenerateSummaryRequestDTO` (`{ protocol }`)
        - Response Body (Success 200): `GenerateSummaryResponseDTO` (`{ summary }`)
    - Logika: Wysłać `protocol` z aktualnego stanu formularza. Wyświetlić stan ładowania. Po otrzymaniu odpowiedzi zaktualizować pole `summary` w stanie formularza. Pole `summary` staje się edytowalne.
- **Zatwierdzanie audytu:**
    - Akcja: Kliknięcie przycisku "Zatwierdź" (dostępny po zapisaniu audytu).
    - Metoda/URL: `POST /audits/{id}/approve` (gdzie `{id}` to ID zapisanego audytu ze stanu).
    - Typy:
        - Request Body: `ApproveAuditCommand` (może być pusty lub `{ confirm: true }`)
        - Response Body (Success 200): `AuditDTO` (z zaktualizowanym statusem)
    - Logika: Wywołać API. Po pomyślnym zatwierdzeniu, zaktualizować stan formularza (`status` na 'approved') i przełączyć formularz w tryb tylko do odczytu (blokada pól i przycisków edycji/zapisu/generowania).

## 8. Interakcje użytkownika
- **Wprowadzanie danych:** Użytkownik wpisuje wartości w polach `audit_order_number`, `description`, `protocol`. Stan komponentu jest aktualizowany na bieżąco. Walidacja inline może wyświetlać błędy po utracie fokusu lub podczas wpisywania.
- **Generowanie podsumowania:** Po kliknięciu "Generuj podsumowanie", przycisk jest blokowany, wyświetlany jest wskaźnik ładowania. Po zakończeniu, pole `summary` jest wypełniane i odblokowywane do edycji.
- **Zapisywanie audytu:** Po kliknięciu "Zapisz", przycisk jest blokowany, wyświetlany jest wskaźnik ładowania. Po zapisie, formularz pozostaje edytowalny, ale pojawia się ID audytu w stanie, a przycisk "Zatwierdź" staje się dostępny.
- **Zatwierdzanie audytu:** Po kliknięciu "Zatwierdź", przycisk jest blokowany, wyświetlany jest wskaźnik ładowania. Po zatwierdzeniu, wszystkie pola formularza i przyciski (poza np. nawigacją "Wstecz") stają się nieaktywne (tryb read-only).

## 9. Warunki i walidacja
- **`audit_order_number`**: Wymagane. Długość musi być między 2 a 20 znaków. Weryfikacja po stronie klienta przed wysłaniem `POST /audits`. Komunikat o błędzie wyświetlany przy polu.
- **`protocol`**: Wymagane. Długość musi być między 1000 a 10000 znaków. Weryfikacja po stronie klienta przed wysłaniem `POST /audits` oraz `POST /audits/generate-summary`. Komunikat o błędzie wyświetlany przy polu. Przycisk "Generuj podsumowanie" jest nieaktywny, jeśli protokół nie spełnia wymagań długości.
- **Przycisk "Generuj podsumowanie"**: Aktywny tylko, gdy pole `protocol` zawiera tekst o długości między 1000 a 10000 znaków i audyt nie jest zatwierdzony (`status !== 'approved'`).
- **Przycisk "Zapisz"**: Aktywny tylko, gdy formularz jest poprawnie zwalidowany (`audit_order_number` i `protocol` spełniają warunki) i audyt nie jest zatwierdzony (`status !== 'approved'`).
- **Przycisk "Zatwierdź"**: Aktywny tylko, gdy audyt został już zapisany (posiada `id` w stanie) i nie jest jeszcze zatwierdzony (`status === 'pending'`).
- **Pola formularza**: Wszystkie pola (`Input`, `Textarea`) są `disabled`, gdy `status === 'approved'`. Pole `summary` jest `disabled` przed pierwszym wygenerowaniem podsumowania oraz gdy `status === 'approved'`.

## 10. Obsługa błędów
- **Błędy walidacji klienta:** Wyświetlanie komunikatów o błędach bezpośrednio przy polach formularza. Blokowanie przycisku "Zapisz", jeśli walidacja nie przechodzi.
- **Błędy API (np. 400 Bad Request):**
    - Dla `POST /audits`: Wyświetlić ogólny komunikat o błędzie (np. w komponencie Toast/Alert) lub, jeśli API zwraca szczegółowe błędy walidacji, spróbować przypisać je do odpowiednich pól w stanie `errors`.
    - Dla `POST /audits/generate-summary`: Wyświetlić komunikat o błędzie (np. "Nie udało się wygenerować podsumowania. Spróbuj ponownie.") w komponencie Toast/Alert. Zresetować stan `isLoadingSummary`.
    - Dla `POST /audits/{id}/approve`: Wyświetlić komunikat o błędzie (np. "Nie udało się zatwierdzić audytu.") w komponencie Toast/Alert. Zresetować stan `isSaving`.
- **Błędy sieciowe / 500 Internal Server Error:** Wyświetlić ogólny komunikat o błędzie (np. "Wystąpił błąd serwera. Spróbuj ponownie później.") w komponencie Toast/Alert. Zresetować stany ładowania.
- **401 Unauthorized:** Przekierować użytkownika do strony logowania lub wyświetlić odpowiedni komunikat. Middleware Astro powinien obsłużyć to globalnie.
- **403 Forbidden (dla Approve):** Wyświetlić komunikat wyjaśniający, dlaczego akcja nie jest dozwolona (np. "Audyt został już zatwierdzony.").
- **Loading States:** Zapewnić wyraźne wskaźniki ładowania (np. spinner w przyciskach) podczas operacji API, aby poinformować użytkownika o trwającym procesie.

## 11. Kroki implementacji
1. **Utworzenie pliku strony Astro:** Stworzyć plik `src/pages/audits/new.astro`.
2. **Implementacja komponentu `CreateAuditForm.tsx`:**
    - Zdefiniować strukturę JSX z wykorzystaniem komponentów `Input`, `Textarea`, `Button` z `shadcn/ui`.
    - Zaimplementować zarządzanie stanem za pomocą `useState` lub `useReducer`, używając typu `CreateAuditFormViewModel`.
    - Dodać logikę walidacji po stronie klienta (np. przy użyciu biblioteki Zod lub własnej logiki).
    - Zaimplementować funkcje obsługi zdarzeń `onChange` dla pól formularza.
    - Zaimplementować funkcje obsługi kliknięć przycisków (`handleGenerateSummary`, `handleSave`, `handleApprove`).
3. **Integracja API:**
    - Zaimplementować funkcje do wywoływania endpointów API (`POST /audits`, `POST /audits/generate-summary`, `POST /audits/{id}/approve`) używając `fetch` lub dedykowanej biblioteki (np. `axios` lub klienta generowanego z OpenAPI, jeśli jest dostępny).
    - Dodać obsługę stanów ładowania (`isLoadingSummary`, `isSaving`) i błędów (aktualizacja stanu `errors`, wyświetlanie komunikatów np. przez Toast).
    - Aktualizować stan komponentu na podstawie odpowiedzi z API (np. zapisanie `id` audytu, aktualizacja `summary`, zmiana `status`).
4. **Podłączenie komponentu w Astro:** W pliku `src/pages/audits/new.astro`, zaimportować i wyrenderować komponent `CreateAuditForm` z dyrektywą `client:load`.
5. **Styling i UX:**
    - Dopracować wygląd formularza zgodnie z design systemem (`shadcn/ui`, `Tailwind`).
    - Zapewnić responsywność widoku.
    - Dodać komunikaty o błędach i sukcesie (np. komponent Toast).
    - Zapewnić zgodność z WCAG AA (etykiety, focus management, kontrast).
6. **Testowanie:**
    - Przetestować ręcznie wszystkie ścieżki użytkownika (wprowadzanie danych, generowanie, zapis, zatwierdzanie).
    - Przetestować obsługę błędów walidacji i API.
    - Przetestować działanie w różnych przeglądarkach i na różnych rozmiarach ekranu.
    - Rozważyć dodanie testów jednostkowych/integracyjnych dla logiki formularza i wywołań API.
7. **Refaktoryzacja i Cleanup:** Przejrzeć kod, usunąć nieużywane zmienne/importy, poprawić czytelność. 