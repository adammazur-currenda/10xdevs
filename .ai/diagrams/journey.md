<user_journey_analysis>
Analiza podróży użytkownika w kontekście modułu autentykacji:
1. Ścieżki użytkownika na podstawie dokumentacji PRD i specyfikacji autentykacji:
   - Przeglądanie audytów na stronie głównej (dostęp publiczny) bez konieczności logowania.
   - Akcje wymagające uwierzytelnienia (dodawanie/edycja audytu) skutkują przekierowaniem do strony logowania.
   - Użytkownik ma możliwość wyboru: logowania, rejestracji lub odzyskania hasła.
2. Główne podróże i stany:
   - Podróż logowania:
     • Przejście ze Strony Głównej do Formularza Logowania.
     • Weryfikacja danych: w przypadku błędnych danych pojawia się komunikat, a użytkownik ma możliwość ponownej próby, w przypadku poprawnych następuje przekierowanie do Panelu Użytkownika.
   - Podróż rejestracji:
     • Przejście ze Strony Głównej do Formularza Rejestracji.
     • Weryfikacja i walidacja danych: przy błędach użytkownik wraca do formularza, przy sukcesie następuje wysłanie linku weryfikacyjnego.
     • Po weryfikacji email użytkownik trafia do Panelu Użytkownika.
   - Podróż odzyskiwania hasła:
     • Użytkownik wybiera opcję "Zapomniałeś hasła?" na Stronie Głównej, co prowadzi do formularza resetowania hasła.
     • Po wysłaniu emaila, użytkownik klikając link, przechodzi do Formularza Aktualizacji Hasła.
     • Po zmianie hasła następuje przekierowanie do Panelu Użytkownika.
3. Punkty decyzyjne:
   - Wybór: logowanie, rejestracja lub reset hasła.
   - Walidacja formularzy – błąd vs. dane poprawne.
4. Opis stanów:
   - Strona Główna: Miejsce startowe, gdzie użytkownik przegląda audyty.
   - Formularz Logowania: Pozwala na wprowadzenie danych logowania.
   - Formularz Rejestracji: Umożliwia założenie nowego konta.
   - Formularz Resetowania Hasła: Pozwala na wprowadzenie emaila do resetu hasła.
   - Formularz Aktualizacji Hasła: Umożliwia ustawienie nowego hasła po kliknięciu linku resetującego.
   - Panel Użytkownika: Dostępny po pomyślnym uwierzytelnieniu, zawiera główne funkcje aplikacji.
</user_journey_analysis>

<mermaid_diagram>
```mermaid
stateDiagram-v2
    [*] --> Strona_Główna: Start
    Strona_Główna --> Logowanie: Kliknij "Zaloguj się"
    Strona_Główna --> Rejestracja: Kliknij "Utwórz konto"
    Strona_Główna --> Reset_Hasła: Kliknij "Zapomniałeś hasła?"

    state Logowanie {
        [*] --> Formularz_Logowania
        Formularz_Logowania --> Blad_Logowania: Dane niepoprawne
        Blad_Logowania --> Formularz_Logowania: Ponów próbę
        Formularz_Logowania --> Panel_Użytkownika: Dane poprawne
    }

    state Rejestracja {
        [*] --> Formularz_Rejestracji
        Formularz_Rejestracji --> Walidacja_Danych: Wysyłanie formularza
        Walidacja_Danych --> Blad_Rejestracji: Dane niepoprawne
        Blad_Rejestracji --> Formularz_Rejestracji: Popraw dane
        Walidacja_Danych --> Wysłanie_Linku: Dane poprawne
        Wysłanie_Linku --> Weryfikacja_Email: Link wysłany
        Weryfikacja_Email --> Panel_Użytkownika: Email zweryfikowany
    }

    state Reset_Hasła {
        [*] --> Formularz_Reset: Wprowadź email
        Formularz_Reset --> Wysłanie_Reset: Wyślij email
        Wysłanie_Reset --> Aktualizacja_Hasła: Kliknij link z emaila
        Aktualizacja_Hasła --> Panel_Użytkownika: Zmień hasło
    }

    Panel_Użytkownika --> [*]: Wyloguj się
```
</mermaid_diagram> 