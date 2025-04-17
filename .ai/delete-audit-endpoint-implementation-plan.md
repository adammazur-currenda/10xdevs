# API Endpoint Implementation Plan: Delete Audit Endpoint

## 1. Przegląd punktu końcowego
This endpoint allows deletion of an audit record if the record has not been approved. It ensures proper authorization and verification before deletion, maintaining system integrity and security.

## 2. Szczegóły żądania
- **Metoda HTTP:** DELETE
- **Struktura URL:** /audits/{id}
- **Parametry:**
  - **Wymagane:**
    - `id` (UUID) – identyfikator audytu przekazywany w ścieżce URL
  - **Opcjonalne:** Brak
- **Request Body:** Brak, operacja opiera się wyłącznie na parametrze URL.

## 3. Wykorzystywane typy
- **DTO / Command Model:** DeleteAuditCommand
  - Właściwości:
    - `id`: string (UUID)
- **Audit Entity:** Reprezentacja rekordu audytu z właściwościami, takimi jak `audit_order_number`, `description`, `protocol`, `summary`, `status`, `created_at`, `updated_at` oraz `user_id`.

## 4. Szczegóły odpowiedzi
- **204 No Content:** Pomyślne usunięcie audytu.
- **403 Forbidden:** Audyt jest zatwierdzony lub użytkownik nie ma dostępu do tej operacji.
- **401 Unauthorized:** Użytkownik nie jest uwierzytelniony.
- **404 Not Found:** Audyt o podanym ID nie istnieje.

## 5. Przepływ danych
1. Odbiór żądania DELETE z parametrem `id` w URL.
2. Weryfikacja autentykacji użytkownika (np. za pomocą tokena JWT).
3. Walidacja formatu `id` jako poprawnego UUID.
4. Pobranie rekordu audytu z bazy danych.
5. Sprawdzenie istnienia audytu:
   - Jeśli nie istnieje, zwrócenie odpowiedzi 404.
6. Weryfikacja statusu audytu:
   - Jeśli audyt jest zatwierdzony, zwrócenie odpowiedzi 403.
7. Jeśli wszystkie warunki są spełnione, wywołanie funkcji usuwającej audyt z bazy danych.
8. Zwrócenie odpowiedzi 204 No Content po pomyślnym usunięciu.

## 6. Względy bezpieczeństwa
- **Autentykacja:** Endpoint powinien być zabezpieczony mechanizmem uwierzytelniania (np. JWT).
- **Autoryzacja:** Sprawdzenie, czy użytkownik ma prawo usunąć dany audyt (np. audyt należy do użytkownika lub użytkownik ma odpowiednie uprawnienia administracyjne).
- **Walidacja danych:** Upewnienie się, że przekazany `id` jest poprawnym UUID i istnieje w bazie danych.
- **Sprawdzanie stanu audytu:** Zapewnienie, że audyt zatwierdzony nie może być usunięty, aby utrzymać spójność operacyjną.
- **Logowanie:** Rejestrowanie prób nieautoryzowanego dostępu oraz błędów wykonania operacji.

## 7. Obsługa błędów
- **404 Not Found:** Jeśli audyt o podanym `id` nie istnieje.
- **403 Forbidden:** Jeśli audyt jest zatwierdzony lub użytkownik nie ma do niego dostępu.
- **401 Unauthorized:** Jeśli użytkownik nie przeszedł autentykacji.
- **500 Internal Server Error:** W przypadku nieoczekiwanych błędów systemowych. 
- Dodatkowo, każdy błąd powinien być odpowiednio logowany, aby umożliwić analizę i szybką reakcję.

## 8. Rozważania dotyczące wydajności
- **Optymalizacja zapytań:** Upewnienie się, że kolumny takie jak `id` oraz `user_id` są indeksowane dla szybkiego dostępu.
- **Minimalizacja operacji:** Usuwanie jednego rekordu to operacja o niskim koszcie obliczeniowym, jednak należy unikać niepotrzebnej logiki w ścieżce krytycznej.
- **Transakcyjność:** Rozważenie użycia transakcji dla zachowania spójności danych w przypadku wykonywania dodatkowych operacji towarzyszących.

## 9. Etapy wdrożenia
1. **Stworzenie DTO:** Utworzenie modelu `DeleteAuditCommand` zawierającego właściwość `id`.
2. **Implementacja serwisu:** Dodanie metody `delete.audit` w warstwie serwisowej, która:
   - Pobierze audyt z bazy danych na podstawie `id`.
   - Zweryfikuje istnienie audytu.
   - Sprawdzi, czy audyt nie jest zatwierdzony.
   - Wykona operację usunięcia, jeśli wszystkie warunki są spełnione.
3. **Implementacja kontrolera:** Utworzenie endpointu DELETE `/audits/{id}` w kontrolerze API, który:
   - Wykona autentykację i autoryzację.
   - Przekazuje `id` do serwisu.
   - Obsługuje odpowiedzi na podstawie wyniku operacji (204, 403, 401, 404).
4. **Walidacja i testy:** Przeprowadzenie testów jednostkowych oraz integracyjnych w celu weryfikacji poprawności wdrożenia.
5. **Dodanie logowania:** Implementacja mechanizmów logowania błędów i monitorowania prób nieautoryzowanego dostępu.
6. **Code Review i refaktoryzacja:** Weryfikacja kodu przez zespół i wprowadzenie niezbędnych poprawek.
7. **Wdrożenie:** Publikacja zmian na środowisko testowe, a następnie na produkcyjne, wraz z monitorowaniem wydajności i logowaniem. 