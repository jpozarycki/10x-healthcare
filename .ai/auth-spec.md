# Specyfikacja modułu Autentykacji (Rejestracja, Logowanie, Odzyskiwanie Hasła)

## Założenia ogólne
- Użytkownik rejestruje się za pomocą email, hasła i potwierdzenia hasła.
- Nie wykorzystujemy usług zewnętrznych (social authentication) do logowania.
- Podczas rejestracji mogą być zbierane dodatkowe dane użytkownika, takie jak podstawowe dane demograficzne (wiek, płeć, waga), warunki zdrowotne, alergie, preferencje komunikacyjne oraz ocena poziomu health literacy.

## 1. Architektura Interfejsu Użytkownika

### a) Strony i Layouty
- Utworzenie dedykowanych stron:
  - **Strona rejestracji**: zawiera formularz rejestracyjny z polami: email, hasło oraz potwierdzenie hasła, a także dodatkowe dane (np. preferencje użytkownika). 
  - **Strona logowania**: zawiera formularz logowania wymagający email i hasła.
  - **Strona odzyskiwania hasła**: umożliwia wpisanie adresu email w celu otrzymania instrukcji resetowania hasła.
  - **Strony chronione**: strony dostępne wyłącznie dla zalogowanych użytkowników (np. dashboard, profile użytkownika) z odpowiednim layoutem.

- Layout aplikacji:
  - **Layout publiczny (non-auth)**: prosty układ dla stron dostępnych bez logowania, skupiający się na jasnych komunikatach i łatwej nawigacji.
  - **Layout dla stron chronionych (auth)**: rozszerzony o elementy takie jak pasek nagłówka, menu nawigacyjne oraz widoczny stan zalogowania użytkownika.
  - Mechanizm przekierowywania: użytkownik niezalogowany, próbując uzyskać dostęp do chronionej strony, zostanie przekierowany do strony logowania.

### b) Komponenty i Formularze
- **Formularze**:
  - Implementowane jako dedykowane komponenty React (client-side) odpowiedzialne za zbieranie danych wejściowych i wstępną walidację przy użyciu np. biblioteki Zod.
  - Użycie komponentów UI zgodnych z wytycznymi shadcn/ui, takich jak pola formularza, przyciski i komunikaty o błędach.

- **Podział odpowiedzialności**:
  - Formularze w komponentach React odpowiadają za walidację danych (np. format email, siła hasła, zgodność hasła z potwierdzeniem) i inicjowanie akcji (np. wywołania API lub server actions w Next.js).
  - Strony Next.js (Server Components) zajmują się integracją z backendem autentykacji, obsługą sesji oraz przekierowaniami.

### c) Walidacja i Komunikaty Błędów
- Walidacja client-side:
  - Sprawdzanie formatu email, minimalnej długości hasła i zgodności hasła z potwierdzeniem.
  - Szybkie wyświetlanie komunikatów błędów pod odpowiednimi polami formularza.
  - Obsługa stanów "loading" podczas wysyłania formularza.

- Walidacja server-side:
  - Weryfikacja danych przy użyciu Zod w endpointach API.
  - Zwracanie precyzyjnych komunikatów błędów (np. "Użytkownik o podanym emailu już istnieje", "Niepoprawne dane logowania").

- Scenariusze:
  - **Rejestracja**: Walidacja wszystkich pól, przekazanie danych do endpointu rejestracji. W przypadku błędu – komunikat inline, w przypadku powodzenia – automatyczne logowanie i przekierowanie do strony chronionej.
  - **Logowanie**: Sprawdzenie poprawności danych, komunikaty o nieudanym logowaniu, przekierowanie do chronionych zasobów.
  - **Odzyskiwanie hasła**: Weryfikacja adresu email, wysłanie instrukcji resetowania hasła, informacja zwrotna dla użytkownika.
  - **Wylogowywanie**: Endpoint: POST /api/auth/logout, Opis: Endpoint kończy sesję użytkownika poprzez wyczyszczenie ciasteczek sesji oraz przekierowuje użytkownika do strony logowania.

## 2. Logika Backendowa

### a) Struktura Endpointów API
- Endpointy znajdujące się w katalogu `app/api/auth/`:
  - `POST /api/auth/register` – przyjmuje dane rejestracyjne, waliduje je (użycie Zod), tworzy konto przy użyciu Supabase Auth i ewentualnie dodaje dodatkowy profil do osobnej tabeli.
  - `POST /api/auth/login` – przyjmuje dane logowania, waliduje je i weryfikuje autentyczność użytkownika za pomocą Supabase Auth.
  - `POST /api/auth/logout` – kończy sesję użytkownika, czyści ciasteczka sesji.
  - `POST /api/auth/recover` – przyjmuje adres email, inicjuje proces odzyskiwania hasła (np. wysyła email z instrukcjami resetowania hasła).
  - (Opcjonalnie) `POST /api/auth/reset` – obsługuje faktyczny reset hasła po weryfikacji tokenu.

### b) Modele Danych
- **Model Użytkownika**:
  - Centralny model oparty o Supabase Auth, zawierający kluczowe pola tj. id, email, data utworzenia.
  - Rozszerzenie profilu użytkownika (jeśli wymagane) zapisane w osobnej tabeli z dodatkowymi polami (np. preferencje komunikacyjne, dane demograficzne).

### c) Walidacja Danych i Obsługa Wyjątków
- **Walidacja**:
  - Użycie biblioteki Zod do walidacji danych wejściowych w każdym z endpointów.
  - Definicje schematów walidacyjnych dla rejestracji, logowania i odzyskiwania hasła.

- **Obsługa wyjątków**:
  - Każdy endpoint opatrzony blokami try/catch w celu przechwytywania błędów.
  - Zwracanie odpowiednich kodów statusu HTTP (np. 400 dla błędów walidacji, 401 dla nieautoryzowanych, 500 dla błędów serwera).
  - Rejestrowanie krytycznych błędów dla celów diagnostycznych i audytu.

## 3. System Autentykacji

### a) Integracja z Supabase Auth
- Wykorzystanie pakietu `@supabase/ssr` do tworzenia klientów:
  - **Browser Client** – stosowany w operacjach client-side, np. w formularzach logowania.
  - **Server Client** – stosowany w endpointach API oraz w mechanizmach SSR w Next.js.

- Zarządzanie ciasteczkami:
  - Stosowanie metod `cookies.getAll()` oraz `cookies.setAll()` zgodnie z zaleceniami.
  - Unikanie metod `get`, `set` oraz `remove`.
  - Implementacja middleware odświeżającego tokeny i sprawdzającego stan sesji użytkownika przy każdej żądaniu.

### b) Procesy Autentykacji
- **Rejestracja**:
  - Formularz rejestracji zbiera dane, po czym dane są przesyłane do endpointu `/api/auth/register`.
  - Supabase Auth tworzy nowe konto użytkownika, po czym następuje automatyczne logowanie i utworzenie sesji.

- **Logowanie**:
  - Formularz logowania przesyła dane do endpointu `/api/auth/login`.
  - Supabase Auth weryfikuje dane, a przy poprawnych danych ustawia sesję użytkownika za pomocą bezpiecznych ciasteczek.

- **Wylogowywanie**:
  - Wywołanie endpointu `/api/auth/logout` czyści sesję poprzez usunięcie ciasteczek i przekierowanie użytkownika do strony logowania.

- **Odzyskiwanie hasła**:
  - Formularz odzyskiwania hasła wysyła adres email do `/api/auth/recover`, gdzie Supabase inicjuje procedurę resetowania hasła (np. wysyłając email z instrukcjami).

### c) Zabezpieczenia i Wydajność
- Zabezpieczenie endpointów API poprzez autoryzację i użycie middleware.
- Stosowanie bezpiecznych praktyk przy zarządzaniu ciasteczkami i sesjami.
- Użycie zmiennych środowiskowych do przechowywania kluczy i tajnych danych (zgodnie z plikiem .env).
- Optymalizacja wydajności przez wykorzystanie SSR w stronach wymagających weryfikacji sesji, minimalizowanie opóźnień przy logowaniu.

---

Podsumowując, specyfikacja definiuje wyraźny podział na warstwę interfejsu użytkownika (frontend), logikę backendową oraz system autentykacji. Rozwiązanie to gwarantuje spójne, bezpieczne i skalowalne wdrożenie modułu rejestracji, logowania oraz odzyskiwania hasła w oparciu o Next.js, TypeScript oraz Supabase Auth. 