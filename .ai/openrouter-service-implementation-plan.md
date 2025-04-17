# OpenRouter Service Implementation Plan

## 1. Opis usługi
Serwis OpenRouter to moduł integrujący z interfejsem API OpenRouter, który umożliwia uzupełnianie czatów opartych na LLM. Jego zadaniem jest przetwarzanie komunikatów systemowych oraz użytkownika, formatowanie zapytań w odpowiedniej strukturze JSON, wysyłanie ich do API oraz odbiór i walidacja odpowiedzi zgodnie z ustalonymi parametrami modeli językowych.

## 2. Opis konstruktora
Konstruktor serwisu przyjmuje konfigurację obejmującą:
1. Klucz API oraz endpoint OpenRouter.
2. Nazwę modelu oraz parametry modelu (np. temperatura, max_tokens).
3. Wzorce komunikatów systemowych oraz użytkownika.
4. Konfigurację response_format, czyli schemat JSON definiujący strukturę odpowiedzi.

Konstruktor inicjalizuje zarządzanie konfiguracją, ustawia domyślne wartości dla parametrów oraz przygotowuje pomocnicze metody do formatowania komunikatów i obsługi błędów.

## 3. Publiczne metody i pola
1. **sendRequest(messages: Message[]): Promise<Response>**
   - Przesyła sformatowane komunikaty do OpenRouter API i zwraca odpowiedź.
2. **formatMessages(systemMessage: string, userMessage: string): FormattedPayload**
   - Łączy komunikaty systemowe, użytkownika oraz konfigurację response_format w jeden spójny obiekt.
3. **setModelParameters(parameters: ModelParameters): void**
   - Umożliwia aktualizację parametrów modelu w trakcie działania serwisu.
4. **Pola konfiguracyjne:**
   - `apiKey`, `endpointUrl`, `defaultModel`, `defaultParameters`, `responseFormat`

## 4. Prywatne metody i pola
1. **_buildPayload(messages: Message[]): RequestPayload**
   - Buduje szczegółowy payload do wysłania do API zgodnie z ustalonym schematem.
2. **_validateResponse(response: any): boolean**
   - Waliduje odpowiedź otrzymaną od OpenRouter przy użyciu zdefiniowanego schematu JSON (response_format).
3. **_logError(error: Error): void**
   - Rejestruje występujące błędy oraz dodatkowe informacje do debugowania.
4. **_formatError(error: any): ErrorResponse**
   - Formatuje komunikaty błędów w jednolity sposób dla dalszej analizy.

## 5. Obsługa błędów
1. **Błąd połączenia (Network Failure)**
   - Wyzwania: Timeout, brak połączenia.
   - Rozwiązania: Retry z wykładniczym przyrostem czasu, szczegółowe logowanie błędów.
2. **Błąd odpowiedzi API (Unexpected API Response)**
   - Wyzwania: Niepoprawny format danych lub niespodziewana struktura odpowiedzi.
   - Rozwiązania: Weryfikacja odpowiedzi za pomocą `_validateResponse`, fallback do komunikatu błędu dla użytkownika.
3. **Błąd konfiguracji (Missing/Invalid Configuration)**
   - Wyzwania: Brak klucza API lub nieprawidłowe parametry.
   - Rozwiązania: Walidacja danych wejściowych w konstruktorze, jasne i natychmiastowe komunikaty o błędzie.
4. **Błąd przetwarzania danych (Data Processing Error)**
   - Wyzwania: Problemy podczas serializacji/deserializacji danych.
   - Rozwiązania: Użycie bloków try-catch wokół operacji krytycznych, szczegółowe logowanie występujących błędów.

## 6. Kwestie bezpieczeństwa
1. **Przechowywanie klucza API**
   - Klucz API powinien być przechowywany w bezpiecznym miejscu (np. zmienne środowiskowe) i nigdy bezpośrednio osadzony w kodzie.
2. **Walidacja danych wejściowych**
   - Weryfikacja poprawności komunikatów wysyłanych do API w celu zabezpieczenia przed nieprawidłowymi danymi.
3. **Ograniczenie dostępu**
   - Autoryzacja żądań do serwisu, aby zapobiec nieautoryzowanemu użyciu.
4. **Audyt i logowanie**
   - Rejestracja operacji, szczególnie w kontekście błędów i nieudanych prób połączeń, dla celów bezpieczeństwa i monitoringu.

## 7. Plan wdrożenia krok po kroku
1. **Konfiguracja projektu**
   - Upewnij się, że wszystkie niezbędne biblioteki są zainstalowane (Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui).
   - Skonfiguruj zmienne środowiskowe dla klucza API oraz endpointu OpenRouter.
2. **Implementacja modułu konfiguracji**
   - Stwórz moduł odpowiedzialny za ładowanie i walidację konfiguracji serwisu.
3. **Implementacja głównych komponentów**
   - **API Connector:** Implementacja metody `sendRequest` do komunikacji z OpenRouter API.
   - **Message Formatter:** Implementacja metody `formatMessages` umożliwiającej łączenie komunikatów systemowych i użytkownika.
   - **Response Handler:** Implementacja metod `_buildPayload` oraz `_validateResponse` do obsługi i weryfikacji odpowiedzi.
4. **Definicja schematu odpowiedzi (response_format)**
   - Zdefiniuj schemat JSON, np.:
     ```json
     { "type": "json_schema", "json_schema": { "name": "chat-response", "strict": true, "schema": { "text": "string", "suggestions": "array" } } }
     ```
5. **Implementacja obsługi komunikatów API**
   - Upewnij się, że każdy element jest poprawnie przekazywany:
     a. **Komunikat systemowy:** Przykład: "Jesteś pomocnym asystentem, który udziela precyzyjnych i zwięzłych odpowiedzi."
     b. **Komunikat użytkownika:** Przekazywane dynamicznie na podstawie interakcji użytkownika.
     c. **Response_format:** Użycie zdefiniowanego schematu JSON do walidacji odpowiedzi.
     d. **Nazwa modelu i parametry:** Przykłady:
        - Nazwa modelu: "gpt-4"
        - Parametry: { "temperature": 0.7, "max_tokens": 150, "frequency_penalty": 0 }
6. **Obsługa błędów i logowanie**
   - Zaimplementuj centralizowany mechanizm logowania oraz strategię retry dla operacji krytycznych.
7. **Testowanie**
   - Przeprowadź testy jednostkowe i integracyjne dla komunikacji z OpenRouter API, aby upewnić się, że walidacja odpowiedzi oraz obsługa błędów działają poprawnie.
8. **Wdrożenie**
   - Po pomyślnych testach wdroż serwis do środowiska produkcyjnego, monitorując logi oraz wydajność systemu. 