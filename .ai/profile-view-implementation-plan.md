# Plan implementacji widoku Profil

## 1. Przegląd
Widok Profil umożliwia użytkownikowi zarządzanie danymi osobowymi, ustawieniami powiadomień oraz opcjami bezpieczeństwa i prywatności. Celem jest umożliwienie łatwej edycji danych profilowych w przyjaznym interfejsie, zgodnie z wymaganiami aplikacji MedMinder Plus.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/profile`.

## 3. Struktura komponentów
- **ProfilePage** (komponent strony): Główny kontener widoku, odpowiedzialny za pobieranie danych profilu z API oraz przekazywanie ich do komponentów potomnych.
  - **ProfileForm**: Formularz umożliwiający edycję danych profilu.
  - **(Opcjonalnie) ProfileNavigation**: Element nawigacyjny do przełączania między sekcjami ustawień (np. dane osobowe, powiadomienia, bezpieczeństwo).

## 4. Szczegóły komponentów
### ProfilePage
- **Opis:** Główny komponent strony, pobiera dane profilu (GET /v1/profile) i zarządza stanem widoku.
- **Główne elementy:** Nagłówek, komponent ProfileForm, ewentualne powiadomienia o błędach/sukcesie.
- **Obsługiwane interakcje:** Inicjalne pobranie danych profilu, przekazanie danych do formularza, obsługa globalnych komunikatów.
- **Walidacja:** Sprawdzenie, czy użytkownik jest uwierzytelniony i czy dane zostały prawidłowo pobrane.
- **Typy:** Wykorzystanie typu `GetProfileResponse` z \`app/types.ts\`.
- **Propsy:** Brak – dane są pobierane wewnątrz komponentu.

### ProfileForm
- **Opis:** Formularz umożliwiający edycję danych profilu, takich jak imię, nazwisko, wiek, płeć, waga, jednostka wagi, warunki zdrowotne, alergie oraz strefa czasowa.
- **Główne elementy:** Pola formularza (inputy, selecty), przycisk zapisu (submit), przyciski pomocnicze (np. anuluj).
- **Obsługiwane interakcje:** Aktualizacja wartości pól, walidacja przy submit, wysyłka danych (PUT /v1/profile) do backendu, aktualizacja stanu i wyświetlanie komunikatów o powodzeniu lub błędzie.
- **Obsługiwana walidacja:** 
  - Pola `first_name` i `last_name` nie mogą być puste.
  - Pola `age` i `weight` muszą być liczbami większymi od zera.
  - Pole `timezone` powinno być zgodne z oczekiwanym formatem.
- **Typy:** Korzysta z typu `UpdateProfileRequest` z \`app/types.ts\` oraz ewentualnego lokalnego modelu np. `ProfileViewModel`.
- **Propsy:** Początkowe dane profilu, callback do obsługi zapisu aktualizacji.

### ProfileNavigation (opcjonalnie)
- **Opis:** Komponent umożliwiający przełączanie się pomiędzy różnymi sekcjami ustawień profilu (dane osobowe, powiadomienia, bezpieczeństwo).
- **Główne elementy:** Lista linków lub przycisków nawigacyjnych.
- **Obsługiwane interakcje:** Kliknięcia zmieniające aktywną sekcję.
- **Walidacja:** Brak specyficznej walidacji, zarządzanie stanem wybranej sekcji.
- **Typy:** Proste typy (np. string lub enum) reprezentujące dostępne sekcje.
- **Propsy:** Aktualna sekcja, callback do zmiany aktywnej sekcji.

## 5. Typy
- Wykorzystujemy istniejące typy:
  - `GetProfileResponse` – do pobierania profilu.
  - `UpdateProfileRequest` – do wysyłki zaktualizowanych danych profilu.
- Możliwy dodatkowy typ: 
  - **ProfileViewModel**: 
    - `id: string`
    - `firstName: string`
    - `lastName: string`
    - `age: number`
    - `gender: string`
    - `weight: number`
    - `weightUnit: string`
    - `healthConditions: string[]`
    - `allergies: string[]`
    - `timezone: string`

## 6. Zarządzanie stanem
- Użycie wbudowanych hooków React (`useState`, `useEffect`) do zarządzania stanem formularza, stanem ładowania i błędów.
- Rozważenie stworzenia custom hooka `useProfile` odpowiedzialnego za:
  - Pobieranie danych profilu (GET /v1/profile).
  - Obsługę aktualizacji danych (PUT /v1/profile).
- Stan główny: dane profilu, stan ładowania, stan błędów, komunikaty sukcesu.

## 7. Integracja API
- **GET /v1/profile:** Pobieranie danych profilu użytkownika. Wykorzystanie typu `GetProfileResponse`.
- **PUT /v1/profile:** Aktualizacja danych profilu. Wysyłka danych zgodnych z typem `UpdateProfileRequest`.
- Obsługa odpowiedzi: w przypadku sukcesu – aktualizacja lokalnego stanu, przy błędzie – wyświetlenie komunikatu.

## 8. Interakcje użytkownika
- Użytkownik wchodzi na stronę `/profile` i widzi aktualne dane profilu.
- Użytkownik modyfikuje dane w formularzu.
- Po kliknięciu przycisku "Zapisz", formularz waliduje dane i wysyła zapytanie PUT do API.
- W przypadku sukcesu wyświetlany jest komunikat o pomyślnym zapisaniu zmian.
- W przypadku błędów formularz podświetla nieprawidłowe pola oraz wyświetla komunikat o błędzie.

## 9. Warunki i walidacja
- Walidacja pól formularza:
  - `first_name` i `last_name` – nie mogą być puste.
  - `age` oraz `weight` – muszą być liczbami większymi od zera.
  - `timezone` – sprawdzenie poprawności formatu (możliwe odwołanie do listy stref czasowych).
- Przed wysłaniem danych, formularz powinien upewnić się, że wszystkie dane są zgodne z wymaganiami API.
- Weryfikacja odpowiedzi API – sprawdzanie kodów statusu HTTP oraz komunikatów błędów.

## 10. Obsługa błędów
- Wyświetlanie komunikatów błędów w przypadku:
  - Błędów walidacji formularza (np. puste pola, niepoprawne wartości liczbowe).
  - Błędów sieciowych lub błędów API (np. 401, 422, 500).
- Zapewnienie feedbacku wizualnego (np. czerwona ramka, komunikaty tekstowe) dla użytkownika.

## 11. Kroki implementacji
1. Utworzyć stronę widoku w katalogu `app/profile/page.tsx`.
2. Zaimplementować komponent `ProfilePage`:
   - Pobiera dane profilu poprzez GET /v1/profile.
   - Przekazuje dane do komponentu `ProfileForm`.
3. Zaimplementować komponent `ProfileForm`:
   - Utworzyć pola formularza odpowiadające danym profilowym.
   - Dodać walidację pól przed wysłaniem (można użyć Zod lub innej biblioteki walidacyjnej).
   - Zaimplementować logikę wysyłki zapytania PUT do API i obsługę odpowiedzi.
4. (Opcjonalnie) Zaimplementować komponent `ProfileNavigation` do przełączania między sekcjami ustawień profilu.
5. Stworzyć custom hook `useProfile` do zarządzania stanem pobierania danych i aktualizacji profilu.
6. Zintegrować feedback wizualny (loading, success, error) w interfejsie użytkownika.
7. Dokonać testów funkcjonalnych widoku, sprawdzając poprawność działania walidacji oraz integracji API.
8. Zapewnić responsywność widoku przy użyciu Tailwind CSS oraz zgodność z komponentami Shadcn/ui.
9. Przeprowadzić finalny code review oraz testy akceptacyjne. 