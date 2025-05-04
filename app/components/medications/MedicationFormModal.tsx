import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScheduleFormSection } from "./ScheduleFormSection";
import { Loader2, PlusCircle, Edit } from "lucide-react";
import { StatusModal, useStatusModal } from "@/components/ui/status-modal";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { cn } from "@/lib/utils";
import { TimeInput } from "@/app/components/ui/TimeInput";
import { MedicationFormData, medicationFormSchema, MedicationInteraction } from "@/app/types/medications";
import { CreateMedicationRequest } from "@/app/types";
import MedicationService from "@/app/services/medicationService";
import { z } from "zod";

// Define as a union type instead of referencing the Database type
type MedicationCategory = "chronic" | "acute" | "as_needed";

interface MedicationFormModalProps {
  isOpen: boolean;
  medicationId: string | null;
  onClose: () => void;
  onSave: () => void;
}

const defaultValues: MedicationFormData = {
  name: "",
  form: "",
  category: "chronic",
  start_date: new Date().toISOString().split("T")[0],
  schedule: {
    type: "daily",
    times: ["08:00"],
    with_food: false,
    pattern: {}
  }
};

export function MedicationFormModal({
  isOpen,
  medicationId,
  onClose,
  onSave,
}: MedicationFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showStatus, showError, showSuccess, status, closeStatus } = useStatusModal();
  const [pendingSave, setPendingSave] = useState<{
    data: MedicationFormData;
    interactions?: MedicationInteraction[];
    disclaimer?: string;
  } | null>(null);
  const [showInteractionConfirmation, setShowInteractionConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<MedicationFormData>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: async () => {
      if (medicationId) {
        setIsLoading(true);
        try {
          const data = await MedicationService.getMedication(medicationId);
          setIsLoading(false);
          return data;
        } catch (error) {
          showError("Failed to load medication details");
          setIsLoading(false);
          return defaultValues;
        }
      }
      return defaultValues;
    }
  });

  const formatInteractionMessage = (interactions: MedicationInteraction[], disclaimer?: string) => {
    if (!interactions.length) return "";
    
    const messages = interactions.map((int) => `
<strong>${int.medication_pair[0]} + ${int.medication_pair[1]}</strong>
<p>${int.description}</p>
<p><strong>Severity:</strong> ${int.severity}</p>
<p><strong>Recommendation:</strong> ${int.recommendations}</p>
`).join("<br/>");

    let formattedMessage = `
<div class="space-y-4">
  <p class="font-semibold text-amber-700">Critical medication interactions detected:</p>
  ${messages}
`;

    if (disclaimer) {
      formattedMessage += `
<div class="mt-4 text-sm text-gray-500 border-t pt-2">
  <p><em>${disclaimer}</em></p>
</div>`;
    }

    formattedMessage += '</div>';
    return formattedMessage;
  };

  const prepareRequestData = (formData: MedicationFormData, forceSave = false): CreateMedicationRequest => {
    return {
      name: formData.name,
      form: formData.form,
      strength: formData.strength,
      category: formData.category,
      purpose: formData.purpose,
      instructions: formData.instructions,
      start_date: formData.start_date,
      end_date: formData.end_date,
      refill_reminder_days: formData.refill_reminder_days,
      pills_per_refill: formData.pills_per_refill,
      schedule: {
        type: formData.schedule.type,
        pattern: formData.schedule.pattern,
        times: formData.schedule.times,
        with_food: formData.schedule.with_food
      },
      ...(forceSave ? { force_save: true } : {})
    };
  };

  const handleForceSave = async () => {
    if (!pendingSave) return;
    
    try {
      const medicationData = prepareRequestData(pendingSave.data, true);
      await MedicationService.createMedication(medicationData);

      onSave();
      reset(defaultValues);
      setPendingSave(null);
      setShowInteractionConfirmation(false);
      showSuccess("Medication saved successfully", "Success");
    } catch (error: any) {
      const errorMessage = error.message || error.error || "An error occurred while saving the medication";
      showError(errorMessage, "Error Saving Medication");
    }
  };

  const onSubmit: SubmitHandler<MedicationFormData> = async (data) => {
    try {
      const medicationData = prepareRequestData(data);
      const response = medicationId
        ? await MedicationService.updateMedication(medicationId, medicationData)
        : await MedicationService.createMedication(medicationData);

      if (response.interactions?.length) {
        // Store the form data and interactions for potential force save
        setPendingSave({
          data,
          interactions: response.interactions,
          disclaimer: response.disclaimer
        });
        setShowInteractionConfirmation(true);
        return;
      }

      // No interactions, proceed with save
      onSave();
      reset(defaultValues);
      showSuccess("Medication saved successfully", "Success");
    } catch (error: any) {
      // Check if the error contains interaction data
      if (error.interactions?.length) {
        // This is an interaction warning, not a real error
        setPendingSave({
          data,
          interactions: error.interactions,
          disclaimer: error.disclaimer
        });
        setShowInteractionConfirmation(true);
        return;
      }
      
      // Real error - show error message
      const errorMessage = error.message || error.error || "An error occurred while saving the medication";
      showError(errorMessage, "Error Saving Medication");
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset(defaultValues);
      setPendingSave(null);
      setShowInteractionConfirmation(false);
      closeStatus();
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading medication details...</span>
      </div>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className={cn(
          "bg-white shadow-xl rounded-xl",
          "border-2 border-primary/20",
          "max-w-2xl max-h-[90vh] overflow-y-auto"
        )}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary text-xl font-bold">
              {medicationId ? (
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="required">Medication Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                  placeholder="e.g. Aspirin"
                />
                {errors.name?.message && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="form" className="required">Medication Form</Label>
                <Input
                  id="form"
                  {...register("form")}
                  className={errors.form ? "border-red-500" : ""}
                  placeholder="e.g. Tablet, Capsule, Liquid"
                />
                {errors.form?.message && (
                  <p className="text-sm text-red-500">{errors.form.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="strength">Strength</Label>
                <Input
                  id="strength"
                  {...register("strength")}
                  placeholder="e.g. 500mg, 10ml"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="required">Category</Label>
                <Select
                  defaultValue={defaultValues.category}
                  onValueChange={(value) => register("category").onChange({ target: { value } })}
                >
                  <SelectTrigger id="category" className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chronic">Chronic</SelectItem>
                    <SelectItem value="acute">Acute</SelectItem>
                    <SelectItem value="as_needed">As needed</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category?.message && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date" className="required">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register("start_date")}
                  className={errors.start_date ? "border-red-500" : ""}
                />
                {errors.start_date?.message && (
                  <p className="text-sm text-red-500">{errors.start_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register("end_date")}
                  className={errors.end_date ? "border-red-500" : ""}
                />
                {errors.end_date?.message && (
                  <p className="text-sm text-red-500">{errors.end_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="refill_reminder_days">Refill Reminder (days)</Label>
                <Input
                  id="refill_reminder_days"
                  type="number"
                  {...register("refill_reminder_days", { valueAsNumber: true })}
                  className={errors.refill_reminder_days ? "border-red-500" : ""}
                  min="0"
                  max="90"
                />
                {errors.refill_reminder_days?.message && (
                  <p className="text-sm text-red-500">{errors.refill_reminder_days.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pills_per_refill">Pills per Refill</Label>
                <Input
                  id="pills_per_refill"
                  type="number"
                  {...register("pills_per_refill", { valueAsNumber: true })}
                  className={errors.pills_per_refill ? "border-red-500" : ""}
                  min="1"
                />
                {errors.pills_per_refill?.message && (
                  <p className="text-sm text-red-500">{errors.pills_per_refill.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea
                  id="purpose"
                  {...register("purpose")}
                  placeholder="What is this medication for?"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Special Instructions</Label>
                <Textarea
                  id="instructions"
                  {...register("instructions")}
                  placeholder="Any special instructions for taking this medication?"
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="schedule.type" className="required">Schedule Type</Label>
              <Select
                defaultValue={defaultValues.schedule.type}
                onValueChange={(value) => register("schedule.type").onChange({ target: { value } })}
              >
                <SelectTrigger id="schedule.type" className={errors.schedule?.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select schedule type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="as_needed">As needed</SelectItem>
                </SelectContent>
              </Select>
              {errors.schedule?.type && typeof errors.schedule.type === 'object' && 'message' in errors.schedule.type && (
                <p className="text-sm text-red-500">{errors.schedule.type.message}</p>
              )}

              <TimeInput
                control={control}
                error={errors.schedule?.times && typeof errors.schedule.times === 'object' && 'message' in errors.schedule.times 
                  ? String(errors.schedule.times.message) 
                  : undefined}
              />
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="ml-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <ConfirmationModal
        isOpen={showInteractionConfirmation}
        onCancel={() => {
          setShowInteractionConfirmation(false);
          setPendingSave(null);
        }}
        onConfirm={handleForceSave}
        title="Medication Interaction Warning"
        message={formatInteractionMessage(pendingSave?.interactions || [], pendingSave?.disclaimer)}
        variant="warning"
        confirmText="Save Anyway"
        cancelText="Cancel"
      />
      
      {status.isOpen && (
        <StatusModal
          isOpen={status.isOpen}
          onClose={closeStatus}
          title={status.title || ''}
          message={status.message}
          variant={status.variant}
        />
      )}
    </>
  );
} 