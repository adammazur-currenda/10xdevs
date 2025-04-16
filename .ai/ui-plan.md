# Architektura UI dla ITAuditor MVP

## 1. Przegląd struktury UI
Całość interfejsu dzieli się na główne części: ekran autoryzacji, widok listy audytów oraz zintegrowany formularz tworzenia/edycji audytu. Nawigację realizuje topbar z komponentami z shadcn/ui, zapewniając spójność oraz intuicyjne poruszanie się pomiędzy widokami. Interfejs zaprojektowany jest z myślą o dostępności (WCAG AA) oraz bezpieczeństwie, z wbudowaną walidacją i obsługą komunikatów informujących o sukcesie lub błędach.

## 2. Lista widoków
### 2.1. Ekran Autoryzacji
- **Ścieżka widoku:** `/login` lub `/register`
- **Główny cel:** Umożliwienie użytkownikowi logowania i rejestracji.
- **Kluczowe informacje do wyświetlenia:** Formularz logowania/rejestracji z polami e-mail i hasło oraz przyciski akcji.
- **Kluczowe komponenty widoku:** Formularz autentykacji, przyciski submit, walidacje pól i komunikaty błędów inline.
- **UX, dostępność i względy bezpieczeństwa:** Czytelne etykiety, obsługa błędów inline, zgodność z WCAG AA oraz podstawowa walidacja danych.

### 2.2. Widok Listy Audytów (Dashboard)
- **Ścieżka widoku:** `/audits`
- **Główny cel:** Prezentacja listy audytów powiązanych z zalogowanym użytkownikiem oraz możliwość filtrowania po unikalnym numerze audytu.
- **Kluczowe informacje do wyświetlenia:** Tabela audytów zawierająca kolumny: unikalny numer audytu, opis, data utworzenia i status.
- **Kluczowe komponenty widoku:** Tabela audytów, komponent filtrujący, przyciski akcji ("Dodaj", "Edytuj", "Usuń"), modal potwierdzający operację usunięcia oraz system toastów do komunikatów sukcesu lub błędów.
- **UX, dostępność i względy bezpieczeństwa:** Intuicyjny interfejs tabeli z możliwością filtrowania, czytelne komunikaty błędów, potwierdzenia operacji oraz zgodność z wytycznymi WCAG AA.

### 2.3. Formularz Tworzenia/Edycji Audytu
- **Ścieżka widoku:** Udostępniony jako osobne strony (np. `/audits/new` lub `/audits/edit/:id`).
- **Główny cel:** Umożliwienie tworzenia nowego audytu oraz edycji istniejącego audytu przed zatwierdzeniem.
- **Kluczowe informacje do wyświetlenia:** Formularz zawierający pole numeru audytu (niemodyfikowalne przy edycji), opis, edytowalny obszar protokołu oraz obszar podsumowania.
- **Kluczowe komponenty widoku:** Formularz z polami tekstowymi, przycisk "Generuj podsumowanie" (z animacją ładowania symulującą komunikację z AI),przycisk "Zapisz" oraz przycisk zatwierdzanie audytu "Zatwierdź".
- **UX, dostępność i względy bezpieczeństwa:** Walidacja pól inline, przyjazne komunikaty o błędach, obsługa loading state podczas generowania podsumowania, zabezpieczenie przed nieautoryzowaną modyfikacją kluczowych danych oraz zgodność z WCAG AA.

## 3. Mapa podróży użytkownika
1. Użytkownik trafia na ekran autoryzacji, gdzie dokonuje logowania lub rejestracji.
2. Po pomyślnym uwierzytelnieniu, użytkownik zostaje przekierowany do widoku listy audytów (Dashboard).
3. Na widoku Dashboarda:
   - Użytkownik przegląda tabelę audytów i może filtrować dane po unikalnym numerze.
   - Ma możliwość wybrania akcji: "Dodaj" (do utworzenia nowego audytu), "Edytuj" (do modyfikacji istniejącego audytu) oraz "Usuń" (który uruchamia modal potwierdzający operację usunięcia).
4. Wybierając "Dodaj" lub "Edytuj", użytkownik przechodzi do formularza tworzenia/edycji audytu, gdzie:
   - Wprowadza wymagane dane audytu (numer, opis, protokół, podsumowanie).
   - Używa przycisku "Generuj podsumowanie", aby wywołać (mock) komunikację z AI, po czym może ręcznie edytować wynik.
   - Zapisuje zmiany przyciskiem "Zapisz".
   - Zatwierdza audyt przyciskiem "Zatwierdź" co zmienia status audytu na zatwierdzony.
5. Po zapisaniu, użytkownik otrzymuje inline komunikaty oraz toasty potwierdzające sukces operacji lub informujące o błędach.
6. Audyt zatwierdzony (poprzez akcję zatwierdzania) przełącza się do trybu tylko do odczytu, co jest widoczne w tabeli Dashboarda.

## 4. Układ i struktura nawigacji
- Główny element nawigacyjny stanowi topbar z Navigation Menu (z Shadcn/ui), widoczny na wszystkich głównych widokach, umożliwiający:
  - Szybki dostęp do widoku listy audytów (Dashboard).
  - Opcjonalny dostęp do profilu użytkownika oraz opcji wylogowania.
- Nawigacja pozostaje spójna podczas przechodzenia do formularza tworzenia/edycji audytu, co pozwala użytkownikowi łatwo wrócić do głównego widoku.

## 5. Kluczowe komponenty
- **Formularz autentykacji:** Obsługuje logowanie i rejestrację, walidację pól oraz wyświetlanie komunikatów o błędach.
- **Tabela audytów:** Prezentuje listę audytów, z opcjami filtrowania i sortowania, oraz zawiera akcje "Edytuj" i "Usuń" dla poszczególnych rekordów.
- **Formularz tworzenia/edycji audytu:** Zintegrowany formularz z polami dla numeru audytu (niedostępnego w edycji), opisu, protokołu i podsumowania, wraz z przyciskiem do generowania podsumowania (symulacja AI) i przyciskiem zapisu.
- **Modal potwierdzenia:** Umożliwia potwierdzenie operacji usunięcia audytu, minimalizując ryzyko przypadkowego usunięcia.
- **Toast powiadomień:** System wyświetlania szybkich komunikatów o sukcesie lub błędach po wykonaniu operacji.
- **Navigation Topbar:** Pasek nawigacyjny umożliwiający spójne i intuicyjne poruszanie się pomiędzy głównymi widokami aplikacji.
- **Komponent filtrujący:** Umożliwia użytkownikowi łatwe filtrowanie audytów po unikalnym numerze zlecenia. 