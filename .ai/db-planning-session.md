<conversation_summary>
<decisions>
Dane demograficzne użytkownika będą obejmować: wiek, płeć, wagę, poziom aktywności fizycznej, rodzaj pracy (fizyczna/mentalna) oraz używki (kawa, papierosy, alkohol, narkotyki).
Adherencja lekowa będzie śledzona z dokładnością +/- 1h od zaplanowanego czasu przyjęcia.
System będzie implementował reguły eskalacji dla przypomnień o lekach.
Dane adherencji będą dostępne do roku wstecz, starsze dane będą archiwizowane.
Powiadomienia będą personalizowane z uwzględnieniem języka użytkownika i generowane przez AI.
System będzie obsługiwał różne strefy czasowe dla użytkowników.
Leki będą kategoryzowane jako: przewlekłe, ostre i doraźne.
Początkowy mechanizm uwierzytelniania będzie bazować na email + hasło, z planowaną przyszłą integracją z Apple ID i Google.
Powody pomijania dawek będą obejmować predefiniowaną listę oraz opcję "inne" z własnym opisem.
Raporty adherencji będą generowane automatycznie co tydzień oraz na żądanie.
Podstawowe dane o interakcjach leków będą pobierane z zewnętrznego API.
System będzie obsługiwał różne jednostki miary dla dawkowania leków.
Zdjęcia leków będą przechowywane na S3 i wykorzystywane do automatycznego rozpoznawania.
System musi obsłużyć 100,000+ użytkowników.
Obsługa złożonych, powtarzających się wzorców dawkowania leków.
Aplikacja będzie oferować funkcjonalność offline dla podstawowych przypomnień.
</decisions>
<matched_recommendations>
Zastosowanie struktury wielowarstwowej tabel (users, user_profiles, user_preferences) zamiast jednej dużej tabeli użytkowników.
Użycie tabel users, medications, medication_schedules i adherence_records jako podstawowych encji z odpowiednimi relacjami.
Implementacja Row Level Security (RLS) w PostgreSQL dla zapewnienia bezpieczeństwa danych medycznych.
Wykorzystanie typu jsonb do przechowywania elastycznych danych, takich jak złożone wzorce dawkowania.
Partycjonowanie tabeli adherence_records według przedziałów czasowych dla lepszej wydajności przy dużej ilości danych.
Archiwizacja danych starszych niż rok do osobnej tabeli.
Przechowywanie wszystkich czasów w UTC w bazie danych z polem timezone w tabeli user_profiles.
Przechowywanie zdjęć leków w S3 z referencjami w bazie danych.
Użycie typu ENUM dla kategoryzacji leków i powodów pominięcia dawek.
Implementacja materialized views dla przyspieszenia generowania raportów adherencji.
Zastosowanie pgcrypto dla szyfrowania wrażliwych danych zgodnie z HIPAA.
Przygotowanie struktury tabel dla przyszłej integracji z zewnętrznymi dostawcami uwierzytelniania.
</matched_recommendations>
<database_planning_summary>
Główne wymagania i struktura bazy danych
Planowana baza danych dla aplikacji MedMinder Plus MVP będzie zbudowana na PostgreSQL i zaprojektowana do obsługi minimum 100,000 użytkowników. System ma na celu śledzenie przyjmowania leków przez użytkowników, generowanie personalizowanych przypomnień i analizę wzorców adherencji.
Kluczowe encje i relacje
Użytkownicy i Profile
users: podstawowe dane uwierzytelniające (email, hasło)
user_profiles: szczegółowe dane demograficzne (wiek, płeć, waga, aktywność fizyczna, rodzaj pracy, używki)
user_notification_preferences: preferencje dotyczące komunikacji (język, styl, częstotliwość)
Leki i harmonogramy
medications: dane o lekach użytkownika (nazwa, dawka, forma, cel, kategoria, daty rozpoczęcia/zakończenia)
medication_schedules: szczegółowe harmonogramy przyjmowania (czas dnia, częstotliwość, dni tygodnia/miesiąca)
measurement_units: jednostki miary dla dawkowania
medication_escalation_rules: reguły eskalacji przypomnień (poziom priorytetu, opóźnienia, maksymalna liczba przypomnień)
medication_photos: referencje do zdjęć leków przechowywanych na S3
Adherencja i analityka
adherence_records: rejestr przyjmowania leków (zaplanowany czas, faktyczny czas, status)
skip_reasons: predefiniowane powody pominięcia dawki
notification_effectiveness: skuteczność poszczególnych powiadomień
user_engagement: metryki zaangażowania użytkownika
adherence_reports: generowane raporty adherencji
medication_interactions: dane o interakcjach między lekami
Kluczowe aspekty implementacji
Partycjonowanie i archiwizacja danych
Tabela adherence_records będzie partycjonowana według miesięcy
Dane starsze niż rok będą przenoszone do tabeli archiwalnej
Zaimplementowana zostanie procedura automatycznej archiwizacji
Obsługa złożonych harmonogramów
Elastyczny system harmonogramów leków obsługujący różne wzorce przyjmowania
Wsparcie dla codziennych, cotygodniowych, co drugi dzień i niestandardowych harmonogramów
Przechowywanie złożonych wzorców w formacie jsonb
Strefa czasowa i obsługa offline
Wszystkie czasy przechowywane w UTC
Pole timezone w profilu użytkownika do konwersji czasów
Struktura wspierająca przypomnienia offline
Raportowanie i analityka
Zmaterializowane widoki dla szybkiego dostępu do wskaźników adherencji
Tygodniowe i miesięczne podsumowania adherencji
Analizy przyczyn pomijania dawek
Bezpieczeństwo i skalowalność
Row Level Security (RLS)
Polityki RLS zapewniające, że użytkownicy mają dostęp tylko do swoich danych
Funkcja current_user_id() do weryfikacji uprawnień
Szyfrowanie danych
Wykorzystanie pgcrypto do szyfrowania wrażliwych danych
Zgodność z wymogami HIPAA
Indeksowanie dla wydajności
Strategiczne indeksy na kluczowych kolumnach
Specjalne indeksy dla zapytań związanych z czasem
Optymalizacja dla dużej skali
Partycjonowanie tabel z dużą ilością danych
Materialized views dla częstych raportów
Zoptymalizowane funkcje dla typowych operacji
</database_planning_summary>
<unresolved_issues>
Nie określono dokładnie, jakie metryki zaangażowania użytkownika będą śledzone - zaproponowano prostą strukturę, ale może wymagać doprecyzowania.
Brak szczegółów implementacji rozpoznawania leków na podstawie zdjęć - określono tylko, że zdjęcia będą przechowywane na S3 i używane do rozpoznawania.
Nie sprecyzowano dokładnego mechanizmu działania aplikacji w trybie offline - wymagane jest dokładniejsze określenie synchronizacji danych.
Brak szczegółów dotyczących konkretnego mechanizmu personalizacji powiadomień przez AI - określono tylko, że system będzie uwzględniał język użytkownika.
Nie określono dokładnych preferencji użytkownika dotyczących stylu komunikacji i częstotliwości powiadomień - zaproponowano strukturę, ale wymaga doprecyzowania.
</unresolved_issues>
</conversation_summary>ł