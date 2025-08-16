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

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
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

export interface ExecutiveAnalytics {
  financial: {
    currentMonthRevenue: number;
    previousMonthRevenue: number;
    revenueGrowth: number;
    revenueTrend: {
      month: string;
      revenue: number;
      orders: number;
    }[];
    cashFlow: {
      status: string;
      amount: number;
      count: number;
    }[];
  };
  agentPerformance: {
    agentId: number;
    agentName: string;
    agentEmail: string;
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    completedOrders: number;
    pendingOrders: number;
    completionRate: number;
  }[];
  customers: {
    topCustomers: {
      partyId: number;
      partyName: string;
      totalSpent: number;
      orderCount: number;
      lastOrder: string;
      firstOrder: string;
      avgOrderValue: number;
    }[];
    retentionRate: number;
    newCustomersThisMonth: number;
    repeatCustomers: number;
  };
  operations: {
    processingTimes: {
      status: string;
      avgDays: number;
      count: number;
    }[];
    statusDistribution: {
      date: string;
      status: string;
      count: number;
    }[];
    productPerformance: {
      productName: string;
      subcategoryName: string;
      totalQuantity: number;
      totalRevenue: number;
      orderCount: number;
    }[];
  };
  risk: {
    cancellationRate: number;
    pendingPaymentAmount: number;
    pendingPaymentCount: number;
  };
}

export interface AgentLeaderboards {
  topRevenueAgents: {
    agentId: number;
    agentName: string;
    agentEmail: string;
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    completedOrders: number;
    pendingOrders: number;
  }[];
  topOrderAgents: {
    agentId: number;
    agentName: string;
    agentEmail: string;
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
  }[];
  topCompletionAgents: {
    agentId: number;
    agentName: string;
    agentEmail: string;
    totalOrders: number;
    completedOrders: number;
    completionRate: number;
    totalRevenue: number;
  }[];
  topEfficiencyAgents: {
    agentId: number;
    agentName: string;
    agentEmail: string;
    totalOrders: number;
    avgProcessingDays: number;
    totalRevenue: number;
  }[];
  agentActivityHeatmap: {
    agentId: number;
    agentName: string;
    date: string;
    ordersCreated: number;
    revenueGenerated: number;
  }[];
}

export interface PredictiveAnalytics {
  dailyRevenueTrend: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  weeklyRevenueTrend: {
    week: string;
    revenue: number;
    orders: number;
  }[];
  monthlyRevenueTrend: {
    month: string;
    revenue: number;
    orders: number;
  }[];
  seasonalPatterns: {
    dayOfWeek: number;
    hourOfDay: number;
    revenue: number;
    orders: number;
  }[];
  revenueForecast: {
    date: string;
    predictedRevenue: number;
    confidence: number;
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
    return data as Paginated<PurchaseListItem>;
  },

  async getById(id: number) {
    const { data } = await api.get(`/purchases/${id}`);
    return data as any;
  },

  async stats() {
    const { data } = await api.get("/purchases/stats");
    return data as DashboardStats;
  },

  async executiveAnalytics() {
    const { data } = await api.get("/purchases/executive-analytics");
    return data as ExecutiveAnalytics;
  },

  async agentLeaderboards() {
    const { data } = await api.get("/purchases/agent-leaderboards");
    return data as AgentLeaderboards;
  },

  async predictiveAnalytics() {
    const { data } = await api.get("/purchases/predictive-analytics");
    return data as PredictiveAnalytics;
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
