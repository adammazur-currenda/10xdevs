# Aplikacja - ITAuditor (MVP)

## Główny problem
Weryfikacja wykonania przeglądu środowiska deploymentu dla systemu IT jest długotrwała. Zgodnie z wymaganiami organizacji wymagane jest spisanie szczegółowego protokołu z przeglądu środowiska dla systemu IT (serwery fizyczne, maszyny wirtualne, serwery aplikacyjne, bazy danych, patch management, podatności i wiele innych). Obszerny protokół z przeglądu wymaga szczegółowego zapoznania się z nim przez osobę weryfikującą realizację i jakość audytu środowiska oraz podsumowania działań podjętych przez osobę realizującą przegląd - dzięki AI taki proces podsumowania protokołu może zostać zautomatyzowany.

## Najmniejszy zestaw funkcjonalności
- Zapisywanie, odczytywanie, przeglądanie i usuwanie zleceń na przeglądy
- Prosty system kont użytkowników do powiązania użytkownika z przeglądami do niego przypisanymi
- Manualne wprowadzanie treści protokołu z przeglądu
- Integracja z AI umożliwiająca podsumowanie protokołu i jego akceptację.

## Co NIE wchodzi w zakres MVP
- Przypisywanie zleceń przeglądów do innych użytkowników
- Import protokołów z formatów (PDF, DOCX, itp.)
- Integracja z Jira w celu założenia zadań do poszczególnych działów
- Aplikacje mobilne (na początek tylko web)

## Kryteria sukcesu
- 80% podsumowań protokołów wygenerowanych przez AI jest akceptowana przez użytkownika
- 75% zaproponowanych przez AI zadań do utworzenia jest akceptowane przez użytkownika