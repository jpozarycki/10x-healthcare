import { Button } from "@/components/ui/button";
import { PlusCircle, Upload } from "lucide-react";

interface PageHeaderProps {
  onAddMedication: () => void;
  onBulkImport: () => void;
}

export function PageHeader({ onAddMedication, onBulkImport }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Medications</h1>
        <p className="text-muted-foreground mt-1">
          Manage your medications and their schedules
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          onClick={onBulkImport}
          className="flex items-center"
        >
          <Upload className="mr-2 h-4 w-4" />
          Bulk Import
        </Button>
        <Button 
          onClick={onAddMedication}
          className="flex items-center"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Medication
        </Button>
      </div>
    </div>
  );
} 