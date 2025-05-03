import { Control, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clock, Trash2, Plus } from 'lucide-react';
import { MedicationFormData } from '@/app/types/medications';

interface TimeInputProps {
  control: Control<MedicationFormData>;
  error?: string;
}

export function TimeInput({ control, error }: TimeInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Times</label>
        <Controller
          control={control}
          name="schedule.times"
          render={({ field }) => {
            const times = field.value || [];
            const canAdd = times.length < 6;
            const canRemove = times.length > 1;

            const addTime = () => {
              let newTime = "08:00";
              if (times.length > 0) {
                const lastTime = times[times.length - 1];
                const [hours, minutes] = lastTime.split(":");
                const newHours = (parseInt(hours) + 1) % 24;
                newTime = `${newHours.toString().padStart(2, "0")}:${minutes}`;
              }
              field.onChange([...times, newTime]);
            };

            const removeTime = (index: number) => {
              const newTimes = [...times];
              newTimes.splice(index, 1);
              field.onChange(newTimes);
            };

            const updateTime = (index: number, value: string) => {
              const newTimes = [...times];
              newTimes[index] = value;
              field.onChange(newTimes);
            };

            return (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTime}
                  disabled={!canAdd}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Time
                </Button>
                
                {times.length === 0 && (
                  <p className="text-sm text-muted-foreground">No times added yet.</p>
                )}
                
                <div className="space-y-2 mt-2">
                  {times.map((time, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => updateTime(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTime(index)}
                        disabled={!canRemove}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Remove time</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            );
          }}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
} 