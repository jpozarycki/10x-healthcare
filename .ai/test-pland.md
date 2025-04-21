# Kompleksowy Plan Testów dla Projektu MedMinder Plus

**Wersja:** 1.0
**Data:** 2024-08-01
**Autor:** [Twoje Imię/Zespół QA]

## Spis Treści

1.  [Wprowadzenie i Cele Testowania](#1-wprowadzenie-i-cele-testowania)
2.  [Zakres Testów](#2-zakres-testów)
    *   [Funkcjonalności w Zakresie Testów](#21-funkcjonalności-w-zakresie-testów)
    *   [Funkcjonalności Poza Zakresem Testów](#22-funkcjonalności-poza-zakresem-testów)
3.  [Typy Testów](#3-typy-testów)
4.  [Scenariusze Testowe dla Kluczowych Funkcjonalności](#4-scenariusze-testowe-dla-kluczowych-funkcjonalności)
    *   [Zarządzanie Użytkownikiem (Autentykacja i Profil)](#41-zarządzanie-użytkownikiem-autentykacja-i-profil)
    *   [Zarządzanie Lekami (Medication Management)](#42-zarządzanie-lekami-medication-management)
    *   [Powiadomienia i Alerty (AI-Powered Reminders)](#43-powiadomienia-i-alerty-ai-powered-reminders)
    *   [Treści Edukacyjne](#44-treści-edukacyjne)
    *   [Interfejs Użytkownika (UI)](#45-interfejs-użytkownika-ui)
5.  [Środowisko Testowe](#5-środowisko-testowe)
6.  [Narzędzia do Testowania](#6-narzędzia-do-testowania)
7.  [Harmonogram Testów](#7-harmonogram-testów)
8.  [Kryteria Akceptacji Testów](#8-kryteria-akceptacji-testów)
    *   [Kryteria Wejścia](#81-kryteria-wejścia)
    *   [Kryteria Wyjścia](#82-kryteria-wyjścia)
9.  [Role i Odpowiedzialności](#9-role-i-odpowiedzialności)
10. [Procedury Raportowania Błędów](#10-procedury-raportowania-błędów)

---

## 1. Wprowadzenie i Cele Testowania

**Wprowadzenie:**
Niniejszy dokument określa plan testów dla aplikacji MedMinder Plus - nowoczesnej aplikacji do zarządzania lekami, wykorzystującej sztuczną inteligencję do personalizacji przypomnień i angażowania użytkowników. Plan ten obejmuje strategię, zakres, zasoby i harmonogram działań testowych mających na celu zapewnienie wysokiej jakości, niezawodności i bezpieczeństwa aplikacji.

**Cele Testowania:**
Główne cele procesu testowego to:
*   Weryfikacja, czy aplikacja spełnia zdefiniowane wymagania funkcjonalne i niefunkcjonalne.
*   Identyfikacja i raportowanie defektów przed wdrożeniem produkcyjnym.
*   Zapewnienie stabilności i wydajności aplikacji w różnych warunkach.
*   Ocena bezpieczeństwa danych użytkownika i procesów autentykacji.
*   Zapewnienie pozytywnego doświadczenia użytkownika (UX) poprzez ocenę użyteczności i dostępności interfejsu.
*   Weryfikacja poprawnej integracji z usługami zewnętrznymi (Supabase, OpenAI/OpenRouter).
*   Potwierdzenie zgodności działania aplikacji na różnych platformach i przeglądarkach (zgodnie z zakresem).

## 2. Zakres Testów

### 2.1 Funkcjonalności w Zakresie Testów

Testowaniu podlegają następujące moduły i funkcjonalności aplikacji MedMinder Plus:

*   **Zarządzanie Użytkownikami:**
    *   Rejestracja nowego użytkownika (formularz, walidacja Zod, proces potwierdzenia email).
    *   Logowanie (formularz, walidacja, obsługa błędów).
    *   Wylogowywanie.
    *   Odzyskiwanie hasła (proces wysyłania emaila resetującego).
    *   Resetowanie hasła (formularz, walidacja).
    *   Zarządzanie sesją użytkownika (middleware, ochrona tras, odświeżanie tokenów Supabase, obsługa cookies wg `supabase-auth.mdc`).
    *   Zarządzanie profilem użytkownika (pobieranie i aktualizacja danych: imię, nazwisko, wiek, płeć, waga, jednostka wagi, schorzenia, alergie, strefa czasowa).
*   **Zarządzanie Lekami:**
    *   Dodawanie nowego leku (formularz, walidacja Zod, logika biznesowa).
    *   Wyświetlanie listy leków (paginacja, filtrowanie: kategoria, status; sortowanie: nazwa, forma, data rozpoczęcia/zakończenia).
    *   Wyświetlanie szczegółów leku.
    *   Edycja istniejącego leku (formularz, walidacja, logika aktualizacji).
    *   Usuwanie leku (potwierdzenie, logika usuwania powiązanych danych).
    *   Zarządzanie harmonogramem przyjmowania leków (typy: dzienny, tygodniowy, miesięczny, wg potrzeb; czasy, wzorce, opcja 'z jedzeniem').
    *   Import masowy leków (interfejs, przetwarzanie CSV, walidacja, obsługa błędów).
    *   Walidacja interakcji między lekami (integracja z API `/api/v1/medications/validate-interactions`, obsługa ostrzeżeń, opcja `force_save`).
*   **Powiadomienia i Alerty (AI):**
    *   Generowanie spersonalizowanych przypomnień (integracja z OpenAI/OpenRouter - na poziomie API).
    *   Mechanizm powiadomień (jeśli zaimplementowany w UI/backendzie, np. lista alertów).
    *   Obsługa błędów związanych z AI (brak klucza API, błędy OpenRouter).
*   **Treści Edukacyjne:**
    *   Dostęp do sekcji edukacyjnej (podstawowa weryfikacja dostępności strony).
    *   Wyświetlanie treści (jeśli zaimplementowane dynamiczne ładowanie).
*   **API (Backend):**
    *   Testowanie wszystkich endpointów API v1 (`/profile`, `/medications`, `/medications/{id}`, `/medications/validate-interactions`) zgodnie ze specyfikacjami OpenAPI.
    *   Walidacja danych wejściowych (Zod).
    *   Obsługa błędów (kody statusu HTTP: 2xx, 4xx, 5xx).
    *   Autentykacja i autoryzacja API (dostęp tylko dla zalogowanych użytkowników).
    *   Testowanie endpointów API auth (`/api/auth/*`).
    *   Testowanie endpointu bulk import (`/api/medications/bulk`).
    *   Testowanie logiki serwisów (`ProfileService`, `MedicationService`, `MedicationUpdateService`, `MedicationDeleteService`).
    *   Testowanie logiki OpenRouter Service (`app/lib/openrouter/service.ts` - rate limiting, caching, queueing).
*   **Interfejs Użytkownika (UI):**
    *   Responsywność (RWD) na popularnych rozdzielczościach (desktop, tablet, mobile).
    *   Spójność wizualna (zgodność z Tailwind CSS, Shadcn/ui).
    *   Działanie komponentów UI (modale, formularze, przyciski, selektory, karty itp.).
    *   Obsługa stanu ładowania i błędów w UI.
    *   Nawigacja między stronami.
    *   Obsługa trybu jasnego i ciemnego (`next-themes`).
*   **Integracje:**
    *   Integracja z Supabase (Auth, Baza Danych).
    *   Integracja z OpenAI/OpenRouter API.

### 2.2 Funkcjonalności Poza Zakresem Testów (na tę fazę)

*   Testy A/B.
*   Testy obciążeniowe symulujące ekstremalnie dużą liczbę użytkowników (szczegółowe testy wydajności mogą być przeprowadzone w późniejszej fazie).
*   Szczegółowe testy treści edukacyjnych generowanych przez AI (poza weryfikacją podstawowej funkcjonalności).
*   Testowanie specyficznych funkcji Supabase Realtime (jeśli nie są aktywnie wykorzystywane w UI).
*   Testowanie migracji danych z innych systemów (chyba że import CSV jest traktowany jako taka migracja).
*   Testy kompatybilności ze starszymi wersjami przeglądarek (np. IE11).
*   Szczegółowe testy mechanizmów logowania i audytu (poza podstawową weryfikacją działania endpointów).

## 3. Typy Testów

W ramach projektu MedMinder Plus zostaną przeprowadzone następujące typy testów:

*   **Testy Jednostkowe (Unit Tests):**
    *   **Cel:** Weryfikacja poprawności działania izolowanych komponentów (funkcje, hooki React, komponenty UI, klasy serwisów, schematy Zod).
    *   **Narzędzia:** Jest, React Testing Library.
    *   **Zakres:** Funkcje pomocnicze (`utils`), hooki (`useMedicationForm`, `useMedicationList`, `useBulkImport`), komponenty UI (renderowanie, podstawowe interakcje), logika serwisów (z zamockowanymi zależnościami np. Supabase), schematy Zod, logika OpenRouter Service.
    *   **Pokrycie:** Dążenie do wysokiego pokrycia kluczowych modułów logiki biznesowej i funkcji pomocniczych. Testy jednostkowe API (`app/__tests__/api/v1/profile/route.test.ts`) powinny zostać rozszerzone.
*   **Testy Integracyjne (Integration Tests):**
    *   **Cel:** Weryfikacja współpracy między różnymi modułami aplikacji (np. komponent UI -> hook -> API -> Supabase).
    *   **Narzędzia:** Jest, React Testing Library, Supertest (dla API), mockowanie Supabase/API.
    *   **Zakres:** Interakcja komponentów formularzy z hookami i API, przepływ danych między UI a backendem, działanie middleware w kontekście żądań, integracja API z serwisami i bazą danych (z użyciem testowej instancji Supabase lub mocków).
*   **Testy API (API Tests):**
    *   **Cel:** Weryfikacja funkcjonalności, niezawodności, wydajności i bezpieczeństwa endpointów API.
    *   **Narzędzia:** Postman, Insomnia, lub testy automatyczne (np. z użyciem `fetch` w Jest/Supertest).
    *   **Zakres:** Testowanie wszystkich endpointów (v1 i auth) zgodnie ze specyfikacjami OpenAPI, weryfikacja metod HTTP, parametrów, ciała żądania/odpowiedzi, kodów statusu, walidacji (Zod), obsługi błędów, autentykacji/autoryzacji.
*   **Testy End-to-End (E2E Tests):**
    *   **Cel:** Symulacja rzeczywistych scenariuszy użytkowania aplikacji z perspektywy użytkownika końcowego, weryfikacja całego przepływu danych.
    *   **Narzędzia:** Cypress lub Playwright.
    *   **Zakres:** Kluczowe przepływy: rejestracja -> logowanie -> dodanie leku -> edycja leku -> wylogowanie; odzyskiwanie hasła; przeglądanie listy leków z filtrowaniem; import masowy.
*   **Testy Wydajnościowe (Performance Tests):**
    *   **Cel:** Ocena szybkości odpowiedzi aplikacji, zużycia zasobów pod obciążeniem.
    *   **Narzędzia:** Lighthouse, WebPageTest, K6/JMeter (dla API).
    *   **Zakres:** Czas ładowania kluczowych stron (Dashboard, Lista Leków), czas odpowiedzi API (zwłaszcza listy leków z filtrowaniem/sortowaniem, bulk import), wydajność frontendu (React rendering).
*   **Testy Bezpieczeństwa (Security Tests):**
    *   **Cel:** Identyfikacja potencjalnych luk bezpieczeństwa.
    *   **Narzędzia:** OWASP ZAP (podstawowy skan), manualna weryfikacja, przegląd kodu.
    *   **Zakres:** Weryfikacja ochrony tras (middleware), walidacja danych wejściowych (zapobieganie XSS, Injection), bezpieczeństwo sesji/tokenów (Supabase Auth), kontrola dostępu do danych (czy użytkownik widzi tylko swoje dane?), bezpieczeństwo API Keys (nie powinny być eksponowane na frontendzie).
*   **Testy Użyteczności (Usability Tests):**
    *   **Cel:** Ocena łatwości obsługi i intuicyjności interfejsu użytkownika.
    *   **Metody:** Testy korytarzowe, heurystyczna ocena ekspercka.
    *   **Zakres:** Nawigacja, zrozumiałość komunikatów, łatwość wypełniania formularzy, ogólna płynność interakcji.
*   **Testy Dostępności (Accessibility Tests):**
    *   **Cel:** Zapewnienie zgodności aplikacji ze standardami WCAG (poziom AA).
    *   **Narzędzia:** Axe DevTools, Lighthouse, czytniki ekranu (NVDA, VoiceOver).
    *   **Zakres:** Kontrast kolorów, nawigacja klawiaturą, atrybuty ARIA, semantyka HTML, alternatywne opisy obrazów (jeśli dotyczy). Wykorzystanie Shadcn/ui jest dobrym punktem wyjścia.
*   **Testy Wizualnej Regresji (Visual Regression Tests):**
    *   **Cel:** Wykrywanie niezamierzonych zmian w wyglądzie interfejsu.
    *   **Narzędzia:** Chromatic, Percy, Storybook (jeśli używany).
    *   **Zakres:** Kluczowe strony i komponenty UI.
*   **Testy Kompatybilności (Compatibility Tests):**
    *   **Cel:** Zapewnienie poprawnego działania na różnych przeglądarkach i urządzeniach.
    *   **Zakres:** Najnowsze wersje Chrome, Firefox, Safari, Edge na Desktop; Chrome i Safari na Mobile (iOS/Android). Testowanie responsywności.

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

Poniżej przedstawiono przykładowe, wysokopoziomowe scenariusze testowe. Szczegółowe przypadki testowe zostaną opracowane w osobnym dokumencie lub systemie zarządzania testami.

### 4.1 Zarządzanie Użytkownikiem (Autentykacja i Profil)

*   **Rejestracja:**
    *   Pomyślna rejestracja z poprawnymi danymi.
    *   Próba rejestracji z niepoprawnym/istniejącym emailem.
    *   Próba rejestracji z niespełnionymi wymaganiami walidacji (np. słabe hasło, niezgodne hasła, brakujące pola).
    *   Weryfikacja wysłania emaila potwierdzającego (jeśli dotyczy).
    *   Weryfikacja utworzenia rekordu w `user_profiles` po rejestracji.
*   **Logowanie:**
    *   Pomyślne logowanie z poprawnymi danymi.
    *   Próba logowania z niepoprawnym emailem/hasłem.
    *   Próba logowania z pustymi polami.
    *   Weryfikacja przekierowania do dashboardu po pomyślnym logowaniu.
    *   Weryfikacja przekierowania na stronę logowania przy próbie dostępu do chronionej strony bez logowania (test middleware).
    *   Weryfikacja przekierowania na dashboard przy próbie dostępu do strony logowania będąc zalogowanym (test middleware).
*   **Odzyskiwanie/Reset Hasła:**
    *   Pomyślne wysłanie instrukcji odzyskiwania hasła.
    *   Próba odzyskania dla nieistniejącego emaila (oczekiwany ten sam komunikat sukcesu).
    *   Pomyślny reset hasła przy użyciu linku/tokenu.
    *   Próba resetu hasła z niepoprawnym/wygasłym tokenem.
    *   Walidacja nowego hasła podczas resetu.
*   **Profil Użytkownika:**
    *   Pomyślne pobranie danych profilowych po zalogowaniu.
    *   Pomyślna aktualizacja danych profilowych.
    *   Próba aktualizacji z niepoprawnymi danymi (np. wiek jako tekst).
    *   Weryfikacja, że użytkownik nie może uzyskać/zmodyfikować profilu innego użytkownika (test API).

### 4.2 Zarządzanie Lekami (Medication Management)

*   **CRUD Leków:**
    *   Pomyślne dodanie nowego leku z minimalnymi wymaganymi danymi.
    *   Pomyślne dodanie nowego leku ze wszystkimi opcjonalnymi polami.
    *   Próba dodania leku z brakującymi wymaganymi polami lub niepoprawnymi danymi (walidacja Zod).
    *   Weryfikacja ostrzeżenia o interakcjach leków podczas dodawania (jeśli dotyczy).
    *   Pomyślne dodanie leku pomimo ostrzeżenia o interakcjach (z użyciem `force_save`).
    *   Pomyślne wyświetlenie listy leków (sprawdzenie paginacji, sortowania, filtrowania).
    *   Pomyślne wyświetlenie szczegółów leku.
    *   Pomyślna edycja istniejącego leku.
    *   Próba edycji leku z niepoprawnymi danymi.
    *   Pomyślne usunięcie leku (po potwierdzeniu).
    *   Weryfikacja, że użytkownik widzi i zarządza tylko swoimi lekami.
*   **Harmonogram:**
    *   Konfiguracja harmonogramu typu 'daily' z jednym/wieloma czasami.
    *   Konfiguracja harmonogramu typu 'weekly' z wybranymi dniami i czasami.
    *   Konfiguracja harmonogramu typu 'monthly' z wybranymi dniami i czasami.
    *   Konfiguracja harmonogramu typu 'as_needed'.
    *   Weryfikacja opcji 'with food'.
*   **Import Masowy:**
    *   Pomyślny import leków z poprawnie sformatowanego pliku CSV.
    *   Próba importu z pliku CSV z błędami (brakujące kolumny, niepoprawne formaty danych).
    *   Weryfikacja działania interfejsu do ręcznego dodawania/edycji leków w trybie importu.
    *   Weryfikacja kroku przeglądu i potwierdzenia importu.
    *   Anulowanie procesu importu.

### 4.3 Powiadomienia i Alerty (AI-Powered Reminders)

*   Weryfikacja (na poziomie API), że żądanie generowania przypomnienia do OpenRouter jest wysyłane poprawnie (jeśli jest endpoint).
*   Testowanie obsługi błędów API OpenRouter (np. nieprawidłowy klucz, rate limit).
*   Wyświetlanie alertów/powiadomień w UI (jeśli istnieje dedykowana sekcja `/alerts`).

### 4.4 Treści Edukacyjne

*   Nawigacja do strony `/education`.
*   Weryfikacja wyświetlania statycznych komunikatów (jeśli brak danych).

### 4.5 Interfejs Użytkownika (UI)

*   Weryfikacja responsywności wszystkich stron i kluczowych komponentów (formularze, modale, listy).
*   Sprawdzenie działania trybu jasnego/ciemnego.
*   Testowanie interakcji z formularzami (wprowadzanie danych, walidacja po stronie klienta, komunikaty o błędach).
*   Testowanie działania modali (otwieranie, zamykanie, interakcje wewnątrz).
*   Testowanie komponentów Shadcn/ui (np. Select, MultiSelect, Calendar).

## 5. Środowisko Testowe

*   **Środowisko Deweloperskie Lokalne:**
    *   Cel: Testy jednostkowe, integracyjne, testy deweloperskie podczas implementacji.
    *   Konfiguracja: Lokalne uruchomienie aplikacji (`npm run dev`), lokalna instancja Supabase (jeśli używana przez deweloperów) lub dedykowana instancja deweloperska Supabase. Zmienne środowiskowe z `.env.local`.
*   **Środowisko Testowe/Staging:**
    *   Cel: Testy integracyjne, E2E, UAT, wydajnościowe, bezpieczeństwa.
    *   Konfiguracja: Dedykowana instancja aplikacji wdrożona na Vercel (lub innym środowisku stagingowym). Połączenie z dedykowaną, odizolowaną instancją Supabase (stagingową) z danymi testowymi. Dedykowane klucze API dla OpenRouter (jeśli możliwe).
*   **Środowisko Produkcyjne:**
    *   Cel: Testy typu "smoke test" po wdrożeniu, monitorowanie.
    *   Konfiguracja: Środowisko produkcyjne aplikacji. Testy ograniczone do minimum, aby nie wpływać na użytkowników.

**Dane Testowe:**
*   Przygotowanie zestawu danych testowych obejmujących różne scenariusze (użytkownicy z różnymi profilami, leki o różnych harmonogramach, leki aktywne/nieaktywne, dane do importu masowego).
*   Dane testowe powinny być anonimowe i nie zawierać rzeczywistych danych medycznych.
*   Rozważenie mechanizmu resetowania/przywracania danych w środowisku testowym Supabase.

## 6. Narzędzia do Testowania

*   **Testy Jednostkowe/Integracyjne:**
    *   Framework: Jest (`jest`)
    *   Biblioteki pomocnicze: React Testing Library (`@testing-library/react`), `@testing-library/jest-dom`
    *   Mockowanie: `jest.fn()`, `jest.mock()`
*   **Testy E2E:**
    *   Framework: Cypress lub Playwright
*   **Testy API:**
    *   Narzędzia manualne: Postman, Insomnia
    *   Narzędzia automatyczne: Supertest (w ramach Jest), lub dedykowany framework API (np. `fetch` w skryptach testowych)
*   **Testy Wydajnościowe:**
    *   Frontend: Przeglądarkowe narzędzia deweloperskie (Lighthouse, Performance Tab)
    *   Backend API: K6, JMeter
*   **Testy Bezpieczeństwa:**
    *   Skanery: OWASP ZAP (podstawowe skanowanie)
    *   Manualne: Przeglądarkowe narzędzia deweloperskie, przegląd kodu
*   **Testy Dostępności:**
    *   Narzędzia: Axe DevTools (rozszerzenie przeglądarki), Lighthouse
    *   Czytniki ekranu: NVDA (Windows), VoiceOver (macOS)
*   **Testy Wizualnej Regresji:**
    *   Narzędzia: Chromatic, Percy (wymaga integracji, np. ze Storybookiem)
*   **Zarządzanie Testami i Błędami:**
    *   Jira, GitHub Issues, lub inne narzędzie do zarządzania projektami/błędami.
*   **Inne:**
    *   Przeglądarkowe narzędzia deweloperskie (do inspekcji, debugowania, analizy sieci).
    *   Vercel Previews (do testowania zmian w izolowanych środowiskach PR).

## 7. Harmonogram Testów

Harmonogram testów jest ściśle powiązany z harmonogramem rozwoju projektu.

*   **Testy Jednostkowe i Integracyjne (Ciągłe):** Przeprowadzane przez deweloperów podczas implementacji nowych funkcji i refaktoryzacji. Uruchamiane automatycznie w ramach CI/CD.
*   **Testy API (Ciągłe/Iteracyjne):** Rozwijane równolegle z implementacją endpointów. Przeprowadzane manualnie i automatycznie przed każdym wydaniem.
*   **Testy E2E (Iteracyjne):** Rozwijane dla kluczowych przepływów. Uruchamiane przed każdym wydaniem na środowisku Staging.
*   **Testy Manualne (Funkcjonalne, Eksploracyjne, Użyteczności) (Przed Wydaniem):** Przeprowadzane przez zespół QA na środowisku Staging po ustabilizowaniu wersji.
*   **Testy Kompatybilności i Dostępności (Przed Wydaniem):** Przeprowadzane na środowisku Staging.
*   **Testy Wydajnościowe i Bezpieczeństwa (Okresowo/Przed Kluczowymi Wydaniami):** Przeprowadzane na środowisku Staging lub dedykowanym środowisku testowym.
*   **Testy Regresji (Przed Wydaniem):** Wykonywane przed każdym wdrożeniem na produkcję, obejmujące testy manualne i automatyczne (Unit, Integration, E2E, API).
*   **Testy Akceptacyjne Użytkownika (UAT) (Przed Wydaniem):** Jeśli dotyczy, przeprowadzane przez interesariuszy/Product Ownera na środowisku Staging.
*   **Testy Smoke (Po Wdrożeniu):** Krótkie testy weryfikujące kluczowe funkcjonalności na środowisku produkcyjnym bezpośrednio po wdrożeniu.

Szczegółowy harmonogram zostanie dostosowany do sprintów lub faz projektu.

## 8. Kryteria Akceptacji Testów

### 8.1 Kryteria Wejścia

Rozpoczęcie formalnej fazy testów (np. testów regresji przed wydaniem) wymaga spełnienia następujących warunków:
*   Plan testów został zatwierdzony.
*   Środowisko testowe jest przygotowane i stabilne.
*   Wymagane dane testowe są dostępne.
*   Testowana wersja aplikacji została pomyślnie zbudowana i wdrożona na środowisku testowym.
*   Dokumentacja (np. specyfikacje API) jest dostępna i aktualna.
*   Kluczowe testy jednostkowe i integracyjne przechodzą pomyślnie.

### 8.2 Kryteria Wyjścia

Zakończenie fazy testów i rekomendacja do wdrożenia produkcyjnego wymaga spełnienia następujących warunków:
*   Wszystkie zaplanowane przypadki testowe zostały wykonane.
*   Osiągnięto założony procent pomyślnie zakończonych testów (np. 95% dla testów krytycznych, 90% dla pozostałych).
*   Wszystkie zidentyfikowane defekty o priorytecie krytycznym (Blocker) i wysokim (Critical) zostały naprawione i zweryfikowane.
*   Liczba otwartych defektów o niższych priorytetach (Major, Minor, Trivial) jest akceptowalna przez Product Ownera/interesariuszy.
*   Nie zidentyfikowano żadnych krytycznych problemów z wydajnością lub bezpieczeństwem.
*   Wyniki testów zostały udokumentowane i zaakceptowane.

## 9. Role i Odpowiedzialności

*   **Inżynierowie QA:**
    *   Tworzenie i utrzymanie planu testów oraz przypadków testowych.
    *   Wykonywanie testów manualnych i eksploracyjnych.
    *   Rozwój i utrzymanie testów automatycznych (API, E2E, ew. inne).
    *   Raportowanie i weryfikacja błędów.
    *   Przygotowywanie raportów z testów.
    *   Współpraca z deweloperami i Product Ownerem.
*   **Deweloperzy:**
    *   Tworzenie i utrzymanie testów jednostkowych i integracyjnych.
    *   Naprawa zgłoszonych defektów.
    *   Uczestnictwo w przeglądach kodu pod kątem jakości i testowalności.
    *   Wsparcie w konfiguracji środowisk testowych.
*   **Product Owner / Project Manager:**
    *   Definiowanie wymagań i kryteriów akceptacji.
    *   Priorytetyzacja defektów.
    *   Podejmowanie decyzji o akceptacji ryzyka związanego z otwartymi defektami.
    *   Udział w testach UAT (jeśli dotyczy).

## 10. Procedury Raportowania Błędów

*   **Narzędzie:** Dedykowany system śledzenia błędów (np. Jira, GitHub Issues).
*   **Proces Zgłaszania:**
    *   Każdy znaleziony defekt musi zostać zgłoszony jako osobny ticket w systemie.
    *   Zgłoszenie powinno zawierać:
        *   **Tytuł:** Krótki, zwięzły opis problemu.
        *   **Opis:** Szczegółowy opis problemu, w tym kroki do reprodukcji.
        *   **Oczekiwany Rezultat:** Co powinno się wydarzyć.
        *   **Aktualny Rezultat:** Co się faktycznie wydarzyło.
        *   **Środowisko:** Wersja aplikacji, przeglądarka, system operacyjny, środowisko testowe (np. Staging).
        *   **Dowody:** Zrzuty ekranu, nagrania wideo, logi konsoli/sieci.
        *   **Priorytet/Ważność:** (np. Blocker, Critical, Major, Minor, Trivial) - wstępnie określony przez QA, ostatecznie przez PO.
        *   **Przypisanie:** Początkowo do lidera zespołu deweloperskiego lub do triażu.
*   **Cykl Życia Błędu:**
    1.  **New/Open:** Zgłoszony błąd.
    2.  **In Triage/Analysis:** Analiza błędu, potwierdzenie, priorytetyzacja.
    3.  **Assigned/To Do:** Błąd przypisany do dewelopera.
    4.  **In Progress:** Deweloper pracuje nad naprawą.
    5.  **Resolved/Fixed:** Błąd naprawiony przez dewelopera.
    6.  **Ready for Testing/In Verification:** Błąd gotowy do weryfikacji przez QA na środowisku testowym.
    7.  **Verified/Closed:** Poprawka zweryfikowana pomyślnie przez QA.
    8.  **Reopened:** Weryfikacja nie powiodła się, błąd wraca do dewelopera.
*   **Komunikacja:** Regularne spotkania (np. daily stand-up, spotkania triage błędów) w celu omówienia statusu błędów i priorytetów.