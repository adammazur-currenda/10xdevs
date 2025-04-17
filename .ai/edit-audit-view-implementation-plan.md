# Plan implementacji widoku Edycji Audytu

## 1. Przegląd
Widok Edycji Audytu umożliwia użytkownikom modyfikację istniejących, niezatwierdzonych audytów. Użytkownik może edytować opis, protokół oraz podsumowanie audytu. Widok zapewnia również funkcjonalność generowania podsumowania za pomocą AI oraz zatwierdzania audytu, co blokuje dalszą edycję.

## 2. Routing widoku
Widok będzie dostępny pod dynamiczną ścieżką `/audits/edit/[id]`, gdzie `[id]` jest unikalnym identyfikatorem (UUID) audytu. Strona powinna być renderowana po stronie serwera (SSR), aby pobrać dane audytu przed wyświetleniem formularza.

## 3. Struktura komponentów
```
EditAuditPage (Astro)
│
└── EditAuditForm (React Client Component)
    ├── Input (Shadcn/ui) - Numer Zlecenia (readonly)
    ├── Input (Shadcn/ui) - Opis
    ├── Textarea (Shadcn/ui) - Protokół
    ├── Button (Shadcn/ui) - Generuj Podsumowanie
    ├── Textarea (Shadcn/ui) - Podsumowanie
    ├── Button (Shadcn/ui) - Zapisz
    └── Button (Shadcn/ui) - Zatwierdź
```

## 4. Szczegóły komponentów

### `EditAuditPage` (Astro Component - `/src/pages/audits/edit/[id].astro`)
- **Opis komponentu:** Główny komponent strony renderowany po stronie serwera. Odpowiedzialny za pobranie danych audytu na podstawie `id` z URL, obsługę błędów (np. audyt nie znaleziony, błąd serwera) oraz przekazanie danych do komponentu klienckiego `EditAuditForm`.
- **Główne elementy:** Wywołanie API `GET /audits/{id}` w części frontmatter, obsługa stanu ładowania i błędów, renderowanie komponentu `EditAuditForm` z przekazaniem danych audytu jako props.
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji użytkownika. Obsługuje routing i pobieranie danych.
- **Obsługiwana walidacja:** Weryfikacja `id` audytu (UUID format) w URL. Sprawdzenie, czy audyt istnieje i należy do użytkownika.
- **Typy:** `AuditDTO` (do pobrania danych), `EditAuditFormProps` (do przekazania do komponentu React).
- **Propsy:** Przyjmuje `id` audytu z parametrów ścieżki Astro.

### `EditAuditForm` (React Client Component - `/src/components/audits/EditAuditForm.tsx`)
- **Opis komponentu:** Interaktywny formularz do edycji audytu. Zarządza stanem formularza, obsługuje wprowadzanie danych przez użytkownika, walidację pól, wywołania API do generowania podsumowania, zapisu zmian i zatwierdzania audytu. Wyświetla również stany ładowania i komunikaty o błędach.
- **Główne elementy:**
    - `Form` (z `react-hook-form` lub podobnej biblioteki)
    - `Input` (Shadcn/ui) dla numeru zlecenia (tylko do odczytu).
    - `Input` (Shadcn/ui) dla opisu.
    - `Textarea` (Shadcn/ui) dla protokołu.
    - `Button` (Shadcn/ui) "Generuj Podsumowanie" z obsługą stanu ładowania (np. spinner).
    - `Textarea` (Shadcn/ui) dla podsumowania.
    - `Button` (Shadcn/ui) "Zapisz" do wysłania zmian (PATCH).
    - `Button` (Shadcn/ui) "Zatwierdź" do finalizacji audytu (POST approve).
    - Komponenty do wyświetlania błędów walidacji i komunikatów (np. `Toast` z Shadcn/ui).
- **Obsługiwane interakcje:**
    - Wprowadzanie tekstu w polach Opis, Protokół, Podsumowanie.
    - Kliknięcie "Generuj Podsumowanie": Wywołuje API `POST /api/audits/generate-summary`, pokazuje stan ładowania, aktualizuje pole podsumowania wynikiem.
    - Kliknięcie "Zapisz": Wywołuje API `PATCH /api/audits/[id]` z aktualnymi danymi formularza, pokazuje stan ładowania, wyświetla potwierdzenie sukcesu lub błąd.
    - Kliknięcie "Zatwierdź": Wywołuje API `POST /api/audits/[id]/approve`, pokazuje stan ładowania, po sukcesie blokuje formularz do edycji i ewentualnie przekierowuje lub pokazuje komunikat.
- **Obsługiwana walidacja:**
    - **Opis:** Opcjonalny, bez ograniczeń długości (zgodnie z API, ale można dodać rozsądny limit np. 500 znaków).
    - **Protokół:** Wymagany, długość między 1000 a 10000 znaków (zgodnie z `updateAuditSchema` i PRD). Walidacja inline z komunikatami.
    - **Podsumowanie:** Opcjonalne, bez specyficznych ograniczeń długości w API (ale można dodać).
    - Logika biznesowa: Przycisk "Zapisz" i "Zatwierdź" aktywne tylko jeśli formularz jest poprawny i zaszły zmiany. Przycisk "Generuj podsumowanie" aktywny tylko jeśli pole protokołu jest poprawne. Formularz nieedytowalny, jeśli `status` audytu to `approved`.
- **Typy:** `AuditDTO` (dane początkowe), `UpdateAuditCommand` (dane do wysłania w PATCH), `GenerateSummaryRequestDTO`, `GenerateSummaryResponseDTO`, `ApproveAuditCommand`, `EditAuditFormProps`, `EditAuditFormState` (stan wewnętrzny, np. loading, error).
- **Propsy:** `initialData: AuditDTO` (dane audytu pobrane przez `EditAuditPage`).

## 5. Typy

- **Istniejące typy (z `src/types.ts`):**
    - `AuditDTO`: Reprezentuje pełne dane audytu z bazy danych. Używane do pobrania danych początkowych.
    - `UpdateAuditCommand`: Definiuje dozwolone pola (`protocol`, `description`, `summary`) i ich typy do aktualizacji audytu (PATCH).
    - `GenerateSummaryRequestDTO`: Zawiera pole `protocol` (string) do wysłania w żądaniu generowania podsumowania.
    - `GenerateSummaryResponseDTO`: Zawiera pole `summary` (string) otrzymane w odpowiedzi po wygenerowaniu podsumowania.
    - `ApproveAuditCommand`: Potencjalnie pusty obiekt lub obiekt z `confirm: boolean` dla żądania zatwierdzenia audytu.
- **Nowe typy/interfejsy:**
    - `EditAuditFormProps`: Interfejs propsów dla komponentu `EditAuditForm`.
      ```typescript
      interface EditAuditFormProps {
        initialData: AuditDTO; // Początkowe dane audytu
      }
      ```
    - `EditAuditFormState` (lub typy zwracane przez hook): Reprezentuje stan zarządzany wewnątrz `EditAuditForm`, np. przy użyciu `useState` lub `useReducer`.
      ```typescript
      // Przykład użycia hooka useForm z react-hook-form
      // Typy będą zarządzane przez bibliotekę, ale warto zdefiniować schemat walidacji
      const formSchema = z.object({
        description: z.string().optional(),
        protocol: z.string().min(1000, "Protokół musi mieć co najmniej 1000 znaków.").max(10000, "Protokół nie może przekraczać 10000 znaków."),
        summary: z.string().optional(),
      });
      type EditAuditFormData = z.infer<typeof formSchema>;

      // Dodatkowe stany
      interface EditAuditComponentState {
        isGeneratingSummary: boolean;
        isSaving: boolean;
        isApproving: boolean;
        error: string | null; // Ogólny błąd operacji API
        isApproved: boolean; // Stan zatwierdzenia audytu (z initialData.status)
      }
      ```

## 6. Zarządzanie stanem
- **`EditAuditPage` (Astro):** Stan zarządzany w `frontmatter` podczas SSR (pobieranie danych, obsługa błędów ładowania). Nie wymaga złożonego zarządzania stanem po stronie klienta.
- **`EditAuditForm` (React):**
    - **Stan formularza:** Rekomendowane użycie biblioteki `react-hook-form` do zarządzania wartościami pól, walidacją i stanem przesyłania. Użycie `zod` do definicji schematu walidacji i integracja z `react-hook-form` (`zodResolver`).
    - **Stan operacji API:** Użycie `useState` do zarządzania stanami ładowania (`isGeneratingSummary`, `isSaving`, `isApproving`) i błędami (`error`).
    - **Stan zatwierdzenia:** Użycie `useState` zainicjowanego wartością `initialData.status === 'approved'` do kontrolowania edytowalności formularza. Stan ten powinien być aktualizowany po pomyślnym zatwierdzeniu audytu.
    - **Custom Hook:** Można rozważyć stworzenie hooka `useEditAuditForm(initialData: AuditDTO)`, który enkapsulowałby logikę formularza (`react-hook-form`), stany ładowania/błędów i funkcje obsługi zdarzeń (handleGenerateSummary, handleSave, handleApprove). To poprawiłoby czytelność komponentu `EditAuditForm`.

## 7. Integracja API

- **Pobieranie danych audytu (w `EditAuditPage.astro`):**
    - Wywołanie: `GET /api/audits/[id]` (implementacja w `src/pages/api/audits/[id].ts`)
    - Odpowiedź: `AuditDTO`
    - Obsługa błędów: 404 (nie znaleziono), 500 (błąd serwera), 400 (niepoprawny UUID). Strona Astro powinna odpowiednio reagować (np. pokazać stronę błędu).
- **Generowanie podsumowania (w `EditAuditForm.tsx`):**
    - Wywołanie: `POST /api/audits/generate-summary`
    - Żądanie: `GenerateSummaryRequestDTO` (zawiera `protocol` z formularza)
    - Odpowiedź: `GenerateSummaryResponseDTO` (zawiera `summary`)
    - Obsługa błędów: Błędy sieci, błędy serwera (np. 500), potencjalne błędy walidacji (choć walidacja długości protokołu powinna być po stronie klienta). Wyświetlenie komunikatu o błędzie (np. Toast).
- **Zapisywanie zmian (w `EditAuditForm.tsx`):**
    - Wywołanie: `PATCH /api/audits/[id]` (implementacja w `src/pages/api/audits/[id].ts`)
    - Żądanie: `UpdateAuditCommand` (zawiera zmienione pola: `description`, `protocol`, `summary`)
    - Odpowiedź: Zaktualizowany `AuditDTO`
    - Obsługa błędów: 400 (błąd walidacji danych), 403 (próba edycji zatwierdzonego audytu), 404 (nie znaleziono), 500 (błąd serwera), błędy sieci. Wyświetlenie komunikatu o błędzie.
- **Zatwierdzanie audytu (w `EditAuditForm.tsx`):**
    - Wywołanie: `POST /api/audits/[id]/approve` (endpoint do stworzenia)
    - Żądanie: `ApproveAuditCommand` (prawdopodobnie puste ciało lub `{ confirm: true }`)
    - Odpowiedź: Status 200/204 lub zaktualizowany `AuditDTO` ze statusem `approved`.
    - Obsługa błędów: 403 (już zatwierdzony), 404 (nie znaleziono), 500 (błąd serwera), błędy sieci. Wyświetlenie komunikatu o błędzie. Po sukcesie - zablokowanie formularza.

## 8. Interakcje użytkownika

- **Ładowanie strony:** Użytkownik przechodzi do `/audits/edit/[id]`. Strona Astro pobiera dane. Wyświetlany jest stan ładowania, a następnie formularz z danymi lub strona błędu.
- **Wprowadzanie danych:** Użytkownik edytuje pola "Opis", "Protokół", "Podsumowanie". Walidacja (np. długość protokołu) odbywa się na bieżąco (np. `onChange` lub `onBlur`). Komunikaty o błędach walidacji pojawiają się przy polach.
- **Generowanie podsumowania:**
    - Użytkownik klika "Generuj Podsumowanie" (aktywny, gdy protokół jest poprawny).
    - Przycisk pokazuje stan ładowania (np. spinner), formularz może być tymczasowo zablokowany.
    - Po otrzymaniu odpowiedzi pole "Podsumowanie" jest aktualizowane. Stan ładowania znika.
    - W razie błędu wyświetlany jest komunikat (np. Toast).
- **Zapisywanie zmian:**
    - Użytkownik klika "Zapisz" (aktywny, gdy formularz jest poprawny i zaszły zmiany).
    - Przycisk pokazuje stan ładowania.
    - Po sukcesie wyświetlany jest komunikat potwierdzający (np. Toast "Zmiany zapisano"). Stan ładowania znika. Formularz pozostaje edytowalny.
    - W razie błędu (np. 400, 500) wyświetlany jest komunikat o błędzie.
- **Zatwierdzanie audytu:**
    - Użytkownik klika "Zatwierdź" (aktywny, gdy formularz jest poprawny).
    - Przycisk pokazuje stan ładowania.
    - Po sukcesie:
        - Wyświetlany jest komunikat potwierdzający (np. "Audyt został zatwierdzony").
        - Wszystkie pola formularza i przyciski (poza np. nawigacją wstecz) stają się nieaktywne/tylko do odczytu.
        - Stan `isApproved` jest ustawiany na `true`.
    - W razie błędu wyświetlany jest komunikat.

## 9. Warunki i walidacja

- **Format ID audytu (Astro - `EditAuditPage`):** Sprawdzenie, czy `id` w URL jest poprawnym UUID. Jeśli nie, zwróć 400 lub przekieruj na stronę błędu.
- **Istnienie i dostęp do audytu (Astro - `EditAuditPage`):** API `GET /api/audits/[id]` powinno zwrócić 404, jeśli audyt nie istnieje lub nie należy do użytkownika. Strona Astro powinna obsłużyć ten błąd (np. pokazać stronę 404).
- **Status audytu (React - `EditAuditForm`):** Jeśli `initialData.status === 'approved'`, cały formularz (`description`, `protocol`, `summary`, przyciski "Generuj", "Zapisz", "Zatwierdź") powinien być nieaktywny (disabled/readonly) od samego początku.
- **Walidacja pola Protokół (React - `EditAuditForm`):**
    - Wymagane.
    - Długość: min 1000, max 10000 znaków.
    - Komunikaty o błędach wyświetlane przy polu. Wpływa na aktywność przycisków "Generuj podsumowanie", "Zapisz", "Zatwierdź".
- **Walidacja pola Opis (React - `EditAuditForm`):** Opcjonalne. Może mieć walidację maksymalnej długości dla lepszego UX.
- **Walidacja pola Podsumowanie (React - `EditAuditForm`):** Opcjonalne.
- **Aktywność przycisku "Generuj Podsumowanie" (React - `EditAuditForm`):** Aktywny tylko, gdy pole Protokół jest poprawne (spełnia wymagania długości) i audyt nie jest zatwierdzony (`!isApproved`).
- **Aktywność przycisku "Zapisz" (React - `EditAuditForm`):** Aktywny tylko, gdy formularz jest poprawny (wszystkie walidacje przechodzą), zaszły zmiany w porównaniu do `initialData` i audyt nie jest zatwierdzony (`!isApproved`). Stan zmian można śledzić za pomocą `react-hook-form` (`formState.isDirty`).
- **Aktywność przycisku "Zatwierdź" (React - `EditAuditForm`):** Aktywny tylko, gdy formularz jest poprawny (wszystkie walidacje przechodzą) i audyt nie jest zatwierdzony (`!isApproved`). Można rozważyć, czy powinien być aktywny tylko po zapisaniu zmian, czy niezależnie. Zgodnie z US-003, powinien być dostępny "po zakończeniu edycji".

## 10. Obsługa błędów

- **Błąd pobierania danych (`EditAuditPage.astro`):**
    - 404 Not Found: Wyświetlić dedykowaną stronę 404 lub komunikat "Audyt nie został znaleziony".
    - 500 Internal Server Error: Wyświetlić ogólną stronę błędu serwera.
    - 400 Bad Request (Invalid UUID): Wyświetlić stronę błędu 400.
- **Błędy walidacji formularza (`EditAuditForm.tsx`):** Wyświetlać komunikaty bezpośrednio przy odpowiednich polach formularza. Przyciski "Zapisz", "Zatwierdź", "Generuj" powinny być nieaktywne, jeśli walidacja nie przechodzi.
- **Błędy API (Generowanie, Zapis, Zatwierdzanie) (`EditAuditForm.tsx`):**
    - Błędy sieci: Wyświetlić ogólny komunikat o problemie z połączeniem (np. Toast).
    - 400 Bad Request (np. błąd walidacji po stronie serwera przy PATCH): Wyświetlić komunikat o błędnych danych (np. Toast). Można spróbować sparsować `details` z odpowiedzi, jeśli API je dostarcza.
    - 403 Forbidden (np. próba edycji/zapisu/zatwierdzenia zatwierdzonego audytu): Wyświetlić komunikat "Operacja niedozwolona dla zatwierdzonego audytu" (np. Toast) i upewnić się, że formularz jest zablokowany.
    - 404 Not Found (np. audyt został usunięty w międzyczasie): Wyświetlić komunikat "Audyt nie został znaleziony" (np. Toast) i ewentualnie przekierować użytkownika.
    - 500 Internal Server Error: Wyświetlić ogólny komunikat "Wystąpił błąd serwera. Spróbuj ponownie później." (np. Toast).
- **Stan ładowania:** Wyraźnie pokazywać stan ładowania na przyciskach ("Generuj", "Zapisz", "Zatwierdź") podczas trwania operacji API, aby zapobiec wielokrotnym kliknięciom i poinformować użytkownika o postępie.

## 11. Kroki implementacji

1.  **Utworzenie pliku strony Astro:** Stworzyć plik `/src/pages/audits/edit/[id].astro`.
2.  **Implementacja pobierania danych w Astro:** W części `frontmatter` pliku Astro dodać logikę wywołania API `GET /api/audits/[id]` używając `Astro.params.id`. Obsłużyć stany ładowania i błędy (404, 500, 400).
3.  **Utworzenie komponentu React:** Stworzyć plik `/src/components/audits/EditAuditForm.tsx`. Zdefiniować podstawową strukturę formularza z użyciem komponentów Shadcn/ui (`Input`, `Textarea`, `Button`).
4.  **Przekazanie danych do React:** W pliku Astro, jeśli dane zostały pomyślnie pobrane, wyrenderować komponent `<EditAuditForm client:load initialData={auditData} />`, przekazując pobrane `AuditDTO`.
5.  **Implementacja zarządzania stanem formularza:** W `EditAuditForm.tsx` zintegrować `react-hook-form` i `zod` (`zodResolver`) do zarządzania stanem pól, walidacją i śledzeniem zmian (`isDirty`). Ustawić wartości domyślne na podstawie `initialData`.
6.  **Implementacja logiki tylko do odczytu:** Dodać logikę blokującą edycję pól i przycisków, jeśli `initialData.status === 'approved'`.
7.  **Implementacja funkcji "Generuj Podsumowanie":** Dodać funkcję obsługi kliknięcia przycisku. Funkcja powinna:
    - Sprawdzić, czy protokół jest poprawny.
    - Ustawić stan `isGeneratingSummary` na `true`.
    - Wywołać `POST /api/audits/generate-summary` z `protocol`.
    - Zaktualizować pole podsumowania w formularzu (`setValue` z `react-hook-form`).
    - Obsłużyć błędy i zresetować stan ładowania.
8.  **Implementacja funkcji "Zapisz":** Dodać funkcję obsługi kliknięcia przycisku. Funkcja powinna:
    - Sprawdzić, czy formularz jest poprawny (`isValid`) i czy zaszły zmiany (`isDirty`).
    - Ustawić stan `isSaving` na `true`.
    - Zebrać dane z formularza (`getValues`) i wysłać tylko zmienione pola do `PATCH /api/audits/[id]`.
    - Po sukcesie zaktualizować `initialData` (lub zresetować `isDirty` w `react-hook-form`) i pokazać komunikat.
    - Obsłużyć błędy (400, 403, 404, 500) i zresetować stan ładowania.
9.  **Implementacja funkcji "Zatwierdź":**
    - **Backend:** Upewnić się, że istnieje endpoint `POST /api/audits/[id]/approve`, który zmienia status audytu na `approved`.
    - **Frontend:** Dodać funkcję obsługi kliknięcia przycisku. Funkcja powinna:
        - Sprawdzić, czy formularz jest poprawny.
        - Ustawić stan `isApproving` na `true`.
        - Wywołać `POST /api/audits/[id]/approve`.
        - Po sukcesie ustawić stan `isApproved` na `true`, zablokować formularz i pokazać komunikat.
        - Obsłużyć błędy i zresetować stan ładowania.
10. **Dopracowanie UX:** Dodać komunikaty Toast dla sukcesów i błędów, poprawić wygląd stanów ładowania, upewnić się, że wszystkie interakcje są intuicyjne.
11. **Testowanie:** Przetestować wszystkie ścieżki: ładowanie strony, walidację, generowanie podsumowania, zapisywanie, zatwierdzanie, obsługę błędów, działanie dla już zatwierdzonego audytu.
12. **Review i Refaktoryzacja:** Przejrzeć kod pod kątem czystości, zgodności z wytycznymi i potencjalnych ulepszeń (np. wydzielenie logiki do hooka `useEditAuditForm`). 