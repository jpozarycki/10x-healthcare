import { useState, useEffect, useCallback } from "react";
import { MedicationFiltersViewModel } from "@/app/types/medications";
import { ListMedicationsResponse, MedicationListItem } from "@/app/types";

export function useMedicationList(initialFilters: MedicationFiltersViewModel) {
  // Stan
  const [medications, setMedications] = useState<MedicationListItem[]>([]);
  const [filters, setFilters] = useState<MedicationFiltersViewModel>(initialFilters);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Funkcja pobierająca dane
  const fetchMedications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.sort) queryParams.append('sort', filters.sort);
      if (filters.order) queryParams.append('order', filters.order);
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());
      
      const response = await fetch(`/api/v1/medications?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data: ListMedicationsResponse = await response.json();
      
      setMedications(data.items);
      setPagination(prev => ({ ...prev, total: data.total }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Error fetching medications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Pobieranie danych przy zmianie filtrów lub paginacji
  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  // Aktualizacja filtrów - resetuje paginację do pierwszej strony
  const updateFilters = useCallback((newFilters: MedicationFiltersViewModel) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Zmiana strony
  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  // Odświeżanie listy
  const refreshList = useCallback(() => {
    fetchMedications();
  }, [fetchMedications]);

  return {
    medications,
    filters,
    pagination,
    isLoading,
    error,
    updateFilters,
    goToPage,
    refreshList
  };
} 