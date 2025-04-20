# API Endpoint Implementation Plan: Delete Medication

## 1. Przegląd punktu końcowego
Endpoint umożliwia użytkownikowi usunięcie istniejącego leku z systemu. Operacja jest nieodwracalna i spowoduje usunięcie wszystkich powiązanych danych leku, w tym harmonogramów, zapisów adherencji i powiadomień. Endpoint zwraca 204 No Content po pomyślnym usunięciu.

## 2. Szczegóły żądania
- **Metoda HTTP**: DELETE
- **Struktura URL**: `/v1/medications/{id}`
- **Parametry**:
  - **Wymagane**: `id` (UUID) - identyfikator leku do usunięcia
  - **Opcjonalne**: brak

## 3. Wykorzystywane typy
Dla tej operacji nie są wymagane specjalne modele DTO ani Command. Endpoint przyjmuje jedynie parametr ID w ścieżce URL.

## 4. Szczegóły odpowiedzi
- **Kod statusu**: 204 No Content (pomyślne usunięcie)
- **Body**: Brak (pusta odpowiedź)
- **Nagłówki**: Standardowe

## 5. Przepływ danych
1. Endpoint otrzymuje żądanie DELETE z ID leku w ścieżce.
2. System weryfikuje, czy użytkownik jest zalogowany (middleware autoryzacyjne).
3. Pobiera identyfikator użytkownika z kontekstu uwierzytelniania.
4. Sprawdza, czy lek o podanym ID istnieje i należy do zalogowanego użytkownika.
5. Rozpoczyna transakcję bazodanową.
6. Usuwa powiązane rekordy w następującej kolejności:
   - Powiadomienia (`notifications` gdzie `medication_id` = ID leku)
   - Zapisy adherencji (`adherence_records` gdzie `medication_id` = ID leku)
   - Harmonogramy leków (`medication_schedules` gdzie `medication_id` = ID leku)
   - Reguły eskalacji (`medication_escalation_rules` gdzie `medication_id` = ID leku)
   - Zdjęcia leków (`medication_photos` gdzie `medication_id` = ID leku)
   - Interakcje leków (`medication_interactions` gdzie `medication_id_1` = ID leku LUB `medication_id_2` = ID leku)
   - Sam lek (`medications` gdzie `id` = ID leku)
7. Zatwierdza transakcję.
8. Zwraca odpowiedź z kodem statusu 204.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Wymagane jest aby użytkownik był zalogowany.
- **Autoryzacja**: Tylko właściciel leku (user_id) może go usunąć.
- **Walidacja parametrów**: ID leku musi być prawidłowym UUID.
- **Row-Level Security**: Wykorzystanie polityk Row-Level Security w Supabase dla dodatkowej warstwy ochrony.

## 7. Obsługa błędów
- **400 Bad Request**: Nieprawidłowy format UUID.
- **401 Unauthorized**: Użytkownik nie jest zalogowany.
- **403 Forbidden**: Użytkownik próbuje usunąć lek należący do innego użytkownika.
- **404 Not Found**: Lek o podanym ID nie istnieje.
- **409 Conflict**: Nie można usunąć leku z powodu konfliktów (np. powiązania w systemie).
- **500 Internal Server Error**: Błąd po stronie serwera (np. problem z bazą danych).

## 8. Rozważania dotyczące wydajności
- Używanie transakcji bazy danych do zapewnienia spójności danych.
- Usuwanie dużej liczby powiązanych rekordów może być operacją kosztowną - warto rozważyć wykonanie usuwania jako zadania asynchronicznego dla bardzo dużych zbiorów danych.
- Dla zwiększenia wydajności, można rozważyć użycie kaskadowego usuwania na poziomie bazy danych, zamiast usuwania każdej zależności programowo.

## 9. Etapy wdrożenia

### Krok 1: Utworzenie handlera dla route'a
```typescript
// app/api/v1/medications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/app/db/database.types';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const medicationId = params.id;
  
  // Walidacja formatu UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(medicationId)) {
    return NextResponse.json(
      { error: 'Invalid medication ID format' },
      { status: 400 }
    );
  }

  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  // Pobierz informacje o zalogowanym użytkowniku
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const userId = session.user.id;
  
  try {
    // Sprawdź czy lek istnieje i należy do zalogowanego użytkownika
    const { data: medication, error: medicationError } = await supabase
      .from('medications')
      .select('id, user_id')
      .eq('id', medicationId)
      .single();
    
    if (medicationError || !medication) {
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      );
    }
    
    if (medication.user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Wywołaj service do usuwania leku
    await deleteMedicationService(supabase, medicationId);
    
    // Zwróć odpowiedź z pustym body i kodem statusu 204
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting medication:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Krok 2: Implementacja service'u do usuwania leku
```typescript
// app/services/medication-service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/app/db/database.types';

export async function deleteMedicationService(
  supabase: SupabaseClient<Database>,
  medicationId: string
): Promise<void> {
  // Rozpocznij transakcję
  const { error: transactionError } = await supabase.rpc('begin_transaction');
  if (transactionError) throw transactionError;
  
  try {
    // Usuń powiązane powiadomienia
    const { error: notificationsError } = await supabase
      .from('notifications')
      .delete()
      .eq('medication_id', medicationId);
    if (notificationsError) throw notificationsError;
    
    // Usuń powiązane zapisy adherencji
    const { error: adherenceError } = await supabase
      .from('adherence_records')
      .delete()
      .eq('medication_id', medicationId);
    if (adherenceError) throw adherenceError;
    
    // Usuń powiązane harmonogramy leków
    const { error: schedulesError } = await supabase
      .from('medication_schedules')
      .delete()
      .eq('medication_id', medicationId);
    if (schedulesError) throw schedulesError;
    
    // Usuń powiązane reguły eskalacji
    const { error: escalationError } = await supabase
      .from('medication_escalation_rules')
      .delete()
      .eq('medication_id', medicationId);
    if (escalationError) throw escalationError;
    
    // Usuń powiązane zdjęcia leków
    const { error: photosError } = await supabase
      .from('medication_photos')
      .delete()
      .eq('medication_id', medicationId);
    if (photosError) throw photosError;
    
    // Usuń powiązane interakcje leków
    const { error: interactions1Error } = await supabase
      .from('medication_interactions')
      .delete()
      .eq('medication_id_1', medicationId);
    if (interactions1Error) throw interactions1Error;
    
    const { error: interactions2Error } = await supabase
      .from('medication_interactions')
      .delete()
      .eq('medication_id_2', medicationId);
    if (interactions2Error) throw interactions2Error;
    
    // Usuń sam lek
    const { error: medicationError } = await supabase
      .from('medications')
      .delete()
      .eq('id', medicationId);
    if (medicationError) throw medicationError;
    
    // Zatwierdź transakcję
    const { error: commitError } = await supabase.rpc('commit_transaction');
    if (commitError) throw commitError;
  } catch (error) {
    // Wycofaj transakcję w przypadku błędu
    await supabase.rpc('rollback_transaction');
    throw error;
  }
}
```

### Krok 3: Uproszczona wersja z wykorzystaniem kaskadowego usuwania

Alternatywnie, jeśli w bazie danych skonfigurowano odpowiednie ograniczenia ON DELETE CASCADE, operację można znacznie uprościć:

```typescript
// app/services/medication-service.ts (uproszczona wersja)
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/app/db/database.types';

export async function deleteMedicationService(
  supabase: SupabaseClient<Database>,
  medicationId: string
): Promise<void> {
  // Usuń lek (usunięcie powiązanych rekordów nastąpi automatycznie dzięki ON DELETE CASCADE)
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', medicationId);
  
  if (error) throw error;
}
```

### Krok 4: Integracja z dokumentacją API
Zaktualizuj dokumentację API (np. OpenAPI/Swagger) dodając informacje o nowym endpoincie. 