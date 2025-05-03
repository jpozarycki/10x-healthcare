import { MedicationFormData, MedicationApiResponse, MedicationResponse } from '../types/medications';

class MedicationService {
  private static async handleResponse(response: Response): Promise<MedicationApiResponse> {
    const data = await response.json();
    if (!response.ok) {
      throw {
        status: response.status,
        ...data
      };
    }
    return data;
  }

  static async getMedication(id: string): Promise<MedicationResponse> {
    const response = await fetch(`/api/v1/medications/${id}`);
    const data = await this.handleResponse(response);
    return data.data as MedicationResponse;
  }

  static async createMedication(data: MedicationFormData): Promise<MedicationApiResponse> {
    const response = await fetch('/api/v1/medications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  static async updateMedication(id: string, data: MedicationFormData): Promise<MedicationApiResponse> {
    const response = await fetch(`/api/v1/medications/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  static async deleteMedication(id: string): Promise<void> {
    const response = await fetch(`/api/v1/medications/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const data = await response.json();
      throw {
        status: response.status,
        ...data
      };
    }
  }

  static async bulkImportMedications(medications: MedicationFormData[]): Promise<MedicationApiResponse> {
    const response = await fetch('/api/v1/medications/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ medications })
    });
    return this.handleResponse(response);
  }
}

export default MedicationService; 