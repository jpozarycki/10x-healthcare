import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { MedicationListItem } from "@/app/types";

interface MedicationCardProps {
  medication: MedicationListItem;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

export function MedicationCard({ medication, onView, onEdit, onDelete }: MedicationCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

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

  return (
    <Card 
      className={`transition-all duration-200 ${isHovered ? "shadow-md" : "shadow-sm"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{medication.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs">{medication.form}</Badge>
              {medication.strength && (
                <Badge variant="outline" className="text-xs">{medication.strength}</Badge>
              )}
              <Badge className={`text-xs ${getCategoryColor(medication.category)}`}>
                {getCategoryLabel(medication.category)}
              </Badge>
              <Badge variant={medication.is_active ? "default" : "secondary"} className="text-xs">
                {medication.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm">
          <div>
            <span className="text-muted-foreground">Start Date:</span>
            <p>{formatDate(medication.start_date)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">End Date:</span>
            <p>{formatDate(medication.end_date)}</p>
          </div>
          {medication.refill_reminder_days !== null && medication.refill_reminder_days !== undefined && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Refill Reminder:</span>
              <p>{medication.refill_reminder_days} days before empty</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2 pt-2 pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(medication.id)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Details
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(medication.id)}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(medication.id, medication.name)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
} 