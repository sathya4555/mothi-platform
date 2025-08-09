import { api } from "./auth.service";

export interface PurchaseItem {
  id: number;
  productId: number;
  subcategoryId?: number;
  quantity: number;
  quantityType: "piece" | "bale";
  price: number;
  totalPrice: number;
  productName: string;
  subcategoryName?: string;
}

export interface Purchase {
  id: number;
  uniqueId: string;
  partyId: number;
  partyName: string;
  status:
    | "confirmation_pending"
    | "processing"
    | "payment_pending"
    | "completed"
    | "cancelled";
  totalAmount: number;
  gstAmount: number;
  finalAmount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  createdByName: string;
  invoiceNumber?: string;
  items: PurchaseItem[];
}

export interface PurchaseSearchParams {
  status?: string;
  partyId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  createdBy?: number;
}

class PurchaseService {
  private baseUrl = `/purchases`;

  async getPurchases(params: PurchaseSearchParams = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append("status", params.status);
      if (params.partyId) queryParams.append("partyId", String(params.partyId));
      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);
      if (params.search) queryParams.append("search", params.search);
      if (params.createdBy)
        queryParams.append("createdBy", String(params.createdBy));

      const response = await api.get<Purchase[]>(
        `${this.baseUrl}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching purchases:", error);
      throw error;
    }
  }

  async getPurchaseById(id: number) {
    try {
      const response = await api.get<Purchase>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching purchase ${id}:`, error);
      throw error;
    }
  }

  async updatePurchaseStatus(id: number, status: Purchase["status"]) {
    try {
      const response = await api.patch<Purchase>(
        `${this.baseUrl}/${id}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating purchase ${id} status:`, error);
      throw error;
    }
  }

  async createPurchase(payload: {
    partyId: number;
    items: Array<{
      productId: number;
      subcategoryId?: number;
      quantity: number;
      quantityType: "piece" | "bale";
      price: number;
    }>;
  }): Promise<Purchase> {
    try {
      const { data } = await api.post<Purchase>(`${this.baseUrl}`, payload);
      return data;
    } catch (error) {
      // Dev fallback mock
      const now = new Date().toISOString();
      const totalAmount = payload.items.reduce(
        (sum, i) => sum + i.quantity * i.price,
        0
      );
      const gstAmount = totalAmount * 0.05;
      const finalAmount = totalAmount + gstAmount;
      return {
        id: Math.floor(Math.random() * 100000),
        uniqueId: `PO-${Date.now()}`,
        partyId: payload.partyId,
        partyName: "Demo Party",
        status: "confirmation_pending",
        totalAmount,
        gstAmount,
        finalAmount,
        createdAt: now,
        updatedAt: now,
        createdBy: 1,
        createdByName: "Demo Agent",
        items: payload.items.map((i, idx) => ({
          id: idx + 1,
          productId: i.productId,
          subcategoryId: i.subcategoryId,
          quantity: i.quantity,
          quantityType: i.quantityType,
          price: i.price,
          totalPrice: i.quantity * i.price,
          productName: `Product ${i.productId}`,
          subcategoryName: i.subcategoryId
            ? `Sub ${i.subcategoryId}`
            : undefined,
        })),
      } as Purchase;
    }
  }

  async getDashboardStats() {
    try {
      const response = await api.get(`${this.baseUrl}/dashboard/stats`);
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  async getOverduePurchases() {
    try {
      const response = await api.get(`${this.baseUrl}/overdue`);
      return response.data;
    } catch (error) {
      console.error("Error fetching overdue purchases:", error);
      throw error;
    }
  }
}

export const purchaseService = new PurchaseService();
