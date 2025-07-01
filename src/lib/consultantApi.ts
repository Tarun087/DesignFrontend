import apiClient from './api';

export interface ConsultantProfile {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  experience?: number;
  location?: string;
  project?: string;
  availability: 'available' | 'busy' | 'unavailable';
}

export class ConsultantApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ConsultantApiError';
  }
}

export const consultantApi = {
  // Get all consultants
  getAllConsultants: async (): Promise<ConsultantProfile[]> => {
    try {
      const response = await apiClient.get('/consultant-profile');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching consultants:', error);
      throw new ConsultantApiError(
        error.response?.data?.detail || 'Failed to fetch consultants',
        error.response?.status,
        undefined,
        error.response?.data
      );
    }
  },

  // Get consultant by ID
  getConsultantById: async (id: number): Promise<ConsultantProfile> => {
    try {
      const response = await apiClient.get(`/consultant-profile/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching consultant ${id}:`, error);
      throw new ConsultantApiError(
        error.response?.data?.detail || `Failed to fetch consultant with ID ${id}`,
        error.response?.status,
        undefined,
        error.response?.data
      );
    }
  },

  // Create new consultant
  createConsultant: async (consultant: Omit<ConsultantProfile, 'id'>): Promise<ConsultantProfile> => {
    try {
      console.log('Creating consultant with data:', consultant);
      const response = await apiClient.post('/consultant-profile', consultant);
      console.log('Create consultant response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating consultant:', error);
      // Check for duplicate email error
      if (error.response?.status === 500 && error.response?.data?.detail?.includes('Duplicate entry')) {
        throw new ConsultantApiError(
          'This email is already registered',
          error.response.status,
          'DUPLICATE_EMAIL',
          error.response.data
        );
      }
      throw new ConsultantApiError(
        error.response?.data?.detail || 'Failed to create consultant',
        error.response?.status,
        undefined,
        error.response?.data
      );
    }
  },

  // Update consultant
  updateConsultant: async (id: number, consultant: Omit<ConsultantProfile, 'id'>): Promise<void> => {
    try {
      console.log(`Updating consultant ${id} with data:`, consultant);
      const response = await apiClient.put(`/consultant-profile/${id}`, consultant);
      console.log('Update consultant response:', response.data);
    } catch (error: any) {
      console.error(`Error updating consultant ${id}:`, error);
      // Check for duplicate email error
      if (error.response?.status === 500 && error.response?.data?.detail?.includes('Duplicate entry')) {
        throw new ConsultantApiError(
          'This email is already registered',
          error.response.status,
          'DUPLICATE_EMAIL',
          error.response.data
        );
      }
      throw new ConsultantApiError(
        error.response?.data?.detail || `Failed to update consultant with ID ${id}`,
        error.response?.status,
        undefined,
        error.response?.data
      );
    }
  },

  // Delete consultant
  deleteConsultant: async (id: number): Promise<void> => {
    try {
      console.log(`Deleting consultant ${id}`);
      await apiClient.delete(`/consultant-profile/${id}`);
      console.log(`Successfully deleted consultant ${id}`);
    } catch (error: any) {
      console.error(`Error deleting consultant ${id}:`, error);
      throw new ConsultantApiError(
        error.response?.data?.detail || `Failed to delete consultant with ID ${id}`,
        error.response?.status,
        undefined,
        error.response?.data
      );
    }
  },

  // Update consultant availability
  updateAvailability: async (id: number, availability: string): Promise<ConsultantProfile> => {
    try {
      console.log(`Updating availability for consultant ${id} to ${availability}`);
      const response = await apiClient.put(`/consultant-profile/${id}/availability?availability=${availability}`);
      console.log('Update availability response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating availability for consultant ${id}:`, error);
      throw new ConsultantApiError(
        error.response?.data?.detail || `Failed to update availability for consultant with ID ${id}`,
        error.response?.status,
        undefined,
        error.response?.data
      );
    }
  },

  // Search consultants by skill
  searchBySkill: async (skill: string): Promise<ConsultantProfile[]> => {
    try {
      const response = await apiClient.get(`/consultant-profile/search?skill=${skill}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error searching consultants with skill ${skill}:`, error);
      throw new ConsultantApiError(
        error.response?.data?.detail || `Failed to search consultants with skill: ${skill}`,
        error.response?.status,
        undefined,
        error.response?.data
      );
    }
  }
}; 