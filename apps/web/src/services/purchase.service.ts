import { api } from "@/services/api";

export type PurchaseStatus =
  | "confirmation_pending"
  | "processing"
  | "payment_pending"
  | "completed"
  | "cancelled";

export interface PurchaseListItem {
  id: number;
  uniqueId: string;
  partyId: number;
  salesType: "small" | "big" | "king";
  finalAmount: number;
  status: PurchaseStatus;
  invoiceNumber?: string | null;
  invoiceDate?: string;
  createdAt: string;
  party?: { name: string };
}

export interface DashboardStats {
  summary: {
    totalPurchases: number;
    pendingPayment: number;
    confirmationPending: number;
    processing: number;
    completed: number;
  };
  sales: {
    totalValue: number;
    averageOrderValue: number;
    byType: { type: string; count: number; amount: number }[];
  };
  parties: { uniqueCount: number };
  recentActivity: {
    id: number;
    uniqueId: string;
    partyName: string;
    amount: number;
    status: string;
    date: string;
  }[];
}

export type QuantityType = "piece" | "bale";

export interface CreatePurchaseItemInput {
  productId: number;
  subcategoryId?: number;
  quantity: number;
  quantityType: QuantityType;
  unitPrice: number;
  discount?: number;
}

export interface CreatePurchaseInput {
  partyId: number;
  salesType: "small" | "big" | "king";
  uniqueId: string;
  destination?: string;
  transport?: string;
  invoiceDate: string;
  orderPlacedDate: string;
  orderApprovalDate: string;
  discount?: number;
  remarks?: string;
  items: CreatePurchaseItemInput[];
}

export const purchaseService = {
  async list(params?: Record<string, any>) {
    const { data } = await api.get("/purchases", { params });
    return data as PurchaseListItem[];
  },

  async getById(id: number) {
    const { data } = await api.get(`/purchases/${id}`);
    return data as any;
  },

  async stats() {
    const { data } = await api.get("/purchases/stats");
    return data as DashboardStats;
  },

  async create(input: CreatePurchaseInput) {
    const { data } = await api.post("/purchases", input);
    return data as any;
  },

  async updateStatus(id: number, status: PurchaseStatus) {
    const { data } = await api.patch(`/purchases/${id}/status`, { status });
    return data as any;
  },

  async generateInvoice(id: number) {
    const { data } = await api.patch(`/purchases/${id}/invoice-number`, {});
    return data as any;
  },
};
