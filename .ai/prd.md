# Dokument wymagań produktu (PRD) - ITAuditor (MVP)

## 1. Przegląd produktu
Aplikacja ITAuditor (MVP) ma na celu automatyzację procesu podsumowania audytu IT. System umożliwia tworzenie, edycję oraz przeglądanie zleceń audytów, w których użytkownik wprowadza szczegółowy protokół audytu, a następnie, dzięki integracji z AI, system generuje wypunktowane podsumowanie. Kluczowym założeniem jest uproszczenie i przyspieszenie weryfikacji audytów przez prezentację wyników w czytelnej formie. Dodatkowo, aplikacja zapewnia prosty system kont użytkowników, co umożliwia powiązanie audytów z konkretnymi użytkownikami.

## 2. Problem użytkownika
Przeprowadzenie audytu IT wiąże się z ręcznym wpisywaniem obszernych, szczegółowych protokołów (od 1000 do 10 000 znaków), co jest czasochłonne i podatne na błędy. Weryfikacja i analiza tak rozbudowanych protokołów wymaga dużego nakładu pracy. Użytkownik potrzebuje mechanizmu, który automatycznie skróci i wyróżni kluczowe informacje, umożliwiając szybką ocenę poprawności i kompletności przeprowadzonego audytu.

## 3. Wymagania funkcjonalne
- Wprowadzanie unikalnego numeru zlecenia audytu o długości od 2 do 20 znaków.
- Wprowadzanie tekstowego protokołu audytu o długości od 1000 do 10 000 znaków.
- Na żądanie, synchroniczna generacja wypunktowanego podsumowania audytu przy użyciu modułu AI.
- Edytowalność protokołu oraz generowanego podsumowania przed zatwierdzeniem audytu.
- Przejście do trybu tylko do odczytu po zatwierdzeniu audytu (poprzez przycisk "Akceptuję rezultat audytu").
- Możliwość dodawania, edycji (dla niezatwierdzonych audytów) oraz usuwania zleceń audytów.
- Rejestrowanie kluczowych metadanych: unikalny numer/oznaczenie audytu, opis audytu, protokół, podsumowanie, status akceptacji, data utworzenia, data modyfikacji oraz identyfikator użytkownika.
- Podstawowy system kont użytkowników umożliwiający logowanie, rejestrację oraz przyporządkowanie audytów do zalogowanego użytkownika.

## 4. Granice produktu
- MVP nie obejmuje przypisywania audytów do innych użytkowników – każdy audyt jest powiązany z bieżącym, zalogowanym użytkownikiem.
- Brak importu protokołów z zewnętrznych formatów (np. PDF, DOCX).
- Brak integracji z systemami zewnętrznymi (np. Jira) w celu automatycznego tworzenia zadań.
- Na początek nie ma wersji mobilnej – aplikacja jest rozwijana tylko jako web.
- Brak zapisywania historii odrzuconych podsumowań – system przechowuje tylko zatwierdzone wyniki.

## 5. Historyjki użytkowników
### US-001: Dodanie audytu
- ID: US-001
- Tytuł: Dodanie nowego audytu
- Opis: Użytkownik rozpoczyna proces dodania audytu za pomocą przycisku "Dodaj". Następnie wprowadza szczegółowy protokół audytu, po czym system na żądanie (przycisk "Generuj podsumowanie") generuje wypunktowane podsumowanie przy użyciu AI. Użytkownik może edytować obie sekcje przed finalnym zatwierdzeniem.
- Kryteria akceptacji:
  - Przycisk "Dodaj" jest widoczny na ekranie głównym.
  - Po kliknięciu przycisku uruchamia się interfejs nowego audytu z unikalnym numerem zlecenia audytu, opisem, edytowalnym protokołem i podsumowaniem.
  - Unikalny numer zlecenia audytu musi mieścić się w zakresie 2–20 znaków.
  - Protokół musi mieścić się w zakresie 1000–10 000 znaków.
  - Podsumowanie jest generowane synchronicznie po wprowadzeniu protokołu.
  - Użytkownik może dokonać edycji przed zatwierdzeniem audytu.

### US-002: Edycja audytu przed zatwierdzeniem
- ID: US-002
- Tytuł: Edycja zawartości audytu
- Opis: Użytkownik ma możliwość edycji protokołu oraz wygenerowanego podsumowania przed zatwierdzeniem audytu, aby wprowadzić niezbędne poprawki.
- Kryteria akceptacji:
  - Pole numeru zlecenia jest nieedytowalne.
  - Pola edycji dla protokołu i podsumowania są dostępne, dopóki audyt nie został zatwierdzony.
  - Wprowadzone zmiany są zapisywane i widoczne przy kolejnych edycjach.

### US-003: Akceptacja audytu
- ID: US-003
- Tytuł: Zatwierdzenie audytu
- Opis: Po finalnej edycji użytkownik zatwierdza audyt poprzez naciśnięcie przycisku "Akceptuję rezultat audytu", co powoduje przełączenie zlecenia w tryb tylko do odczytu.
- Kryteria akceptacji:
  - Przycisk "Akceptuję rezultat audytu" jest dostępny po zakończeniu edycji.
  - Po zatwierdzeniu audytu, pola edycji stają się nieaktywne, a audyt jest zapisany jako finalny.

### US-004: Uwierzytelnianie i dostępy użytkownika
- ID: US-004
- Tytuł: Logowanie i rejestracja użytkownika
- Opis: System umożliwia użytkownikowi logowanie i rejestrację, aby powiązać audyty z indywidualnym kontem. Uwierzytelnienie gwarantuje, że tylko autoryzowani użytkownicy mają dostęp do edycji swoich audytów.
- Kryteria akceptacji:
  - Użytkownik MOŻE korzystać z listy audytów bez logowania do systemu.
  - Użytkownik NIE MOŻE dodawać, edytować i usuwać audytów bez zalogowania.
  - Użytkownik może logować się do systemu poprzez przycisk w prawym górnym rogu.
  - Użytkownik może wylogować się z systemu poprzez przycisk w prawym górnym rogu.
  - Formularz logowania i rejestracji jest dostępny jako dedykowana strona.
  - System zapewnia podstawową walidację danych logowania.
  - Odzyskiwanie hasła powinno być możliwe.

### US-005: Przeglądanie audytów
- ID: US-005
- Tytuł: Lista audytów
- Opis: Użytkownik może przeglądać listę wszystkich dodanych audytów, gdzie widoczne są podstawowe informacje takie jak unikalne oznaczenie audytu, opis, data utworzenia oraz status audytu.
- Kryteria akceptacji:
  - Lista audytów jest dostępna na stronie głównej.
  - Każdy audyt wyświetla unikalny numer/oznaczenie audytu, opis, datę utworzenia i status zatwierdzenia.
  - Edycja audytu uruchamiana poprzez zaznaczenie pozycji na liście i naciśnięciu przycisku edycji.

### US-006: Usuwanie audytu
- ID: US-006
- Tytuł: Usunięcie audytu na liście audytów
- Opis: Użytkownik ma możliwość usunięcia audytu, który nie został jeszcze zatwierdzony. Przed usunięciem system wyświetla komunikat potwierdzający akcję.
- Kryteria akceptacji:
  - Opcja usunięcia audytu jest dostępna tylko dla audytów niezatwierdzonych.
  - System wyświetla okno potwierdzenia przed ostatecznym usunięciem audytu.
  - Po potwierdzeniu, audyt zostaje trwale usunięty z listy.

## 6. Metryki sukcesu
- Co najmniej 80% wypunktowanych podsumowań generowanych przez AI musi być akceptowanych przez użytkowników.
- Czas oczekiwania na generowanie podsumowania przez AI powinien być minimalny, aby zapewnić płynność procesu (synchroniczny przebieg operacji).
- Wysoka dokładność i czytelność generowanego podsumowania, mierzona poprzez feedback użytkowników.
- Sprawne działanie operacji dodawania, edycji, zatwierdzania oraz usuwania audytów, co przełoży się na pozytywną ocenę użyteczności systemu przez użytkowników.
- Pozytywne oceny systemu na podstawie manualnej oceny efektów funkcjonalnych przez audytorów. 