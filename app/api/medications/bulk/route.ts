import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Medication, BulkImportMedicationItem } from '@/app/types/medications';

// This would normally connect to a database
// For now, we'll just return mock data
export async function POST(request: NextRequest) {
  try {
    const { medications } = await request.json();
    
    if (!Array.isArray(medications)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected an array of medications.' },
        { status: 400 }
      );
    }
    
    // Simulate processing and saving to database
    const createdMedications: Medication[] = medications.map((med) => {
      const now = new Date().toISOString();
      
      return {
        id: uuidv4(),
        name: med.name,
        form: med.form,
        strength: med.strength,
        category: med.category,
        startDate: med.startDate,
        endDate: med.endDate,
        schedule: med.schedule,
        reminders: med.reminders,
        notes: med.notes,
        createdAt: now,
        updatedAt: now,
      };
    });
    
    return NextResponse.json(createdMedications, { status: 201 });
  } catch (error) {
    console.error('Error handling bulk medication import:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk medication import' },
      { status: 500 }
    );
  }
} 