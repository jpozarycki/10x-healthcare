# Plan implementacji widoku Medications

## 1. Przegląd
Widok Medications jest kluczowym elementem aplikacji MedMinder Plus, umożliwiającym użytkownikom zarządzanie listą swoich leków. Pozwala na dodawanie, edycję, usuwanie oraz grupowy import leków. Widok zawiera funkcjonalności filtrowania, sortowania i paginacji listy leków oraz szczegółowy widok pojedynczego leku z harmonogramem przyjmowania.

## 2. Routing widoku
- Główny widok listy leków: `/medications`
- Widok szczegółów konkretnego leku: `/medications/[id]` (implementacja przez modal)

## 3. Struktura komponentów
```
MedicationsPage
├── PageHeader
│   └── AddMedicationButton
│   └── BulkImportButton
├── MedicationFilters
├── MedicationList
│   ├── MedicationCard[]
│   └── Pagination
├── MedicationFormModal
│   ├── MedicationBasicInfo
│   ├── ScheduleFormSection
│   └── AdditionalInfoSection
├── BulkImportModal
│   ├── BulkImportInstructions
│   ├── ImportedMedicationList
│   │   └── ImportedMedicationItem[]
│   └── ImportedMedicationsCalendarPreview
├── MedicationDetailsModal
│   ├── MedicationDetailsHeader
│   ├── MedicationDetailsInfo
│   └── MedicationScheduleDetails
└── ConfirmDeleteModal
```

## 4. Szczegóły komponentów

### MedicationsPage
- Opis komponentu: Główny komponent widoku, odpowiedzialny za zarządzanie stanem filtrów, paginacji i wyświetlanie listy leków
- Główne elementy: Nagłówek z przyciskami akcji, sekcja filtrów, lista leków z paginacją
- Obsługiwane interakcje: Otwieranie modali dodawania/edycji/usuwania leków, przełączanie stron, filtrowanie
- Typy: `ListMedicationsResponse`
- Propsy: Brak (komponent główny)

### PageHeader
- Opis komponentu: Nagłówek strony z tytułem i przyciskami akcji
- Główne elementy: Tytuł strony, przyciski "Dodaj lek" i "Importuj leki"
- Obsługiwane interakcje: Otwieranie modali dodawania i importu
- Typy: Brak
- Propsy: `onAddMedication`, `onBulkImport`

### MedicationFilters
- Opis komponentu: Panel filtrów z opcjami filtrowania według kategorii, statusu oraz sortowania
- Główne elementy: Pola wyboru kategorii i statusu, dropdown sortowania, przyciski resetowania filtrów
- Obsługiwane interakcje: Zmiana wartości filtrów, resetowanie filtrów
- Obsługiwana walidacja: Sprawdzanie poprawności wartości filtrów
- Typy: `MedicationFiltersViewModel`
- Propsy: `filters`, `onFilterChange`, `onReset`

### MedicationList
- Opis komponentu: Lista kart leków z paginacją
- Główne elementy: Karty leków, kontrolki paginacji
- Obsługiwane interakcje: Kliknięcie karty leku, zmiana strony
- Typy: `MedicationListItem[]`, `PaginationProps`
- Propsy: `medications`, `pagination`, `onPageChange`, `onView`, `onEdit`, `onDelete`

### MedicationCard
- Opis komponentu: Karta prezentująca podstawowe informacje o leku
- Główne elementy: Nazwa leku, kategoria, forma, siła, daty rozpoczęcia/zakończenia, przyciski akcji
- Obsługiwane interakcje: Podgląd szczegółów, edycja, usunięcie
- Typy: `MedicationListItem`
- Propsy: `medication`, `onView`, `onEdit`, `onDelete`

### MedicationFormModal
- Opis komponentu: Modal z formularzem dodawania/edycji leku
- Główne elementy: Formularz z polami na dane leku, sekcja harmonogramu, przyciski akcji
- Obsługiwane interakcje: Wypełnianie formularza, zapisywanie, anulowanie
- Obsługiwana walidacja:
  - Wymagane pola: nazwa, forma, kategoria, data rozpoczęcia
  - Format daty: YYYY-MM-DD
  - Data zakończenia musi być późniejsza niż data rozpoczęcia
  - Harmonogram musi być kompletny
- Typy: `MedicationFormViewModel`, `CreateMedicationRequest`
- Propsy: `isOpen`, `medication`, `onClose`, `onSave`

### ScheduleFormSection
- Opis komponentu: Sekcja formularza do definiowania harmonogramu leku
- Główne elementy: Wybór typu harmonogramu, pola specyficzne dla typu, wybór godzin, opcja "z posiłkiem"
- Obsługiwane interakcje: Zmiana typu harmonogramu, dodawanie/usuwanie godzin
- Obsługiwana walidacja: 
  - Wymagany przynajmniej jeden czas przyjmowania
  - Poprawny format czasu (HH:MM)
  - Kompletność wzorca harmonogramu
- Typy: `SchedulePattern`
- Propsy: `schedule`, `onChange`, `errors`

### AdditionalInfoSection
- Opis komponentu: Sekcja formularza z dodatkowymi informacjami o leku
- Główne elementy: Pola na cel stosowania, instrukcje, przypomnienia o uzupełnieniu
- Obsługiwane interakcje: Wypełnianie pól
- Obsługiwana walidacja: Formaty liczbowe dla dni przypomnienia i ilości tabletek
- Typy: część `CreateMedicationRequest`
- Propsy: `data`, `onChange`, `errors`

### BulkImportModal
- Opis komponentu: Modal do masowego importu leków
- Główne elementy: Instrukcje, lista importowanych leków, podgląd harmonogramu, przyciski akcji
- Obsługiwane interakcje: Dodawanie/usuwanie leków, przełączanie między krokami, zatwierdzanie importu
- Obsługiwana walidacja: Taka sama jak dla pojedynczego leku, dla każdego leku na liście
- Typy: `BulkImportViewModel`
- Propsy: `isOpen`, `onClose`, `onImport`

### ImportedMedicationList
- Opis komponentu: Lista importowanych leków z możliwością edycji
- Główne elementy: Karty importowanych leków, przycisk dodawania, komunikaty walidacji
- Obsługiwane interakcje: Dodawanie/usuwanie/edycja leków
- Obsługiwana walidacja: Podstawowa walidacja pól dla każdego leku
- Typy: `BulkImportMedicationItem[]`
- Propsy: `medications`, `onAdd`, `onUpdate`, `onRemove`

### ImportedMedicationsCalendarPreview
- Opis komponentu: Podgląd harmonogramu importowanych leków w widoku kalendarza
- Główne elementy: Widok tygodniowy z zaznacznymi lekami i godzinami
- Obsługiwane interakcje: Dostosowanie czasów, grupowanie leków
- Typy: `BulkImportMedicationItem[]`
- Propsy: `medications`, `onUpdateTimes`

### MedicationDetailsModal
- Opis komponentu: Modal ze szczegółami leku
- Główne elementy: Nagłówek z przyciskami akcji, sekcje z informacjami, harmonogram
- Obsługiwane interakcje: Edycja, usunięcie, zamknięcie
- Typy: `MedicationDetailResponse`
- Propsy: `isOpen`, `medicationId`, `onClose`, `onEdit`, `onDelete`

### ConfirmDeleteModal
- Opis komponentu: Modal potwierdzenia usunięcia leku
- Główne elementy: Tekst potwierdzenia, przyciski akcji
- Obsługiwane interakcje: Potwierdzenie, anulowanie
- Typy: ID leku do usunięcia
- Propsy: `isOpen`, `medicationName`, `onClose`, `onConfirm`

## 5. Typy

### MedicationFiltersViewModel
```typescript
type MedicationFiltersViewModel = {
  category?: 'chronic' | 'acute' | 'as_needed';
  status?: 'active' | 'inactive';
  sort?: 'id' | 'name' | 'form' | 'start_date' | 'end_date';
  order?: 'asc' | 'desc';
}
```

### MedicationFormViewModel
```typescript
type MedicationFormViewModel = Omit<CreateMedicationRequest, 'schedule'> & {
  scheduleType: string;
  scheduleTimes: string[];
  schedulePattern: Record<string, unknown>;
  withFood: boolean;
  errors: Record<string, string>;
  isValid: boolean;
}
```

### BulkImportMedicationItem
```typescript
type BulkImportMedicationItem = {
  id: string; // Lokalny id dla identyfikacji elementu
  name: string;
  form: string;
  strength?: string;
  category: medication_category;
  start_date: string;
  schedule: {
    type: string;
    times: string[];
    with_food: boolean;
  };
  errors: Record<string, string>;
  isValid: boolean;
}
```

### BulkImportViewModel
```typescript
type BulkImportViewModel = {
  medications: BulkImportMedicationItem[];
  step: 'data_input' | 'calendar_preview';
  hasErrors: boolean;
}
```

### MedicationDetailsViewModel
```typescript
type MedicationDetailsViewModel = MedicationDetailResponse & {
  isLoading: boolean;
  error: string | null;
}
```

## 6. Zarządzanie stanem

### useMedicationList
Hook zarządzający pobieraniem i filtrowaniem listy leków.

```typescript
const useMedicationList = (initialFilters: MedicationFiltersViewModel) => {
  // Stan
  const [medications, setMedications] = useState<MedicationListItem[]>([]);
  const [filters, setFilters] = useState<MedicationFiltersViewModel>(initialFilters);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Metody do pobierania leków, aktualizacji filtrów i paginacji
  
  return { medications, filters, pagination, isLoading, error, updateFilters, goToPage, refreshList };
}
```

### useMedicationForm
Hook zarządzający stanem formularza dodawania/edycji leku.

```typescript
const useMedicationForm = (initialData?: Partial<CreateMedicationRequest>) => {
  // Stan formularza i walidacji
  
  // Metody aktualizacji pól, walidacji i zapisywania
  
  return { formData, errors, isSubmitting, updateField, handleSubmit };
}
```

### useBulkImport
Hook zarządzający procesem masowego importu leków.

```typescript
const useBulkImport = () => {
  // Stan procesu importu
  
  // Metody zarządzania lekami i krokami procesu
  
  return {
    importData,
    addMedication,
    updateMedication,
    removeMedication,
    goToPreview,
    goToDataInput,
    submitImport
  };
}
```

### useMedicationDetails
Hook pobierający szczegóły konkretnego leku.

```typescript
const useMedicationDetails = (medicationId: string) => {
  // Stan szczegółów leku
  
  // Metody pobierania i odświeżania danych
  
  return { details, isLoading, error, refreshDetails };
}
```

## 7. Integracja API

### Pobieranie listy leków
```typescript
const fetchMedications = async (filters: MedicationFiltersViewModel, page: number, limit: number) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.sort) queryParams.append('sort', filters.sort);
    if (filters.order) queryParams.append('order', filters.order);
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    const response = await fetch(`/api/v1/medications?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Błąd podczas pobierania leków');
    }
    
    const data: ListMedicationsResponse = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
```

### Pobieranie szczegółów leku
```typescript
const fetchMedicationDetails = async (medicationId: string) => {
  try {
    const response = await fetch(`/api/v1/medications/${medicationId}`);
    
    if (!response.ok) {
      throw new Error('Błąd podczas pobierania szczegółów leku');
    }
    
    const data: MedicationDetailResponse = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
```

### Dodawanie nowego leku
```typescript
const createMedication = async (data: CreateMedicationRequest) => {
  try {
    const response = await fetch('/api/v1/medications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Błąd podczas dodawania leku');
    }
    
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
}
```

### Aktualizacja leku
```typescript
const updateMedication = async (medicationId: string, data: CreateMedicationRequest) => {
  try {
    const response = await fetch(`/api/v1/medications/${medicationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Błąd podczas aktualizacji leku');
    }
    
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
}
```

### Usuwanie leku
```typescript
const deleteMedication = async (medicationId: string) => {
  try {
    const response = await fetch(`/api/v1/medications/${medicationId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Błąd podczas usuwania leku');
    }
    
    return true;
  } catch (error) {
    throw error;
  }
}
```

## 8. Interakcje użytkownika

### Dodawanie nowego leku
1. Użytkownik klika przycisk "Dodaj lek" w nagłówku strony
2. Otwiera się modal z formularzem dodawania leku
3. Użytkownik wypełnia wymagane pola (nazwa, forma, kategoria, data rozpoczęcia)
4. Użytkownik definiuje harmonogram przyjmowania leku
5. Użytkownik klika "Zapisz"
6. System waliduje dane, tworzy lek i wyświetla komunikat sukcesu
7. Modal zostaje zamknięty, a lista leków odświeżona

### Edycja leku
1. Użytkownik klika przycisk edycji na karcie leku
2. Otwiera się modal z formularzem wypełnionym aktualnymi danymi leku
3. Użytkownik modyfikuje dane
4. Użytkownik klika "Zapisz"
5. System waliduje dane, aktualizuje lek i wyświetla komunikat sukcesu
6. Modal zostaje zamknięty, a lista leków odświeżona

### Usunięcie leku
1. Użytkownik klika przycisk usunięcia na karcie leku
2. Otwiera się modal z prośbą o potwierdzenie
3. Użytkownik potwierdza chęć usunięcia
4. System usuwa lek i wyświetla komunikat sukcesu
5. Modal zostaje zamknięty, a lek znika z listy

### Filtrowanie i sortowanie
1. Użytkownik zmienia wartości filtrów (kategoria, status) lub sortowania
2. System automatycznie odświeża listę z zastosowanymi filtrami
3. Wyświetlane są tylko leki spełniające kryteria filtrowania

### Masowy import leków
1. Użytkownik klika przycisk "Importuj leki"
2. Otwiera się modal z pierwszym krokiem importu
3. Użytkownik dodaje kolejne leki do importu
4. Po dodaniu wszystkich leków, użytkownik klika "Dalej"
5. System waliduje dane i przechodzi do kroku podglądu harmonogramu
6. Użytkownik może dostosować czasy i grupowanie leków
7. Użytkownik klika "Importuj"
8. System importuje leki i wyświetla komunikat sukcesu
9. Modal zostaje zamknięty, a lista leków odświeżona

## 9. Warunki i walidacja

### Walidacja formularza leku
- **Nazwa leku**: Pole wymagane, minimum 1 znak
- **Forma leku**: Pole wymagane, minimum 1 znak
- **Kategoria leku**: Pole wymagane, jedna z wartości: chronic, acute, as_needed
- **Data rozpoczęcia**: Pole wymagane, format YYYY-MM-DD, nie może być datą przeszłą
- **Data zakończenia**: Format YYYY-MM-DD, musi być późniejsza niż data rozpoczęcia

### Walidacja harmonogramu
- **Typ harmonogramu**: Pole wymagane
- **Wzorzec harmonogramu**: Kompletność zależna od typu (np. dni tygodnia dla harmonogramu tygodniowego)
- **Czasy przyjmowania**: Minimum jeden czas, format HH:MM

### Walidacja masowego importu
- Każdy lek na liście musi przejść walidację jak pojedynczy lek
- Wszystkie leki muszą być poprawne przed przejściem do kolejnego kroku

## 10. Obsługa błędów

### Błędy API
- Niepowodzenie pobierania danych: Wyświetlanie komunikatu błędu, możliwość ponownej próby
- Niepowodzenie zapisywania/aktualizacji: Wyświetlanie szczegółowej informacji z API, pozostawienie formularza otwartego
- Niepowodzenie usunięcia: Wyświetlanie komunikatu błędu, możliwość ponownej próby

### Błędy walidacji
- Wyświetlanie komunikatów błędów przy odpowiednich polach formularza
- Blokada zapisania/przejścia dalej przy niepoprawnych danych
- Podświetlanie błędnych pól

### StatusModal
- Wykorzystanie komponentu StatusModal do wyświetlania komunikatów sukcesu i błędów
- Implementacja zgodna z wymaganiami projektu

## 11. Kroki implementacji

1. **Konfiguracja podstawowej struktury**
   - Utworzenie pliku `/app/medications/page.tsx`
   - Implementacja podstawowego layoutu strony

2. **Implementacja komponentów widoku listy**
   - Implementacja MedicationFilters
   - Implementacja MedicationCard
   - Implementacja MedicationList z paginacją

3. **Implementacja hooków do zarządzania stanem**
   - Implementacja useMedicationList
   - Integracja z API do pobierania listy leków

4. **Implementacja formularza dodawania/edycji leku**
   - Implementacja MedicationFormModal
   - Implementacja walidacji formularza
   - Integracja z API do dodawania/aktualizacji leków

5. **Implementacja formularza harmonogramu**
   - Implementacja ScheduleFormSection
   - Implementacja komponentów specyficznych dla różnych typów harmonogramów

6. **Implementacja modalu szczegółów leku**
   - Implementacja MedicationDetailsModal
   - Integracja z API do pobierania szczegółów leku

7. **Implementacja funkcji usuwania leku**
   - Implementacja ConfirmDeleteModal
   - Integracja z API do usuwania leku

8. **Implementacja masowego importu leków**
   - Implementacja BulkImportModal
   - Implementacja kroków importu
   - Implementacja podglądu harmonogramu
   - Integracja z API do dodawania wielu leków

9. **Implementacja obsługi błędów i komunikatów**
   - Integracja z komponentem StatusModal
   - Implementacja obsługi błędów API i walidacji

10. **Testowanie**
    - Testowanie funkcjonalności dodawania/edycji/usuwania leków
    - Testowanie masowego importu
    - Testowanie filtrowania i paginacji
    - Testowanie obsługi błędów

11. **Optymalizacja i refaktoryzacja**
    - Poprawa wydajności renderowania komponentów
    - Refaktoryzacja powtarzającego się kodu
    - Optymalizacja zapytań API 