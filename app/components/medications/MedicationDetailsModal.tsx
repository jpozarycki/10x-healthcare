import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Calendar, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedicationDetailResponse } from "@/app/types";
import { StatusModal } from "@/components/ui/status-modal";
import { cn } from "@/lib/utils";

interface MedicationDetailsModalProps {
  isOpen: boolean;
  medicationId: string | null;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

export function MedicationDetailsModal({
  isOpen,
  medicationId,
  onClose,
  onEdit,
  onDelete,
}: MedicationDetailsModalProps) {
  const [details, setDetails] = useState<MedicationDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pobierz szczegóły leku po otwarciu modalu
  useEffect(() => {
    const fetchMedicationDetails = async () => {
      if (!medicationId || !isOpen) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/v1/medications/${medicationId}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data: MedicationDetailResponse = await response.json();
        setDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error fetching medication details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicationDetails();
  }, [medicationId, isOpen]);

  // Formatowanie daty
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Mapowanie kategorii na czytelne etykiety
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "chronic":
        return "Chronic";
      case "acute":
        return "Acute";
      case "as_needed":
        return "As needed";
      default:
        return category;
    }
  };

  // Mapowanie kategorii na kolory
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "chronic":
        return "bg-blue-100 text-blue-800";
      case "acute":
        return "bg-orange-100 text-orange-800";
      case "as_needed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Obsługa akcji edycji
  const handleEdit = () => {
    if (details) {
      onClose();
      onEdit(details.id);
    }
  };

  // Obsługa akcji usunięcia
  const handleDelete = () => {
    if (details) {
      onClose();
      onDelete(details.id, details.name);
    }
  };

  // Wyświetlanie błędu, jeśli wystąpił problem z pobieraniem danych
  if (error) {
    return (
      <StatusModal
        isOpen={!!error}
        variant="error"
        title="Error Loading Medication"
        message={error}
        onClose={onClose}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "bg-white shadow-xl rounded-xl",
          "border-2 border-primary/20",
          "max-w-2xl max-h-[90vh] overflow-y-auto",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          "data-[state=open]:slide-in-from-center data-[state=closed]:slide-out-to-center",
          "duration-300 ease-in-out transition-all",
          "animate-in fade-in-0 zoom-in-95"
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            Medication Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading medication details...</span>
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-xl font-bold">{details.name}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline">{details.form}</Badge>
                {details.strength && (
                  <Badge variant="outline">{details.strength}</Badge>
                )}
                <Badge className={getCategoryColor(details.category)}>
                  {getCategoryLabel(details.category)}
                </Badge>
                <Badge variant={details.is_active ? "default" : "secondary"}>
                  {details.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            {/* Medication Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Start Date
                </h4>
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                  {formatDate(details.start_date)}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  End Date
                </h4>
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                  {formatDate(details.end_date)}
                </p>
              </div>

              {details.purpose && (
                <div className="col-span-1 md:col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Purpose
                  </h4>
                  <p>{details.purpose}</p>
                </div>
              )}

              {details.instructions && (
                <div className="col-span-1 md:col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Special Instructions
                  </h4>
                  <p>{details.instructions}</p>
                </div>
              )}

              {details.refill_reminder_days !== null && details.refill_reminder_days !== undefined && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Refill Reminder
                  </h4>
                  <p>{details.refill_reminder_days} days before empty</p>
                </div>
              )}

              {details.pills_per_refill !== null && details.pills_per_refill !== undefined && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Pills per Refill
                  </h4>
                  <p>{details.pills_per_refill}</p>
                </div>
              )}
            </div>

            {/* Schedule Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {details.schedules && details.schedules.length > 0 ? (
                  <div className="space-y-4">
                    {details.schedules.map((schedule, index) => {
                      const pattern = schedule.schedule_pattern || {};
                      const scheduleType = schedule.schedule_type;
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                              {scheduleType.charAt(0).toUpperCase() + scheduleType.slice(1)}
                            </h4>
                            {schedule.with_food && (
                              <Badge variant="outline">With food</Badge>
                            )}
                          </div>

                          {scheduleType === "weekly" && (pattern as any).days && (
                            <div>
                              <h5 className="text-sm text-muted-foreground mb-1">
                                Days of Week
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {Object.keys((pattern as any).days).map((day) => (
                                  <Badge key={day} variant="secondary">
                                    {day.substring(0, 3)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {scheduleType === "monthly" && (pattern as any).days && (
                            <div>
                              <h5 className="text-sm text-muted-foreground mb-1">
                                Days of Month
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {Object.keys((pattern as any).days).map((day) => (
                                  <Badge key={day} variant="secondary">
                                    {day}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {scheduleType !== "as_needed" && (pattern as any).times && (
                            <div>
                              <h5 className="text-sm text-muted-foreground mb-1">
                                Times
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {(pattern as any).times.map((time: string, i: number) => (
                                  <Badge key={i} variant="outline" className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {time}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    No schedule information available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-destructive">
            <AlertCircle className="h-8 w-8 mr-2" />
            <span>An error occurred. Could not load medication details.</span>
          </div>
        )}
        
      </DialogContent>
    </Dialog>
  );
} 