import { api } from "./auth.service";

export interface Party {
  id: number;
  name: string;
  address: string;
  gstNumber?: string;
  email?: string;
  phone: string;
  createdBy: number;
  isActive: boolean;
}

export interface PartySearchParams {
  search?: string;
  isActive?: boolean;
  createdBy?: number;
}

class PartyService {
  private baseUrl = `/parties`;

  async getParties(params: PartySearchParams = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append("search", params.search);
      if (params.isActive !== undefined)
        queryParams.append("isActive", String(params.isActive));
      if (params.createdBy)
        queryParams.append("createdBy", String(params.createdBy));

      const response = await api.get<Party[]>(
        `${this.baseUrl}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching parties:", error);
      throw error;
    }
  }

  async getPartyById(id: number) {
    try {
      const response = await api.get<Party>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching party ${id}:`, error);
      throw error;
    }
  }

  async getRecentParties(limit: number = 5) {
    try {
      const response = await api.get<Party[]>(
        `${this.baseUrl}?limit=${limit}&sort=createdAt:DESC`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching recent parties:", error);
      throw error;
    }
  }
}

export const partyService = new PartyService();
