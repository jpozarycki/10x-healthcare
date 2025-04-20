import { Card, CardContent } from "@/components/ui/card";
import { MedicationListItem } from "@/app/types";
import { MedicationCard } from "./MedicationCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MedicationListProps {
  medications: MedicationListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  isLoading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

export function MedicationList({
  medications,
  pagination,
  isLoading,
  error,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: MedicationListProps) {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  
  if (error) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6 pb-6 text-center">
          <p className="text-red-500 mb-2">Error loading medications:</p>
          <p>{error}</p>
          <Button 
            onClick={() => onPageChange(pagination.page)} 
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-4 space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-[200px]" />
                <div className="flex space-x-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[70px]" />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Skeleton className="h-4 w-[80px] mb-1" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-[80px] mb-1" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardContent className="py-2 flex justify-end space-x-2">
              <Skeleton className="h-8 w-[90px]" />
              <Skeleton className="h-8 w-[80px]" />
              <Skeleton className="h-8 w-[90px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (medications.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6 pb-6 text-center">
          <p className="text-muted-foreground">
            No medications found matching your filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {medications.map((medication) => (
          <MedicationCard
            key={medication.id}
            medication={medication}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of <span className="font-medium">{pagination.total}</span> results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              
              // Show only current page, first, last, and pages around current
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
              ) {
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNumber)}
                    className="w-8"
                  >
                    {pageNumber}
                  </Button>
                );
              }
              
              // Show ellipsis for gaps
              if (
                (pageNumber === 2 && pagination.page > 3) ||
                (pageNumber === totalPages - 1 && pagination.page < totalPages - 2)
              ) {
                return (
                  <Button
                    key={pageNumber}
                    variant="outline"
                    size="sm"
                    disabled
                    className="w-8 cursor-default"
                  >
                    ...
                  </Button>
                );
              }
              
              return null;
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 