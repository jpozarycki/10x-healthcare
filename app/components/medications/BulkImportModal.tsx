import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CirclePlus, Download, Upload, Database } from "lucide-react";
import { ImportedMedicationItem } from "./ImportedMedicationItem";
import { useBulkImport } from "@/app/hooks/medications/useBulkImport";
import { BulkImportMedicationItem } from "@/app/types/medications";
import { StatusModal } from "@/components/ui/status-modal";
import { cn } from "@/lib/utils";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BulkImportModal({ isOpen, onClose }: BulkImportModalProps) {
  const [activeTab, setActiveTab] = useState<"add" | "review">("add");
  const [showImportStatus, setShowImportStatus] = useState(false);
  
  const {
    importData,
    isSubmitting,
    error,
    addMedication,
    updateMedication,
    removeMedication,
    goToPreview,
    submitImport,
    goToDataInput
  } = useBulkImport();

  const medications = importData.medications;
  const hasErrors = importData.hasErrors;

  // Resetowanie całego formularza
  const resetBulkImport = () => {
    // Reset form by navigating back to data input
    goToDataInput();
    // Remove all medications
    medications.forEach(med => removeMedication(med.id));
  };

  // Funkcja do walidacji i przechodzenia do przeglądu
  const validateAllMedications = () => {
    return goToPreview();
  };

  // Funkcja do obsługi przesyłania pliku CSV
  const uploadFile = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n');
      
      // Pomijamy nagłówek
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(',');
        if (columns.length < 6) continue;
        
        // Dodaj nowy lek
        addMedication();
        
        // Pobierz dodany lek (ostatni w tablicy)
        const newMedicationId = importData.medications[importData.medications.length - 1]?.id;
        if (!newMedicationId) continue;
        
        // Zaktualizuj dane leku
        const times = columns[6]?.split(';').filter(Boolean) || ["08:00"];
        
        updateMedication(newMedicationId, {
          name: columns[0] || "",
          form: columns[1] || "",
          strength: columns[2] || "",
          category: (columns[3] || "chronic") as "chronic" | "acute" | "as_needed",
          startDate: columns[4] || new Date().toISOString().split("T")[0],
          schedule: {
            type: (columns[5] || "daily") as "daily" | "weekly" | "monthly" | "as_needed",
            times: times,
            withFood: false,
            pattern: {}
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error parsing CSV:", error);
      return false;
    }
  };

  // Obsługa dodawania nowego leku
  const handleAddNewMedication = () => {
    addMedication();
  };

  // Obsługa przycisku wgrywania pliku
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadFile(file);
      setActiveTab("review");
    } catch (error) {
      console.error("Failed to upload file:", error);
    }
  };

  // Obsługa przycisku Dalej
  const handleNext = () => {
    const isValid = validateAllMedications();
    if (isValid) {
      setActiveTab("review");
    }
  };

  // Obsługa przycisku importu
  const handleImport = async () => {
    setShowImportStatus(true);
    try {
      await submitImport();
    } catch (error) {
      console.error("Import failed", error);
    }
  };

  // Obsługa zamknięcia modalu statusu
  const handleStatusClose = () => {
    setShowImportStatus(false);
    if (!error) {
      resetBulkImport();
      onClose();
    }
  };

  // Obsługa resetowania całego formularza
  const handleReset = () => {
    resetBulkImport();
    setActiveTab("add");
  };

  // Pobiera szablon CSV
  const downloadTemplate = () => {
    const template = "Medication Name,Form,Strength,Category,Start Date,Schedule Type,Times\nAspirin,Tablet,500mg,chronic,2023-10-01,daily,08:00;12:00;18:00\nIbuprofen,Capsule,400mg,as_needed,2023-10-01,as_needed,";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "medication_import_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="bg-white shadow-xl rounded-xl border-2 border-primary/20 max-w-3xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:slide-in-from-center data-[state=closed]:slide-out-to-center duration-300 ease-in-out transition-all animate-in fade-in-0 zoom-in-95">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary text-xl font-bold">
              <Database className="h-6 w-6 text-primary" />
              Bulk Import Medications
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "add" | "review")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add">Add Medications</TabsTrigger>
              <TabsTrigger 
                value="review" 
                disabled={medications.length === 0}
              >
                Review & Import
              </TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 flex flex-col items-center justify-center space-y-3 h-40">
                  <Button 
                    variant="outline" 
                    className="w-full h-full" 
                    onClick={handleAddNewMedication}
                  >
                    <CirclePlus className="mr-2 h-5 w-5" />
                    Add Manually
                  </Button>
                </div>

                <div className="border rounded-lg p-4 flex flex-col items-center justify-center space-y-3 h-40">
                  <div className="text-center space-y-2">
                    <Button variant="outline" className="w-full" asChild>
                      <label className="cursor-pointer">
                        <Upload className="mr-2 h-5 w-5" />
                        Upload CSV
                        <input
                          type="file"
                          className="hidden"
                          accept=".csv"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </Button>

                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-sm" 
                      onClick={downloadTemplate}
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Download Template
                    </Button>
                  </div>
                </div>
              </div>

              {medications.length > 0 && (
                <>
                  <div className="space-y-4 mt-6">
                    {medications.map((medication) => (
                      <ImportedMedicationItem
                        key={medication.id}
                        medication={medication}
                        onUpdate={updateMedication}
                        onRemove={removeMedication}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between mt-4">
                    <Button variant="outline" onClick={handleReset}>
                      Reset
                    </Button>
                    <Button onClick={handleNext}>
                      Next
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="review" className="space-y-4 mt-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-lg mb-4">Review Medications</h3>
                <p className="text-sm mb-2">
                  You are about to import {medications.length} medication{medications.length !== 1 ? 's' : ''}.
                </p>
                <div className="space-y-4 mt-4 max-h-[400px] overflow-y-auto">
                  {medications.map((medication) => (
                    <div key={medication.id} className="border-b pb-2 last:border-b-0">
                      <p className="font-medium">{medication.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {medication.form}{medication.strength && `, ${medication.strength}`} • 
                        {medication.category === "chronic" ? "Chronic" : 
                         medication.category === "acute" ? "Acute" : "As needed"} •
                        Starts {new Date(medication.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm">
                        Schedule: {medication.schedule.type === "daily" ? "Daily" : 
                                   medication.schedule.type === "weekly" ? "Weekly" : 
                                   medication.schedule.type === "monthly" ? "Monthly" : "As needed"}
                        {medication.schedule.type !== "as_needed" && 
                          ` at ${medication.schedule.times.join(", ")}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => setActiveTab("add")}>
                  Back
                </Button>
                <Button onClick={handleImport} disabled={isSubmitting}>
                  {isSubmitting ? "Importing..." : "Import All"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {showImportStatus && (
        <StatusModal
          isOpen={showImportStatus}
          variant={error ? "error" : "success"}
          title={error ? "Import Failed" : "Import Successful"}
          message={
            error
              ? `Failed to import medications: ${error}`
              : "Medications were successfully imported!"
          }
          onClose={handleStatusClose}
        />
      )}
    </>
  );
} 