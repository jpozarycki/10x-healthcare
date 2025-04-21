import { describe, it, expect } from 'vitest';

// Sample medication model (for demonstration purpose)
interface Medication {
  id: string;
  name: string;
  dosage: number;
  frequency: number;
  isActive: boolean;
}

// Sample medication helper functions
const calculateDailyDosage = (med: Medication): number => {
  return med.dosage * med.frequency;
};

const isHighDosage = (med: Medication): boolean => {
  return calculateDailyDosage(med) > 100;
};

describe('Medication Model', () => {
  it('calculates daily dosage correctly', () => {
    const medication: Medication = {
      id: '1',
      name: 'Sample Med',
      dosage: 10,
      frequency: 3,
      isActive: true
    };
    
    expect(calculateDailyDosage(medication)).toBe(30);
  });
  
  it('detects high dosage correctly', () => {
    const lowDosageMed: Medication = {
      id: '1',
      name: 'Low Dosage Med',
      dosage: 10,
      frequency: 3,
      isActive: true
    };
    
    const highDosageMed: Medication = {
      id: '2',
      name: 'High Dosage Med',
      dosage: 50,
      frequency: 3,
      isActive: true
    };
    
    expect(isHighDosage(lowDosageMed)).toBe(false);
    expect(isHighDosage(highDosageMed)).toBe(true);
  });
}); 