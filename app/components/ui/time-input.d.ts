import { Control } from 'react-hook-form';
import { MedicationFormData } from '@/app/types/medications';

export interface TimeInputProps {
  control: Control<MedicationFormData>;
  error?: string;
}

export declare function TimeInput(props: TimeInputProps): JSX.Element; 