import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { MedicationFiltersViewModel } from "@/app/types/medications";

interface MedicationFiltersProps {
  filters: MedicationFiltersViewModel;
  onFilterChange: (filters: MedicationFiltersViewModel) => void;
  onReset: () => void;
}

export function MedicationFilters({ filters, onFilterChange, onReset }: MedicationFiltersProps) {
  const [localFilters, setLocalFilters] = useState<MedicationFiltersViewModel>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof MedicationFiltersViewModel, value: string | undefined) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onReset();
  };

  const hasActiveFilters = !!filters.category || !!filters.status;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={localFilters.category || "all_categories"}
              onValueChange={(value) => handleFilterChange("category", value === "all_categories" ? undefined : value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_categories">All categories</SelectItem>
                <SelectItem value="chronic">Chronic</SelectItem>
                <SelectItem value="acute">Acute</SelectItem>
                <SelectItem value="as_needed">As needed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={localFilters.status || "all_statuses"}
              onValueChange={(value) => handleFilterChange("status", value === "all_statuses" ? undefined : value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_statuses">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort">Sort by</Label>
            <Select
              value={localFilters.sort || "name"}
              onValueChange={(value) => handleFilterChange("sort", value)}
            >
              <SelectTrigger id="sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="form">Form</SelectItem>
                <SelectItem value="start_date">Start date</SelectItem>
                <SelectItem value="end_date">End date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Select
              value={localFilters.order || "asc"}
              onValueChange={(value) => handleFilterChange("order", value as "asc" | "desc")}
            >
              <SelectTrigger id="order">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center"
            >
              <X className="mr-2 h-4 w-4" />
              Clear filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 