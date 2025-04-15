# Architektura UI dla MedMinder Plus

## 1. Przegląd struktury UI

Aplikacja MedMinder Plus została zaprojektowana zgodnie z podejściem mobile-first i nowoczesnymi standardami UX. Główny interfejs opiera się na nawigacji typu "bottom navigation" z kluczowymi widokami, uzupełnionymi o centralny przycisk FAB dla najczęściej wykonywanych akcji. Całość interfejsu skupia się na intuicyjności, dostępności i bezpieczeństwie, zapewniając użytkownikowi łatwy dostęp do najważniejszych funkcji związanych z zarządzaniem lekami, monitorowaniem adherencji, edukacją oraz powiadomieniami.

## 2. Lista widoków

### Dashboard (Home)
- Ścieżka widoku: `/dashboard`
- Główny cel: Szybki przegląd dzisiejszych leków oraz stanu adherencji.
- Kluczowe informacje: Lista leków zaplanowanych na dany dzień, timeline przyjmowania, interaktywne wykresy adherencyjne, podsumowanie powiadomień.
- Kluczowe komponenty: Karty leków (Medication Card), Timeline, Adherence Chart, Summary Notifications.
- Uwagi UX, dostępność i bezpieczeństwo: Responsywny design, czytelne komunikaty, wysoki kontrast, zachowanie integralności danych przy aktualizacjach w czasie rzeczywistym.

### Medications
- Ścieżka widoku: `/medications`
- Główny cel: Zarządzanie listą leków, możliwość dodawania, edycji i grupowego importu.
- Kluczowe informacje: Lista leków z opcjami filtrowania i wyszukiwania, szczegóły leku w formie karty oraz opcje edycji.
- Kluczowe komponenty: Medication Card, Formularz dodawania/edycji leku, Import Medications Form.
- Uwagi UX, dostępność i bezpieczeństwo: Intuicyjny interfejs dla dodawania i modyfikacji danych, wsparcie dla działań grupowych, walidacja wejścia danych oraz zabezpieczenia przed nieprawidłowymi operacjami.

### Education
- Ścieżka widoku: `/education`
- Główny cel: Prezentacja spersonalizowanych treści edukacyjnych dotyczących leków.
- Kluczowe informacje: Szczegółowe informacje o lekach, wyjaśnienia mechanizmu działania, potencjalne skutki uboczne, zalecenia, a także interaktywne elementy do pogłębienia wiedzy.
- Kluczowe komponenty: Rozwijane karty leków z sekcją edukacyjną, mechanizm expander dla szczegółów.
- Uwagi UX, dostępność i bezpieczeństwo: Czytelność tekstu, dostępność treści dla osób z ograniczeniami, opcje powiększenia czcionki, dbałość o zgodność z wytycznymi WCAG.

### Alert Center
- Ścieżka widoku: `/alerts`
- Główny cel: Centralne miejsce dla powiadomień i alertów, szczególnie dotyczących krytycznych leków.
- Kluczowe informacje: Lista powiadomień, filtrowanie alertów, przegląd historii krytycznych komunikatów.
- Kluczowe komponenty: Lista powiadomień, Toast Notifications, filtry alertów.
- Uwagi UX, dostępność i bezpieczeństwo: Natychmiastowy dostęp do ważnych informacji, widoczne komunikaty, wysoki kontrast i responsywność, mechanizmy potwierdzania akcji użytkownika.

### Profile
- Ścieżka widoku: `/profile`
- Główny cel: Zarządzanie profilem użytkownika, w tym ustawienia i edycja danych osobowych.
- Kluczowe informacje: Informacje profilowe, ustawienia powiadomień, opcje bezpieczeństwa i prywatności.
- Kluczowe komponenty: Formularz Profilu, elementy nawigacyjne do edycji danych.
- Uwagi UX, dostępność i bezpieczeństwo: Jasne komunikaty, ochrona danych osobowych, walidacja oraz autoryzacja zmian, przyjazny interfejs dostosowany do urządzeń mobilnych.

### Ekran uwierzytelniania
- Ścieżka widoku: `/auth`
- Główny cel: Umożliwienie użytkownikowi logowania i rejestracji w celu uzyskania dostępu do aplikacji.
- Kluczowe informacje: Formularz logowania, opcja rejestracji, komunikaty błędów, link do odzyskiwania hasła.
- Kluczowe komponenty: Formularz logowania, przyciski akcji (logowania, rejestracji), link do odzyskiwania hasła.
- Uwagi UX, dostępność i bezpieczeństwo: Intuicyjny interfejs, walidacja danych w czasie rzeczywistym, zabezpieczone przesyłanie danych, zgodność z wytycznymi dotyczącymi dostępności (WCAG) oraz responsywność.

## 3. Mapa podróży użytkownika

1. Rejestracja i pierwsze logowanie:
   - Użytkownik tworzy konto i uzupełnia swój profil.
   - System weryfikuje dane i przenosi użytkownika do Dashboardu.

2. Przegląd Dashboardu:
   - Użytkownik widzi zaplanowane leki na dany dzień oraz wizualizację adherencji.
   - Ścisłe powiązanie z interaktywnymi wykresami oraz timeline, umożliwiające szybki przegląd stanu zdrowia.

3. Przejście do widoku Medications:
   - Użytkownik wybiera opcję zarządzania lekami, przegląda listę i może dodać nowy lek lub skorzystać z opcji grupowego importu.
   - Kliknięcie na kartę leku otwiera szczegółowy widok (modal lub przejście do dedykowanego widoku) z dodatkowymi opcjami edycji.

4. Korzystanie z Education:
   - Użytkownik wybiera lek, aby zapoznać się ze spersonalizowanymi treściami edukacyjnymi.
   - Dostępne są rozbudowane opisy, grafiki oraz interaktywne elementy wspomagające zrozumienie informacji.

5. Alert Center i interakcja z przypomnieniami:
   - System wyświetla powiadomienia krytycznych leków w formie toastów oraz zbiorczy widok w Alert Center.
   - Użytkownik reaguje na przypomnienia za pomocą interfejsu Reminder Modal (opcje: "Wziąłem", "Pomiń", "Przypomnij później").

6. Zarządzanie profilem w widoku Profile:
   - Użytkownik może przeglądać i aktualizować swoje dane, zmieniać ustawienia bezpieczeństwa oraz wybierać preferencje komunikacyjne.

Przepływ między widokami zapewnia spójność i intuicyjność interakcji, umożliwiając szybkie przełączanie się z jednego widoku do drugiego za pomocą dolnej nawigacji oraz centralnego przycisku FAB.

## 4. Układ i struktura nawigacji

- Główna nawigacja oparta na dolnym pasku z ikonami reprezentującymi kluczowe widoki: Dashboard, Medications, Education, Alert Center oraz Profile.
- Centralny przycisk FAB umożliwia wykonanie najczęstszych działań, takich jak dodanie nowego leku lub rejestracja przyjęcia dawki.
- Nawigacja zapewnia łatwy dostęp do wszystkich głównych funkcji, z możliwością szybkiego przełączania się między widokami oraz intuicyjnym powrotem do widoku głównego.
- Dodatkowo, interakcje takie jak kliknięcie karty leku otwierają szczegółowy widok lub modal, co minimalizuje konieczność zmiany kontekstu aplikacji.

## 5. Kluczowe komponenty

- **Medication Card**: Wyświetla podstawowe informacje o leku, umożliwia rozwinięcie szczegółów i szybki dostęp do edycji.
- **Timeline**: Wizualne przedstawienie harmonogramu przyjmowania leków w ciągu dnia, ułatwiające orientację w codziennych zadaniach.
- **Adherence Chart**: Interaktywne wykresy (np. pierścieniowe, liniowe, heatmap) prezentujące statystyki adherencyjne i trendów.
- **Reminder Modal**: Modal umożliwiający rejestrację interakcji z przypomnieniami, zawiera przyciski "Wziąłem", "Pomiń", "Przypomnij później".
- **Toast Notifications**: System wyświetlania powiadomień krytycznych, pojawiających się na górze ekranu.
- **Bottom Navigation & FAB**: Struktura dolnej nawigacji z centralnym przyciskiem, umożliwiająca szybki dostęp do głównych akcji.
- **Formularz Profilu**: Komponent do edycji danych osobowych, ustawień powiadomień oraz preferencji użytkownika.
- **Import Medications Form**: Proces dwuetapowy umożliwiający grupowy import danych o lekach, z walidacją i podziałem na etapy. 