import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Clock, Trash2 } from "lucide-react";
import { BulkImportMedicationItem } from "@/app/types/medications";

interface ImportedMedicationItemProps {
  medication: BulkImportMedicationItem;
  onUpdate: (id: string, updates: Partial<BulkImportMedicationItem>) => void;
  onRemove: (id: string) => void;
}

export function ImportedMedicationItem({
  medication,
  onUpdate,
  onRemove,
}: ImportedMedicationItemProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Aktualizuje harmonogram leku
  const updateSchedule = (updates: Partial<BulkImportMedicationItem["schedule"]>) => {
    onUpdate(medication.id, {
      schedule: { ...medication.schedule, ...updates }
    });
  };

  // Dodaje nowy czas przyjmowania
  const addTime = () => {
    const newTimes = [...medication.schedule.times];
    
    // Ustaw nowy czas na godzinę po ostatnim czasie lub domyślnie 8:00
    let newTime = "08:00";
    if (newTimes.length > 0) {
      const lastTime = newTimes[newTimes.length - 1];
      const [hours, minutes] = lastTime.split(":");
      const newHours = (parseInt(hours) + 1) % 24;
      newTime = `${newHours.toString().padStart(2, "0")}:${minutes}`;
    }
    
    newTimes.push(newTime);
    updateSchedule({ times: newTimes });
  };

  // Aktualizuje czas przyjmowania
  const updateTime = (index: number, value: string) => {
    const newTimes = [...medication.schedule.times];
    newTimes[index] = value;
    updateSchedule({ times: newTimes });
  };

  // Usuwa czas przyjmowania
  const removeTime = (index: number) => {
    const newTimes = [...medication.schedule.times];
    newTimes.splice(index, 1);
    updateSchedule({ times: newTimes });
  };

  return (
    <Card className={medication.errors && Object.keys(medication.errors).length > 0 ? "border-red-300" : ""}>
      <CardHeader className="p-4 flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="flex-1">
          <p className="font-medium">
            {medication.name || "New Medication"}
          </p>
          <p className="text-sm text-muted-foreground">
            {medication.form && `${medication.form}`}
            {medication.strength && `, ${medication.strength}`}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(medication.id);
          }}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
          <span className="sr-only">Remove medication</span>
        </Button>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="px-4 pb-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`name-${medication.id}`} className="required">
              Medication Name
            </Label>
            <Input
              id={`name-${medication.id}`}
              value={medication.name}
              onChange={(e) => onUpdate(medication.id, { name: e.target.value })}
              className={medication.errors.name ? "border-red-500" : ""}
              placeholder="e.g. Aspirin"
            />
            {medication.errors.name && (
              <p className="text-sm text-red-500">{medication.errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`form-${medication.id}`} className="required">
              Medication Form
            </Label>
            <Input
              id={`form-${medication.id}`}
              value={medication.form}
              onChange={(e) => onUpdate(medication.id, { form: e.target.value })}
              className={medication.errors.form ? "border-red-500" : ""}
              placeholder="e.g. Tablet, Capsule, Liquid"
            />
            {medication.errors.form && (
              <p className="text-sm text-red-500">{medication.errors.form}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`strength-${medication.id}`}>
              Strength
            </Label>
            <Input
              id={`strength-${medication.id}`}
              value={medication.strength || ""}
              onChange={(e) => onUpdate(medication.id, { strength: e.target.value })}
              placeholder="e.g. 500mg, 10ml"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`category-${medication.id}`} className="required">
              Category
            </Label>
            <Select
              value={medication.category}
              onValueChange={(value) => onUpdate(medication.id, { category: value })}
            >
              <SelectTrigger
                id={`category-${medication.id}`}
                className={medication.errors.category ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chronic">Chronic</SelectItem>
                <SelectItem value="acute">Acute</SelectItem>
                <SelectItem value="as_needed">As needed</SelectItem>
              </SelectContent>
            </Select>
            {medication.errors.category && (
              <p className="text-sm text-red-500">{medication.errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`startDate-${medication.id}`} className="required">
              Start Date
            </Label>
            <Input
              id={`startDate-${medication.id}`}
              type="date"
              value={medication.startDate}
              onChange={(e) => onUpdate(medication.id, { startDate: e.target.value })}
              className={medication.errors.startDate ? "border-red-500" : ""}
            />
            {medication.errors.startDate && (
              <p className="text-sm text-red-500">{medication.errors.startDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`scheduleType-${medication.id}`} className="required">
              Schedule Type
            </Label>
            <Select
              value={medication.schedule.type}
              onValueChange={(value) => updateSchedule({ type: value })}
            >
              <SelectTrigger id={`scheduleType-${medication.id}`}>
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

          {medication.schedule.type !== "as_needed" && (
            <div className="space-y-2 col-span-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Times</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTime}
                  className="h-8"
                  disabled={medication.schedule.times.length >= 6}
                >
                  Add Time
                </Button>
              </div>
              
              {medication.schedule.times.length === 0 && (
                <p className="text-sm text-muted-foreground">No times added yet.</p>
              )}
              
              <div className="space-y-2 mt-2">
                {medication.schedule.times.map((time, index) => (
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
                      disabled={medication.schedule.times.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Remove time</span>
                    </Button>
                  </div>
                ))}
              </div>
              
              {medication.errors.times && (
                <p className="text-sm text-red-500 mt-1">{medication.errors.times}</p>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
} 