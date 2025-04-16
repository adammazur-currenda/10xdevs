# Plan implementacji widoku Listy Audytów (Dashboard)

## 1. Przegląd
Widok Listy Audytów (Dashboard) stanowi centralny punkt aplikacji dla zalogowanego użytkownika, umożliwiający przeglądanie wszystkich przypisanych do niego audytów. Prezentuje kluczowe informacje o audytach w formie tabelarycznej i zapewnia podstawowe akcje: filtrowanie listy, dodawanie nowego audytu, edycję istniejącego (jeśli nie jest zatwierdzony) oraz usuwanie (również tylko niezatwierdzonych audytów, po potwierdzeniu).

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką `/audits`.

## 3. Struktura komponentów
Hierarchia komponentów dla widoku listy audytów będzie następująca:

```
src/pages/audits.astro (Strona Astro)
└── src/components/AuditsDashboard.tsx (Komponent React, client:load)
    ├── src/components/AuditFilter.tsx (Komponent React)
    ├── src/components/ui/button.tsx (Przycisk "Dodaj Audyt" z Shadcn/ui)
    ├── src/components/AuditsTable.tsx (Komponent React, tabela audytów)
    │   ├── Komponenty Shadcn/ui: Table, TableHeader, TableBody, TableRow, TableCell, Badge
    │   ├── src/components/ui/button.tsx (Przyciski Akcji "Edytuj", "Usuń" w wierszach)
    │   └── src/components/TablePagination.tsx (Komponent React, obsługa paginacji)
    ├── src/components/DeleteConfirmationModal.tsx (Komponent React, modal potwierdzenia)
    │   └── Komponenty Shadcn/ui: AlertDialog, AlertDialogTrigger, AlertDialogContent, etc.
    └── src/components/ui/toaster.tsx (Komponent Toaster z Shadcn/ui do powiadomień)
```

## 4. Szczegóły komponentów

### `AuditsDashboard.tsx`
- **Opis:** Główny komponent kliencki React, zarządzający stanem i logiką widoku listy audytów. Odpowiada za pobieranie danych, obsługę filtrowania, paginacji, sortowania (jeśli zaimplementowane) oraz koordynację akcji użytkownika (dodawanie, edycja, usuwanie). Renderuje komponenty podrzędne: `AuditFilter`, `AuditsTable`, przycisk "Dodaj", `DeleteConfirmationModal`. Wykorzystuje hook `useAuditsList` do zarządzania logiką danych.
- **Główne elementy:** `div` jako kontener, `AuditFilter`, `Button` ("Dodaj Audyt"), `AuditsTable`, `DeleteConfirmationModal`, `Toaster`.
- **Obsługiwane interakcje:**
    - Zmiana wartości filtra (delegowane do `useAuditsList`).
    - Kliknięcie przycisku "Dodaj Audyt" (nawigacja do strony tworzenia).
    - Odbieranie zdarzeń `onEdit` i `onDeleteRequest` z `AuditsTable`.
    - Odbieranie zdarzeń `onConfirmDelete` i `onCancelDelete` z `DeleteConfirmationModal`.
    - Zmiana strony/limitu w paginacji (delegowane do `useAuditsList`).
    - Zmiana sortowania (delegowane do `useAuditsList`, jeśli zaimplementowane).
- **Obsługiwana walidacja:** Logika decyzyjna dotycząca otwarcia modala usuwania.
- **Typy:** `ListAuditsResponseDTO`, `AuditDTO`, `PaginationDTO`, `AuditListItemViewModel` (przekazywane do `AuditsTable`), stan dla modala (`auditToDelete: { id: string; orderNumber: string } | null`).
- **Propsy:** Brak (jest głównym komponentem klienckim).

### `AuditFilter.tsx`
- **Opis:** Komponent zawierający pole `Input` (Shadcn/ui) do filtrowania listy audytów po unikalnym numerze zlecenia (`audit_order_number`). Może w przyszłości zawierać kontrolki sortowania.
- **Główne elementy:** `Input` (Shadcn/ui) z etykietą.
- **Obsługiwane interakcje:** Zmiana wartości w polu input (`onChange`), która wywołuje `onFilterChange` (z debouncingiem).
- **Obsługiwana walidacja:** Brak specyficznej walidacji w komponencie.
- **Typy:** `string` (wartość filtra).
- **Propsy:**
    - `initialFilterValue: string`
    - `onFilterChange: (filterValue: string) => void`
    - `placeholder?: string` (np. "Filtruj po numerze zlecenia...")

### `AuditsTable.tsx`
- **Opis:** Komponent wyświetlający listę audytów w tabeli (Shadcn/ui `Table`). Renderuje wiersze na podstawie przekazanej tablicy `AuditListItemViewModel`. Zawiera kolumny: Numer Zlecenia, Opis, Data Utworzenia, Status (jako `Badge`) oraz Akcje (przyciski "Edytuj", "Usuń"). Implementuje paginację.
- **Główne elementy:** Shadcn/ui `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `Badge`. Pętlą renderuje wiersze. Zawiera komponent `TablePagination`. Przyciski "Edytuj" i "Usuń" (Shadcn/ui `Button`) w ostatniej kolumnie.
- **Obsługiwane interakcje:**
    - Kliknięcie przycisku "Edytuj" w wierszu (wywołuje `onEdit(auditId)`).
    - Kliknięcie przycisku "Usuń" w wierszu (wywołuje `onDeleteRequest(auditId, auditOrderNumber)`).
    - Zmiana strony lub limitu w `TablePagination` (wywołuje `onPageChange(page)` lub `onLimitChange(limit)`).
- **Obsługiwana walidacja:** Przyciski "Edytuj" i "Usuń" są deaktywowane (`disabled`) dla audytów ze statusem zatwierdzonym (`isApproved === true`).
- **Typy:** `AuditListItemViewModel[]`, `PaginationDTO`.
- **Propsy:**
    - `audits: AuditListItemViewModel[]`
    - `pagination: PaginationDTO`
    - `isLoading: boolean` (do wyświetlania stanu ładowania w tabeli)
    - `onEdit: (auditId: string) => void`
    - `onDeleteRequest: (auditId: string, auditOrderNumber: string) => void`
    - `onPageChange: (page: number) => void`
    - `onLimitChange: (limit: number) => void`
    // Opcjonalnie, jeśli sortowanie jest zaimplementowane:
    // `sort: { key: string; direction: 'asc' | 'desc' } | null`
    // `onSortChange: (sortKey: string) => void`

### `DeleteConfirmationModal.tsx`
- **Opis:** Komponent wykorzystujący Shadcn/ui `AlertDialog` do wyświetlenia okna dialogowego z prośbą o potwierdzenie usunięcia audytu. Wyświetla numer zlecenia audytu do usunięcia.
- **Główne elementy:** Komponenty Shadcn/ui `AlertDialog`, `AlertDialogTrigger` (choć trigger będzie zarządzany przez `AuditsDashboard`), `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`.
- **Obsługiwane interakcje:**
    - Kliknięcie przycisku "Potwierdź" (wywołuje `onConfirmDelete`).
    - Kliknięcie przycisku "Anuluj" (wywołuje `onCancelDelete`).
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych typów danych, operuje na stanie przekazanym przez propsy.
- **Propsy:**
    - `isOpen: boolean`
    - `auditOrderNumber: string | null` (numer audytu do wyświetlenia w komunikacie)
    - `onConfirmDelete: () => void`
    - `onCancelDelete: () => void`

### `TablePagination.tsx`
- **Opis:** Komponent do obsługi nawigacji między stronami wyników w tabeli. Wykorzystuje Shadcn/ui `Button` i wyświetla informacje o bieżącej stronie i łącznej liczbie wyników.
- **Główne elementy:** Przyciski "Poprzednia", "Następna", informacja tekstowa "Strona X z Y".
- **Obsługiwane interakcje:**
    - Kliknięcie "Poprzednia" (wywołuje `onPageChange(currentPage - 1)`).
    - Kliknięcie "Następna" (wywołuje `onPageChange(currentPage + 1)`).
    - Opcjonalnie: Zmiana liczby elementów na stronie (wywołuje `onLimitChange(newLimit)`).
- **Obsługiwana walidacja:** Przycisk "Poprzednia" jest deaktywowany na pierwszej stronie. Przycisk "Następna" jest deaktywowany na ostatniej stronie.
- **Typy:** `PaginationDTO`.
- **Propsy:**
    - `pagination: PaginationDTO`
    - `onPageChange: (page: number) => void`
    - `onLimitChange: (limit: number) => void` (opcjonalnie, jeśli dodajemy wybór limitu)

## 5. Typy

### Istniejące typy (z `src/types.ts`)
- `AuditDTO`: Podstawowy obiekt transferu danych dla audytu.
- `ListAuditsResponseDTO`: Struktura odpowiedzi dla `GET /audits`.
- `PaginationDTO`: Struktura danych paginacji.

### Nowe typy (ViewModel)

- **`AuditListItemViewModel`**
    - Cel: Dostosowanie danych `AuditDTO` do potrzeb wyświetlania w tabeli `AuditsTable`. Zawiera sformatowane dane i flagi ułatwiające renderowanie warunkowe.
    - Pola:
        - `id: string` (z `AuditDTO.id`)
        - `auditOrderNumber: string` (z `AuditDTO.audit_order_number`)
        - `description: string | null` (z `AuditDTO.description`, skrócony jeśli zbyt długi?)
        - `createdAt: string` (sformatowana data z `AuditDTO.created_at`, np. 'YYYY-MM-DD HH:mm')
        - `statusDisplay: string` (mapowanie `AuditDTO.status` na czytelny tekst, np. 'Nowy', 'Zatwierdzony')
        - `statusVariant: 'default' | 'secondary' | 'destructive' | 'outline'` (mapowanie `AuditDTO.status` na wariant komponentu `Badge` z Shadcn/ui)
        - `isApproved: boolean` (flaga pochodząca z `AuditDTO.status === 'approved'`, do łatwego warunkowego renderowania/deaktywacji przycisków)

## 6. Zarządzanie stanem

Stan widoku będzie zarządzany głównie w komponencie `AuditsDashboard.tsx` przy użyciu hooków React (`useState`, `useEffect`). W celu separacji logiki i poprawy czytelności, zostanie stworzony customowy hook `useAuditsList`.

- **`useAuditsList` Hook (`src/hooks/useAuditsList.ts`)**:
    - **Cel:** Hermetyzacja logiki pobierania danych audytów, obsługi paginacji, filtrowania (początkowo po stronie klienta), sortowania (jeśli zaimplementowane) oraz usuwania audytów. Zarządza stanami `audits`, `pagination`, `isLoading`, `error`.
    - **Zwracane wartości:**
        - `audits: AuditListItemViewModel[]`: Przetworzona lista audytów do wyświetlenia.
        - `pagination: PaginationDTO`: Aktualny stan paginacji.
        - `isLoading: boolean`: Flaga stanu ładowania.
        - `error: Error | null`: Obiekt błędu (jeśli wystąpił).
        - `fetchAudits: (params: { page?: number; limit?: number; sort?: string; filter?: string }) => Promise<void>`: Funkcja do pobierania/odświeżania danych.
        - `deleteAudit: (auditId: string) => Promise<boolean>`: Funkcja do usuwania audytu (zwraca true w przypadku sukcesu).
        - `setPage: (page: number) => void`: Ustawia bieżącą stronę.
        - `setLimit: (limit: number) => void`: Ustawia limit elementów na stronie.
        - `setFilter: (filter: string) => void`: Ustawia filtr (z debouncingiem).
        - `setSort: (sort: string) => void`: Ustawia sortowanie (jeśli zaimplementowane).
- **Stan w `AuditsDashboard.tsx`**:
    - `filterValue: string`: Aktualna wartość filtra z `AuditFilter` (przekazywana do `useAuditsList` przez `setFilter`).
    - `auditToDelete: { id: string; orderNumber: string } | null`: Przechowuje dane audytu wybranego do usunięcia, kontroluje widoczność `DeleteConfirmationModal`.

## 7. Integracja API

Integracja z API będzie realizowana wewnątrz hooka `useAuditsList`.

- **`GET /audits`**:
    - Wywoływane przy inicjalizacji hooka oraz przy zmianie parametrów (`page`, `limit`, `sort`, `filter`).
    - **Parametry:** `page` (numer strony), `limit` (liczba elementów), `sort` (opcjonalny klucz sortowania, np. `created_at` lub `-created_at`). Filtrowanie po `audit_order_number` będzie realizowane **po stronie klienta** do czasu aktualizacji API.
    - **Typ Żądania:** Parametry w query string.
    - **Typ Odpowiedzi:** `ListAuditsResponseDTO`. Odpowiedź jest mapowana na `AuditListItemViewModel[]`.
    - **Obsługa błędów:** Błędy sieciowe lub serwera (status 500) ustawiają stan `error` w hooku i są komunikowane użytkownikowi przez `Toaster`.
- **`DELETE /audits/{id}`**:
    - Wywoływane przez funkcję `deleteAudit` w hooku po potwierdzeniu przez użytkownika.
    - **Parametry:** `id` audytu w ścieżce URL.
    - **Typ Żądania:** Brak ciała (`body`).
    - **Typ Odpowiedzi:** Status 204 No Content (sukces).
    - **Obsługa błędów:**
        - 204: Sukces, odświeżenie listy audytów, wyświetlenie toastu sukcesu.
        - 403 (Forbidden): Audyt zatwierdzony, wyświetlenie toastu błędu ("Nie można usunąć zatwierdzonego audytu").
        - 404 (Not Found): Audyt nie istnieje, wyświetlenie toastu błędu.
        - 401 (Unauthorized): Problem z autoryzacją, wyświetlenie toastu błędu/przekierowanie do logowania.
        - Inne błędy (np. 500): Ogólny toast błędu.

## 8. Interakcje użytkownika

- **Przeglądanie listy:** Użytkownik widzi tabelę z audytami, może przewijać strony za pomocą kontrolek paginacji.
- **Filtrowanie:** Użytkownik wpisuje tekst w polu filtra. Lista aktualizuje się (z opóźnieniem - debounce), pokazując tylko pasujące audyty (filtrowanie po `auditOrderNumber` na frontendzie).
- **Dodawanie audytu:** Kliknięcie przycisku "Dodaj Audyt" przekierowuje użytkownika do formularza tworzenia nowego audytu (np. `/audits/new`).
- **Edycja audytu:** Kliknięcie przycisku "Edytuj" (dostępnego tylko dla niezatwierdzonych audytów) przekierowuje do formularza edycji danego audytu (np. `/audits/{id}/edit`).
- **Usuwanie audytu:**
    1. Kliknięcie przycisku "Usuń" (dostępnego tylko dla niezatwierdzonych audytów) otwiera modal `DeleteConfirmationModal`.
    2. Modal wyświetla numer zlecenia audytu i prosi o potwierdzenie.
    3. Kliknięcie "Potwierdź" wywołuje `DELETE /audits/{id}`. Po zakończeniu (sukces/błąd) wyświetlany jest odpowiedni toast, modal jest zamykany, a lista audytów odświeżana (w przypadku sukcesu).
    4. Kliknięcie "Anuluj" zamyka modal bez podejmowania akcji.

## 9. Warunki i walidacja

- **Dostępność akcji Edytuj/Usuń:** Przyciski "Edytuj" i "Usuń" w `AuditsTable` są aktywne tylko dla audytów, których pole `isApproved` (w `AuditListItemViewModel`, pochodzące od `status`) ma wartość `false`. Jest to walidacja po stronie UI, zapobiegająca niepotrzebnym wywołaniom API.
- **Paginacja:** Przyciski "Poprzednia"/"Następna" w `TablePagination` są deaktywowane odpowiednio na pierwszej i ostatniej stronie, bazując na danych z `PaginationDTO`.
- **Usuwanie:** Backend dodatkowo waliduje, czy audyt nie jest zatwierdzony przed usunięciem (zwraca 403 Forbidden, jeśli jest). Frontend obsługuje ten błąd, informując użytkownika.
- **Filtrowanie:** (Client-side) Porównuje wprowadzoną wartość z polem `auditOrderNumber` w `AuditListItemViewModel`.

## 10. Obsługa błędów

- **Błędy API (ogólne):** Wszelkie nieprzechwycone błędy podczas wywołań `GET /audits` lub `DELETE /audits/{id}` (np. błędy sieci, błędy serwera 500) będą komunikowane użytkownikowi za pomocą generycznego komunikatu błędu w toaście (np. "Wystąpił błąd podczas komunikacji z serwerem"). Błędy będą logowane do konsoli deweloperskiej. Stan `isLoading` zostanie ustawiony na `false`, a stan `error` w hooku `useAuditsList` zostanie ustawiony. Tabela może wyświetlić komunikat o błędzie zamiast danych.
- **Błąd pobierania listy (`GET /audits`):** Oprócz toastu, tabela powinna wyświetlić stan pusty lub informację o błędzie ładowania danych.
- **Błąd usuwania (`DELETE /audits/{id}`):**
    - **403 Forbidden:** Specyficzny toast informujący, że zatwierdzonego audytu nie można usunąć.
    - **404 Not Found:** Toast informujący, że audyt nie został znaleziony.
    - **401 Unauthorized:** Toast informujący o problemie z autoryzacją (może wymagać przekierowania do logowania).
- **Brak wyników:** Jeśli API zwróci pustą listę audytów (lub filtrowanie po stronie klienta nie da wyników), tabela powinna wyświetlić odpowiedni komunikat (np. "Nie znaleziono audytów" lub "Brak audytów pasujących do filtra").

## 11. Kroki implementacji

1.  **Struktura plików:** Utwórz pliki: `src/pages/audits.astro`, `src/components/AuditsDashboard.tsx`, `src/components/AuditFilter.tsx`, `src/components/AuditsTable.tsx`, `src/components/DeleteConfirmationModal.tsx`, `src/components/TablePagination.tsx`, `src/hooks/useAuditsList.ts`.
2.  **Typ `AuditListItemViewModel`:** Zdefiniuj typ `AuditListItemViewModel` w `src/types.ts` lub w pliku hooka/komponentu dashboardu.
3.  **Hook `useAuditsList`:** Zaimplementuj logikę pobierania danych (`GET /audits`) z obsługą paginacji i mapowaniem na `AuditListItemViewModel`. Dodaj stan `isLoading`, `error`. Implementuj funkcję `deleteAudit` (`DELETE /audits/{id}`) z obsługą odpowiedzi i błędów. Zaimplementuj funkcje `setPage`, `setLimit`. Dodaj logikę filtrowania po stronie klienta (na podstawie `auditOrderNumber`) i funkcję `setFilter` (z debouncingiem). Początkowo pomiń sortowanie.
4.  **Komponent `AuditsDashboard`:** Utwórz szkielet komponentu. Zintegruj hook `useAuditsList`. Dodaj stan `auditToDelete`. Wyrenderuj podstawową strukturę z miejscami na komponenty podrzędne. Dodaj `Toaster` z Shadcn/ui.
5.  **Komponent `AuditFilter`:** Zaimplementuj komponent z polem `Input` i podłącz `onFilterChange` do `setFilter` z hooka.
6.  **Komponent `TablePagination`:** Zaimplementuj logikę paginacji na podstawie propsa `pagination` i wywołuj `onPageChange`/`onLimitChange`.
7.  **Komponent `AuditsTable`:** Zaimplementuj tabelę używając Shadcn/ui `Table`. Wyświetl dane z `audits` (props). Sformatuj datę (`createdAt`) i status (`statusDisplay`, `statusVariant`, `Badge`). Dodaj przyciski "Edytuj" i "Usuń", implementując logikę deaktywacji (`disabled={audit.isApproved}`). Podłącz zdarzenia `onEdit`, `onDeleteRequest`. Zintegruj `TablePagination`. Dodaj obsługę stanu `isLoading`.
8.  **Komponent `DeleteConfirmationModal`:** Zaimplementuj modal `AlertDialog`, wyświetlając `auditOrderNumber`. Podłącz `onConfirmDelete` i `onCancelDelete`.
9.  **Połączenie w `AuditsDashboard`:**
    - Przekaż dane i funkcje z hooka do `AuditsTable` i `AuditFilter`.
    - Obsłuż zdarzenie `onDeleteRequest` z `AuditsTable`, ustawiając stan `auditToDelete` i otwierając modal.
    - Obsłuż zdarzenia `onConfirmDelete` (wywołaj `deleteAudit` z hooka, obsłuż wynik tostem, zamknij modal, odśwież listę) i `onCancelDelete` (zamknij modal) z modala.
    - Obsłuż `onEdit` (nawigacja do `/audits/{id}/edit`).
    - Dodaj przycisk "Dodaj Audyt" i obsłuż nawigację (`/audits/new`).
10. **Strona `audits.astro`:** Utwórz stronę Astro, zaimportuj i wyrenderuj `AuditsDashboard` z dyrektywą `client:load`. Dodaj odpowiedni layout i tytuł strony.
11. **Styling i WCAG:** Dopracuj style za pomocą Tailwind, upewnij się, że interfejs jest intuicyjny i zgodny z WCAG AA (kontrasty, nawigacja klawiaturą, etykiety ARIA).
12. **Testowanie:** Przetestuj wszystkie interakcje użytkownika, obsługę błędów, filtrowanie, paginację i warunki deaktywacji przycisków. 