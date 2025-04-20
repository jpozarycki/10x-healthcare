import { Medication, BulkImportMedicationItem } from '@/app/types/medications';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function getMedications(): Promise<Medication[]> {
  const response = await fetch(`${API_BASE_URL}/medications`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch medications');
  }
  
  return response.json();
}

export async function getMedication(id: string): Promise<Medication> {
  const response = await fetch(`${API_BASE_URL}/medications/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch medication');
  }
  
  return response.json();
}

export async function createMedication(data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medication> {
  const response = await fetch(`${API_BASE_URL}/medications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create medication');
  }
  
  return response.json();
}

export async function updateMedication(id: string, data: Partial<Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Medication> {
  const response = await fetch(`${API_BASE_URL}/medications/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update medication');
  }
  
  return response.json();
}

export async function deleteMedication(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/medications/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete medication');
  }
}

export async function bulkImportMedications(medications: Omit<BulkImportMedicationItem, 'id' | 'errors'>[]): Promise<Medication[]> {
  const response = await fetch(`${API_BASE_URL}/medications/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ medications }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to bulk import medications');
  }
  
  return response.json();
} 