# API Endpoint Implementation Plan: Create Medication (POST /v1/medications)

## 1. Przegląd punktu końcowego
Endpoint umożliwiający dodanie nowego rekordu leku do systemu. Użytkownik przesyła dane dotyczące leku, w tym nazwę, formę, kategorię, daty rozpoczęcia przyjmowania, informacje o dawkowaniu oraz opcjonalny harmonogram przyjmowania. Dodatkowo, przed ostatecznym zatwierdzeniem, system sprawdza potencjalne interakcje nowego leku z już stosowanymi lekami. Celem jest nie tylko umożliwienie zarządzania profilami leków i monitorowanie terapii, ale też zapewnienie bezpieczeństwa poprzez wykrywanie ryzykownych interakcji.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** /v1/medications
- **Parametry (Request Body):**
  - **Wymagane:**
    - `name` (string): Nazwa leku
    - `form` (string): Forma leku (np. tabletka, kapsułka)
    - `category` (string): Kategoria leku (zgodnie z enum medication_category)
    - `start_date` (date): Data rozpoczęcia przyjmowania
  - **Opcjonalne:**
    - `strength` (string): Siła leku (np. dawka)
    - `strength_unit_id` (uuid): Identyfikator jednostki miary siły leku
    - `purpose` (string): Cel stosowania leku
    - `instructions` (string): Instrukcje dotyczące przyjmowania leku
    - `end_date` (date): Data zakończenia terapii
    - `refill_reminder_days` (number): Liczba dni przed wygaśnięciem, kiedy wysyłane jest przypomnienie o uzupełnieniu leku
    - `pills_per_refill` (number): Liczba tabletek przy jednym uzupełnieniu
    - `schedule` (object): Obiekt harmonogramu, zawierający:
       - `type` (string): Typ harmonogramu
       - `pattern` (object): Wzorzec harmonogramu (przechowywany jako JSONB)
       - `times` (string[]): Lista godzin przyjmowania leku
       - `with_food` (boolean): Czy lek ma być przyjmowany z posiłkiem

## 3. Wykorzystywane typy
- **DTO:** `CreateMedicationRequest` (zdefiniowany w `app/types.ts`)
- **Command Model:** Struktura danych przyjmowanych przez endpoint, która odpowiada modelowi `CreateMedicationRequest`.
- **Dodatkowe DTO:** `ValidateMedicationInteractionsRequest` oraz powiązane typy (np. `ValidateMedicationInteractionsResponse`) używane wewnętrznie do sprawdzania interakcji – mogą pochodzić z dedykowanego modułu walidacji interakcji.

## 4. Szczegóły odpowiedzi
- **Kody statusu:**
  - `201 Created` – Lek został pomyślnie utworzony
  - `400 Bad Request` – Błąd walidacji danych wejściowych lub wykryto krytyczne interakcje, które blokują dodanie nowego leku
  - `401 Unauthorized` – Użytkownik nie jest autoryzowany
  - `500 Internal Server Error` – Błąd po stronie serwera
- **Treść odpowiedzi:** Powinna zawierać potwierdzenie utworzenia, np. identyfikator nowego rekordu leku, lub informacje o wykrytych interakcjach, które mogą wymagać dalszych kroków (np. potwierdzenia od użytkownika).

## 5. Przepływ danych
1. Klient wysyła żądanie POST do `/v1/medications` z danymi w formacie JSON.
2. Warstwa kontrolera odbiera żądanie, weryfikuje autoryzację użytkownika (np. za pomocą middleware Supabase lub Next.js App Router) i przekazuje dane do dalszej walidacji.
3. Dane wejściowe są walidowane przy użyciu schematu (np. z wykorzystaniem biblioteki Zod) zgodnie z modelem `CreateMedicationRequest`.
3a. **Sprawdzanie interakcji:**  
   - Po pomyślnej walidacji danych, przed ostatecznym utworzeniem rekordu, wywoływana jest funkcja sprawdzająca interakcje z istniejącymi lekami użytkownika.  
   - Funkcja ta wykorzystuje dane wejściowe (np. `name`, `strength`, `form`) oraz pobiera listę aktualnie przyjmowanych leków, aby wygenerować obiekt `ValidateMedicationInteractionsRequest`.  
   - W przypadku wykrycia krytycznych interakcji, system może zwrócić błąd (400 Bad Request) z opisem problemu lub, alternatywnie, poprosić użytkownika o potwierdzenie kontynuacji.\n
4. Jeśli funkcja sprawdzania interakcji zakończy się pozytywnie, dane są przekazywane do warstwy serwisowej, która:
   - Tworzy rekord leku w tabeli `medications`
   - Jeśli podany, tworzy powiązany rekord harmonogramu w tabeli `medication_schedules`
5. Warstwa serwisowa komunikuje się z bazą danych przy użyciu bezpiecznych zapytań (przy użyciu ORM lub przygotowanych instrukcji SQL).
6. Po udanym utworzeniu rekordów, serwis zwraca potwierdzenie, które kontroler przesyła jako odpowiedź `201 Created` do klienta.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie i autoryzacja:** Endpoint dostępny tylko dla zalogowanych użytkowników. Weryfikacja odbywa się przez dedykowany middleware (np. Supabase Server Client).
- **Walidacja danych:** Dokładna walidacja danych wejściowych przy użyciu narzędzi takich jak Zod, aby zabezpieczyć się przed wstrzyknięciami SQL oraz nieprawidłowymi danymi.
- **Bezpieczne zapytania:** Korzystanie z przygotowanych zapytań lub ORM w celu eliminacji ryzyka SQL Injection.
- **Audit trail:** Opcjonalne logowanie operacji tworzenia leku dla celów audytu i monitoringu.
- **Weryfikacja interakcji:** Dodatkowa warstwa sprawdzająca interakcje zabezpiecza użytkownika przed potencjalnie niebezpiecznymi kombinacjami leków.

## 7. Obsługa błędów
- **400 Bad Request:**
  - W przypadku niepoprawnych danych wejściowych (np. brak wymaganych pól lub niezgodny format daty)
  - Wykrycie krytycznych interakcji, które uniemożliwiają dodanie nowego leku
- **401 Unauthorized:** Gdy użytkownik nie jest zalogowany lub token uwierzytelniający wygasł.
- **500 Internal Server Error:** W przypadku nieoczekiwanych błędów w logice biznesowej lub przy komunikacji z bazą danych.
- **Logowanie błędów:** Wszystkie błędy powinny być logowane (np. z wykorzystaniem Sentry) oraz opcjonalnie rejestrowane w dedykowanej tabeli błędów.

## 8. Rozważania dotyczące wydajności
- **Indeksacja bazy danych:** Upewnienie się, że kluczowe pola do filtrowania (np. `start_date`, `category`) mają odpowiednie indeksy.
- **Connection pooling:** Zarządzanie połączeniami z bazą danych w celu zapewnienia wysokiej wydajności zapytań.
- **Asynchroniczne operacje:** Użycie asynchronicznych funkcji do zapisu danych, co pozwala na nieblokowanie głównego wątku.
- **Integracja z usługą walidacji interakcji:** W przypadku wywoływania zewnętrznych usług (np. AI) warto utrzymać mechanizmy cache'owania lub asynchronicznej komunikacji, aby zminimalizować opóźnienia.

## 9. Etapy wdrożenia
1. **Projekt DTO i walidacja:**
   - Zdefiniowanie `CreateMedicationRequest` w `app/types.ts`.
   - Utworzenie schematu walidacyjnego (np. z użyciem Zod) do weryfikacji danych wejściowych.
   - Zdefiniowanie struktury `ValidateMedicationInteractionsRequest` oraz powiązanych typów dla wewnętrznego wykorzystania.
2. **Implementacja kontrolera:**
   - Utworzenie route handlera dla POST `/v1/medications` w katalogu `app/api/v1/medications/`.
   - Integracja z middleware zapewniającym uwierzytelnianie.
3. **Implementacja logiki serwisowej:**
   - Utworzenie funkcji odpowiedzialnej za zapis rekordu leku i powiązanego harmonogramu w bazie danych.
   - Integracja z warstwą dostępu do danych przy użyciu ORM lub bezpośrednich zapytań SQL.
   - **Implementacja funkcji sprawdzania interakcji:** Przed ostatecznym zapisaniem nowego leku, wywołanie modułu (lub serwisu) walidującego interakcje na podstawie aktualnych leków użytkownika. Logika ta może wykorzystywać AI (OpenRouter) lub lokalne reguły biznesowe, wykorzystując DTO `ValidateMedicationInteractionsRequest`.
4. **Obsługa błędów i logowanie:**
   - Dodanie mechanizmów obsługi błędów oraz logowania, np. poprzez Sentry lub dedykowany system logowania.
5. **Review i audyt bezpieczeństwa:**
   - Przeprowadzenie przeglądu kodu (code review) oraz audytu bezpieczeństwa.
6. **Wdrożenie i monitoring:**
   - Deployment endpointu na środowisko staging, monitorowanie działania, a następnie deploy do produkcji.