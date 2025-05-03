import { useFieldArray, Control, FieldValues, ArrayPath, FieldArray, FieldArrayWithId } from 'react-hook-form';
import { MedicationFormData } from '@/app/types/medications';

interface UseTimeManagementProps {
  control: Control<MedicationFormData>;
}

type ScheduleFieldArray = {
  schedule: {
    times: string[];
  };
};

export function useTimeManagement({ control }: UseTimeManagementProps) {
  const { fields, append, remove } = useFieldArray<ScheduleFieldArray>({
    control: control as Control<ScheduleFieldArray>,
    name: 'schedule.times' as ArrayPath<ScheduleFieldArray>,
  });

  const addTime = () => {
    let newTime = "08:00";
    if (fields.length > 0) {
      // Since we know our fields contain string values
      const lastTime = fields[fields.length - 1] as unknown as string;
      const [hours, minutes] = lastTime.split(":");
      const newHours = (parseInt(hours) + 1) % 24;
      newTime = `${newHours.toString().padStart(2, "0")}:${minutes}`;
    }
    append(newTime);
  };

  return {
    fields: fields.map(field => ({
      id: field.id,
      value: field as unknown as string
    })),
    addTime,
    remove,
    canAdd: fields.length < 6,
    canRemove: fields.length > 1
  };
} 