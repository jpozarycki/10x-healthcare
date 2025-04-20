import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Clock } from "lucide-react";
import { MedicationFormViewModel } from "@/app/types/medications";

// Opcje wzorców harmonogramu
type SchedulePatternType = "daily" | "weekly" | "monthly" | "as_needed";

interface ScheduleFormSectionProps {
  scheduleType: string;
  scheduleTimes: string[];
  schedulePattern: Record<string, unknown>;
  withFood: boolean;
  errors: Record<string, string>;
  onChange: <K extends keyof MedicationFormViewModel>(
    field: K,
    value: MedicationFormViewModel[K]
  ) => void;
}

export function ScheduleFormSection({
  scheduleType,
  scheduleTimes,
  schedulePattern,
  withFood,
  errors,
  onChange,
}: ScheduleFormSectionProps) {
  // Funkcja dodająca nowy czas
  const addTime = () => {
    // Dodaj domyślny czas 08:00 lub zwiększ ostatni czas o godzinę
    let newTime = "08:00";
    if (scheduleTimes.length > 0) {
      const lastTime = scheduleTimes[scheduleTimes.length - 1];
      const [hours, minutes] = lastTime.split(":");
      const newHours = (parseInt(hours) + 1) % 24;
      newTime = `${newHours.toString().padStart(2, "0")}:${minutes}`;
    }
    
    onChange("scheduleTimes", [...scheduleTimes, newTime]);
  };

  // Funkcja usuwająca czas
  const removeTime = (index: number) => {
    const newTimes = [...scheduleTimes];
    newTimes.splice(index, 1);
    onChange("scheduleTimes", newTimes);
  };

  // Funkcja aktualizująca czas
  const updateTime = (index: number, value: string) => {
    const newTimes = [...scheduleTimes];
    newTimes[index] = value;
    onChange("scheduleTimes", newTimes);
  };

  // Funkcja aktualizująca typ harmonogramu
  const handleScheduleTypeChange = (value: string) => {
    onChange("scheduleType", value);
    
    // Zresetuj wzorzec harmonogramu przy zmianie typu
    if (value === "daily") {
      onChange("schedulePattern", {});
    } else if (value === "weekly") {
      onChange("schedulePattern", { days: {} });
    } else if (value === "monthly") {
      onChange("schedulePattern", { days: {} });
    } else if (value === "as_needed") {
      onChange("schedulePattern", {});
    }
  };

  // Funkcja aktualizująca dni tygodnia (dla harmonogramu tygodniowego)
  const toggleWeekDay = (day: string) => {
    const currentDays = ((schedulePattern as any).days || {}) as Record<string, boolean>;
    const newDays = { ...currentDays };
    
    // Przełącz wybrany dzień
    if (newDays[day]) {
      delete newDays[day];
    } else {
      newDays[day] = true;
    }
    
    onChange("schedulePattern", { ...schedulePattern, days: newDays });
  };

  // Funkcja aktualizująca dni miesiąca (dla harmonogramu miesięcznego)
  const toggleMonthDay = (day: number) => {
    const currentDays = ((schedulePattern as any).days || {}) as Record<string, boolean>;
    const dayStr = day.toString();
    const newDays = { ...currentDays };
    
    // Przełącz wybrany dzień
    if (newDays[dayStr]) {
      delete newDays[dayStr];
    } else {
      newDays[dayStr] = true;
    }
    
    onChange("schedulePattern", { ...schedulePattern, days: newDays });
  };

  // Renderowanie pól specyficznych dla typu harmonogramu
  const renderPatternFields = () => {
    if (scheduleType === "weekly") {
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const selectedDays = ((schedulePattern as any).days || {}) as Record<string, boolean>;
      
      return (
        <div className="mt-4">
          <Label className="mb-2 block">Days of week</Label>
          <div className="flex flex-wrap gap-2">
            {days.map((day) => (
              <Button
                key={day}
                type="button"
                variant={selectedDays[day] ? "default" : "outline"}
                className="h-8"
                onClick={() => toggleWeekDay(day)}
              >
                {day.substring(0, 3)}
              </Button>
            ))}
          </div>
          {errors.schedulePattern && (
            <p className="text-sm text-red-500 mt-1">{errors.schedulePattern}</p>
          )}
        </div>
      );
    }

    if (scheduleType === "monthly") {
      const days = Array.from({ length: 31 }, (_, i) => i + 1);
      const selectedDays = ((schedulePattern as any).days || {}) as Record<string, boolean>;
      
      return (
        <div className="mt-4">
          <Label className="mb-2 block">Days of month</Label>
          <div className="flex flex-wrap gap-2">
            {days.map((day) => (
              <Button
                key={day}
                type="button"
                variant={selectedDays[day.toString()] ? "default" : "outline"}
                className="h-8 w-8 p-0"
                onClick={() => toggleMonthDay(day)}
              >
                {day}
              </Button>
            ))}
          </div>
          {errors.schedulePattern && (
            <p className="text-sm text-red-500 mt-1">{errors.schedulePattern}</p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medication Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="scheduleType">Schedule Type</Label>
          <Select
            value={scheduleType}
            onValueChange={handleScheduleTypeChange}
          >
            <SelectTrigger id="scheduleType">
              <SelectValue placeholder="Select schedule type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="as_needed">As needed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {scheduleType !== "as_needed" && (
          <>
            {renderPatternFields()}

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Times</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTime}
                  disabled={scheduleTimes.length >= 6}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Time
                </Button>
              </div>
              
              {scheduleTimes.length === 0 && (
                <p className="text-sm text-muted-foreground">No times added yet.</p>
              )}
              
              <div className="space-y-2">
                {scheduleTimes.map((time, index) => (
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
                      disabled={scheduleTimes.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Remove time</span>
                    </Button>
                  </div>
                ))}
              </div>
              
              {errors.scheduleTimes && (
                <p className="text-sm text-red-500 mt-1">{errors.scheduleTimes}</p>
              )}
            </div>
          </>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="withFood"
            checked={withFood}
            onCheckedChange={(checked) => onChange("withFood", Boolean(checked))}
          />
          <Label htmlFor="withFood" className="cursor-pointer">
            Take with food
          </Label>
        </div>
      </CardContent>
    </Card>
  );
} 