"use client";

import { useState } from "react";
import { PageHeader } from "../components/medications/PageHeader";
import { MedicationFilters } from "../components/medications/MedicationFilters";
import { MedicationList } from "../components/medications/MedicationList";
import { MedicationFormModal } from "../components/medications/MedicationFormModal";
import { MedicationDetailsModal } from "../components/medications/MedicationDetailsModal";
import { ConfirmDeleteModal } from "../components/medications/ConfirmDeleteModal";
import { BulkImportModal } from "../components/medications/BulkImportModal";
import { useMedicationList } from "../hooks/medications/useMedicationList";
import { MedicationFiltersViewModel } from "../types/medications";
import { StatusModal } from "@/components/ui/status-modal";

export default function MedicationsPage() {
  // Initial filters
  const initialFilters: MedicationFiltersViewModel = {
    category: undefined,
    status: undefined,
    sort: "name",
    order: "asc",
  };

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false);
  
  // Status modal state
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    variant: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    variant: "success",
    title: "",
    message: ""
  });
  
  // Selected medication state
  const [selectedMedicationId, setSelectedMedicationId] = useState<string | null>(null);
  const [selectedMedicationName, setSelectedMedicationName] = useState<string>("");

  // Use custom hook for state management
  const {
    medications,
    filters,
    pagination,
    isLoading,
    error,
    updateFilters,
    goToPage,
    refreshList,
  } = useMedicationList(initialFilters);

  // Modal handlers
  const handleAddMedication = () => {
    setSelectedMedicationId(null);
    setFormModalOpen(true);
  };

  const handleEditMedication = (id: string) => {
    setSelectedMedicationId(id);
    setFormModalOpen(true);
  };

  const handleViewMedication = (id: string) => {
    setSelectedMedicationId(id);
    setDetailsModalOpen(true);
  };

  const handleDeleteMedication = (id: string, name: string) => {
    setSelectedMedicationId(id);
    setSelectedMedicationName(name);
    setDeleteModalOpen(true);
  };

  const handleBulkImport = () => {
    setBulkImportModalOpen(true);
  };

  // Show status messages
  const showStatusMessage = (variant: "success" | "error", title: string, message: string) => {
    setStatusModal({
      isOpen: true,
      variant,
      title,
      message
    });
  };

  // Success handlers
  const handleFormSubmitSuccess = () => {
    setFormModalOpen(false);
    const isEditing = !!selectedMedicationId;
    showStatusMessage(
      "success", 
      isEditing ? "Medication Updated" : "Medication Added", 
      isEditing 
        ? "The medication has been successfully updated." 
        : "The medication has been successfully added."
    );
    refreshList();
  };

  const handleDeleteSuccess = async () => {
    if (!selectedMedicationId) return;
    
    try {
      const response = await fetch(`/api/v1/medications/${selectedMedicationId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      setDeleteModalOpen(false);
      showStatusMessage(
        "success", 
        "Medication Deleted", 
        `The medication "${selectedMedicationName}" has been successfully deleted.`
      );
      refreshList();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      showStatusMessage("error", "Delete Failed", errorMessage);
    }
  };

  const handleBulkImportSuccess = () => {
    setBulkImportModalOpen(false);
    showStatusMessage(
      "success", 
      "Medications Imported", 
      "The medications have been successfully imported."
    );
    refreshList();
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <PageHeader 
        onAddMedication={handleAddMedication} 
        onBulkImport={handleBulkImport} 
      />
      
      <MedicationFilters 
        filters={filters} 
        onFilterChange={updateFilters}
        onReset={() => updateFilters(initialFilters)}
      />
      
      <MedicationList 
        medications={medications} 
        pagination={pagination}
        isLoading={isLoading}
        error={error}
        onPageChange={goToPage}
        onView={handleViewMedication}
        onEdit={handleEditMedication}
        onDelete={handleDeleteMedication}
      />

      {/* Modals */}
      {formModalOpen && (
        <MedicationFormModal 
          isOpen={formModalOpen}
          medicationId={selectedMedicationId}
          onClose={() => setFormModalOpen(false)}
          onSave={handleFormSubmitSuccess}
        />
      )}
      
      {detailsModalOpen && selectedMedicationId && (
        <MedicationDetailsModal
          isOpen={detailsModalOpen}
          medicationId={selectedMedicationId}
          onClose={() => setDetailsModalOpen(false)}
          onEdit={handleEditMedication}
          onDelete={handleDeleteMedication}
        />
      )}
      
      {deleteModalOpen && selectedMedicationId && (
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          medicationId={selectedMedicationId}
          medicationName={selectedMedicationName}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteSuccess}
        />
      )}

      {bulkImportModalOpen && (
        <BulkImportModal
          isOpen={bulkImportModalOpen}
          onClose={() => setBulkImportModalOpen(false)}
        />
      )}
      
      {/* Status Modal */}
      <StatusModal
        isOpen={statusModal.isOpen}
        variant={statusModal.variant}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
} 