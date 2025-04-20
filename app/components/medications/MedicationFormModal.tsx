import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScheduleFormSection } from "./ScheduleFormSection";
import { Loader2, PlusCircle, Edit } from "lucide-react";
import { useMedicationForm } from "@/app/hooks/medications/useMedicationForm";
import { StatusModal } from "@/components/ui/status-modal";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Database } from "@/app/db/database.types";
import { cn } from "@/lib/utils";
import { MedicationInteraction, InteractionSeverity } from "@/app/types";

// Define as a union type instead of referencing the Database type
type MedicationCategory = "chronic" | "acute" | "as_needed";

interface MedicationFormModalProps {
  isOpen: boolean;
  medicationId: string | null;
  onClose: () => void;
  onSave: () => void;
}

export function MedicationFormModal({
  isOpen,
  medicationId,
  onClose,
  onSave,
}: MedicationFormModalProps) {
  const {
    formData,
    isLoading,
    isSubmitting,
    fetchError,
    updateField,
    handleSubmit,
  } = useMedicationForm({ medicationId });

  // Add state for tracking medication interactions
  const [interactionWarning, setInteractionWarning] = useState<{
    isOpen: boolean;
    interactions: MedicationInteraction[];
    severity: InteractionSeverity;
    disclaimer: string;
  }>({
    isOpen: false,
    interactions: [],
    severity: InteractionSeverity.LOW,
    disclaimer: "",
  });

  const isEditing = !!medicationId;

  // Obsługuje zamknięcie modalu
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Obsługuje zapisywanie formularza
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Reset any previous interaction warnings and errors
      setInteractionWarning(prev => ({ ...prev, isOpen: false }));
      updateField("errors", {});
      
      // Format the data according to the schema
      const formattedData = {
        name: formData.name,
        form: formData.form,
        strength: formData.strength || undefined,
        category: formData.category,
        purpose: formData.purpose || undefined,
        instructions: formData.instructions || undefined,
        start_date: formData.startDate,
        end_date: formData.endDate || undefined,
        refill_reminder_days: formData.refillReminderDays ? Number(formData.refillReminderDays) : undefined,
        pills_per_refill: formData.pillsPerRefill ? Number(formData.pillsPerRefill) : undefined,
        schedule: {
          type: formData.scheduleType,
          pattern: {}, // Add any specific pattern data if needed
          times: Array.isArray(formData.scheduleTimes) ? formData.scheduleTimes : [formData.scheduleTimes].filter(Boolean),
          with_food: formData.withFood || false
        }
      };

      console.log("Submitting formatted data:", formattedData);
      
      const data = JSON.stringify(formattedData);
      const url = medicationId
        ? `/api/v1/medications/${medicationId}`
        : "/api/v1/medications";
      
      const method = medicationId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: data
      });
      
      const responseData = await response.json();
      console.log("Response data:", responseData);
      
      // Check for validation errors
      if (!response.ok && responseData.errors) {
        console.log("Validation errors:", responseData.errors);
        
        // Update form errors with validation errors
        const validationErrors = responseData.errors.reduce((acc: any, error: any) => {
          // Extract field name from the path
          const fieldPath = error.path || [];
          const fieldName = fieldPath[fieldPath.length - 1];
          
          if (fieldName) {
            // Map schema field names to form field names
            const fieldMapping: { [key: string]: string } = {
              start_date: 'startDate',
              end_date: 'endDate',
              refill_reminder_days: 'refillReminderDays',
              pills_per_refill: 'pillsPerRefill',
              with_food: 'withFood'
            };
            
            const formFieldName = fieldMapping[fieldName] || fieldName;
            acc[formFieldName] = error.message;
          } else {
            // If no specific field, set as general submit error
            acc.submit = error.message;
          }
          return acc;
        }, {});
        
        console.log("Processed validation errors:", validationErrors);
        updateField("errors", validationErrors);
        return;
      }
      
      // Check for interaction warnings
      if (!response.ok && responseData.interactions) {
        console.log("Interaction warning detected:", responseData);
        
        // Extract interaction data from the response
        const interactions = Array.isArray(responseData.interactions) 
          ? responseData.interactions 
          : [];
          
        // Set up the warning modal data
        setInteractionWarning({
          isOpen: true,
          interactions: interactions,
          severity: responseData.severity || InteractionSeverity.LOW,
          disclaimer: responseData.disclaimer || "Please consult a healthcare professional before taking this medication."
        });
        
        return;
      }
      
      if (!response.ok) {
        // Handle other types of errors
        console.error("Unexpected error:", responseData);
        updateField("errors", { 
          submit: responseData.message || "An error occurred while saving the medication."
        });
        return;
      }
      
      // If we get here, the request was successful
      onSave();
    } catch (error) {
      console.error("Error submitting form:", error);
      updateField("errors", { 
        submit: "An unexpected error occurred. Please try again."
      });
    }
  };

  // Force save even with interactions
  const handleForceSave = async () => {
    try {
      // Close the interaction warning modal
      setInteractionWarning(prev => ({ ...prev, isOpen: false }));
      
      // Reset any previous errors
      updateField("errors", {});
      
      // Format the data according to the schema, but include force_save at the top level
      const formattedData = {
        name: formData.name,
        form: formData.form,
        strength: formData.strength || undefined,
        category: formData.category,
        purpose: formData.purpose || undefined,
        instructions: formData.instructions || undefined,
        start_date: formData.startDate,
        end_date: formData.endDate || undefined,
        refill_reminder_days: formData.refillReminderDays ? Number(formData.refillReminderDays) : undefined,
        pills_per_refill: formData.pillsPerRefill ? Number(formData.pillsPerRefill) : undefined,
        schedule: {
          type: formData.scheduleType,
          pattern: {}, // Add any specific pattern data if needed
          times: Array.isArray(formData.scheduleTimes) ? formData.scheduleTimes : [formData.scheduleTimes].filter(Boolean),
          with_food: formData.withFood || false
        },
        // Add force_save flag at the top level
        force_save: true
      };
      
      console.log("Force saving medication with data:", formattedData);
      
      const data = JSON.stringify(formattedData);
      const url = medicationId
        ? `/api/v1/medications/${medicationId}`
        : "/api/v1/medications";
      
      const method = medicationId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: data
      });
      
      // Try to parse JSON response, but handle case where it might not be JSON
      let responseData;
      try {
        responseData = await response.json();
        console.log("Force save response:", responseData);
      } catch (e) {
        console.log("Non-JSON response:", await response.text());
      }
      
      if (!response.ok) {
        console.error("Error during force save:", responseData);
        updateField("errors", { 
          submit: responseData?.message || "An error occurred while saving the medication."
        });
        return;
      }
      
      // Success - close the form and refresh the list
      onSave();
    } catch (error) {
      console.error("Error force saving medication:", error);
      updateField("errors", { 
        submit: "An unexpected error occurred. Please try again."
      });
    }
  };

  // Format the interaction warning message with clearer styling
  const formatInteractionMessage = () => {
    if (!interactionWarning.interactions.length) return "";
    
    console.log("Formatting interactions:", interactionWarning.interactions);
    
    const interactionsText = interactionWarning.interactions.map((interaction, index) => {
      // Determine severity color
      const severityColor = interaction.severity === InteractionSeverity.HIGH 
        ? 'red-600' 
        : interaction.severity === InteractionSeverity.MODERATE 
          ? 'amber-600' 
          : 'yellow-600';
      
      return `
        <div class="border-b pb-3 mb-3 last:border-none">
          <p class="font-semibold text-lg">${index + 1}. ${interaction.medication_pair[0]} + ${interaction.medication_pair[1]}</p>
          <p class="mb-2 text-gray-800">${interaction.description}</p>
          <p class="text-${severityColor} font-medium mb-2">Severity: ${interaction.severity}</p>
          <p class="text-gray-800"><strong>Recommendation:</strong> ${interaction.recommendations}</p>
        </div>
      `;
    }).join("");

    return `
      <div>
        <div class="mb-4">${interactionsText}</div>
        <p class="text-sm text-gray-600 mt-3 p-2 bg-gray-100 rounded">${interactionWarning.disclaimer}</p>
      </div>
    `;
  };

  // Wyświetlanie komunikatu błędu, jeśli wystąpił problem z pobieraniem danych
  if (fetchError) {
    return (
      <StatusModal
        isOpen={!!fetchError}
        variant="error"
        title="Error Loading Medication"
        message={fetchError}
        onClose={onClose}
      />
    );
  }

  return (
    <>
      {/* Interaction Warning Modal with two action buttons */}
      <ConfirmationModal
        isOpen={interactionWarning.isOpen}
        variant="warning"
        title="Medication Interaction Warning"
        message={formatInteractionMessage()}
        onCancel={() => {
          setInteractionWarning(prev => ({ ...prev, isOpen: false }));
          // Just close the warning modal without saving
        }}
        onConfirm={handleForceSave}
        cancelText="Cancel"
        confirmText="Accept the risk and save"
      />

      <Dialog open={isOpen} onOpenChange={handleClose}>
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
            <DialogTitle className="flex items-center gap-2 text-primary text-xl font-bold">
              {isEditing ? (
                <>
                  <Edit className="h-6 w-6 text-primary" />
                  Edit Medication
                </>
              ) : (
                <>
                  <PlusCircle className="h-6 w-6 text-primary" />
                  Add New Medication
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading medication details...</span>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="required">
                    Medication Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className={formData.errors.name ? "border-red-500" : ""}
                    placeholder="e.g. Aspirin"
                    required
                  />
                  {formData.errors.name && (
                    <p className="text-sm text-red-500">{formData.errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form" className="required">
                    Medication Form
                  </Label>
                  <Input
                    id="form"
                    value={formData.form}
                    onChange={(e) => updateField("form", e.target.value)}
                    className={formData.errors.form ? "border-red-500" : ""}
                    placeholder="e.g. Tablet, Capsule, Liquid"
                    required
                  />
                  {formData.errors.form && (
                    <p className="text-sm text-red-500">{formData.errors.form}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strength">Strength</Label>
                  <Input
                    id="strength"
                    value={formData.strength || ""}
                    onChange={(e) => updateField("strength", e.target.value)}
                    placeholder="e.g. 500mg, 10ml"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="required">
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: MedicationCategory) => updateField("category", value)}
                  >
                    <SelectTrigger
                      id="category"
                      className={formData.errors.category ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chronic">Chronic</SelectItem>
                      <SelectItem value="acute">Acute</SelectItem>
                      <SelectItem value="as_needed">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.errors.category && (
                    <p className="text-sm text-red-500">
                      {formData.errors.category}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate" className="required">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateField("startDate", e.target.value)}
                    className={formData.errors.startDate ? "border-red-500" : ""}
                    required
                  />
                  {formData.errors.startDate && (
                    <p className="text-sm text-red-500">
                      {formData.errors.startDate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate || ""}
                    onChange={(e) => updateField("endDate", e.target.value)}
                    className={formData.errors.endDate ? "border-red-500" : ""}
                    min={formData.startDate}
                  />
                  {formData.errors.endDate && (
                    <p className="text-sm text-red-500">
                      {formData.errors.endDate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refillReminderDays">
                    Refill Reminder (days before empty)
                  </Label>
                  <Input
                    id="refillReminderDays"
                    type="number"
                    value={formData.refillReminderDays || ""}
                    onChange={(e) =>
                      updateField(
                        "refillReminderDays",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className={
                      formData.errors.refillReminderDays ? "border-red-500" : ""
                    }
                    min="0"
                    max="90"
                  />
                  {formData.errors.refillReminderDays && (
                    <p className="text-sm text-red-500">
                      {formData.errors.refillReminderDays}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pillsPerRefill">Pills per Refill</Label>
                  <Input
                    id="pillsPerRefill"
                    type="number"
                    value={formData.pillsPerRefill || ""}
                    onChange={(e) =>
                      updateField(
                        "pillsPerRefill",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className={
                      formData.errors.pillsPerRefill ? "border-red-500" : ""
                    }
                    min="1"
                  />
                  {formData.errors.pillsPerRefill && (
                    <p className="text-sm text-red-500">
                      {formData.errors.pillsPerRefill}
                    </p>
                  )}
                </div>
              </div>

              {/* Purpose and Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Textarea
                    id="purpose"
                    value={formData.purpose || ""}
                    onChange={(e) => updateField("purpose", e.target.value)}
                    placeholder="What is this medication for?"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Special Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions || ""}
                    onChange={(e) => updateField("instructions", e.target.value)}
                    placeholder="Any special instructions for taking this medication?"
                    rows={2}
                  />
                </div>
              </div>

              {/* Schedule Section */}
              <ScheduleFormSection
                scheduleType={formData.scheduleType}
                scheduleTimes={formData.scheduleTimes}
                schedulePattern={formData.schedulePattern}
                withFood={formData.withFood}
                errors={formData.errors}
                onChange={updateField}
              />

              {/* Error Message */}
              {formData.errors.submit && (
                <div className="text-red-500 p-3 border border-red-300 bg-red-50 rounded-md">
                  {formData.errors.submit}
                </div>
              )}

              <DialogFooter className="mt-6">
                <div className="w-full flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="font-medium"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    onClick={handleFormSubmit}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded shadow-md hover:shadow-lg transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditing ? "Updating..." : "Saving..."}
                      </>
                    ) : (
                      isEditing ? "Update Medication" : "Save Medication"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 