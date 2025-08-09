import { api } from "./auth.service";

export interface Party {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
}

export interface Subcategory {
  id: number;
  name: string;
  productId: number;
}

class CatalogService {
  private baseUrl = "";

  async getParties(search?: string): Promise<Party[]> {
    try {
      const url = search
        ? `${this.baseUrl}/parties?search=${encodeURIComponent(search)}`
        : `${this.baseUrl}/parties`;
      const { data } = await api.get<Party[]>(url);
      return data;
    } catch {
      // Dev fallback
      return [
        { id: 1, name: "Acme Traders" },
        { id: 2, name: "Sunrise Textiles" },
        { id: 3, name: "Blue Ocean Imports" },
      ];
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      const { data } = await api.get<Product[]>(`${this.baseUrl}/products`);
      return data;
    } catch {
      return [
        { id: 101, name: "Cotton Fabric" },
        { id: 102, name: "Silk Fabric" },
      ];
    }
  }

  async getSubcategories(productId: number): Promise<Subcategory[]> {
    try {
      const { data } = await api.get<Subcategory[]>(
        `${this.baseUrl}/products/${productId}/subcategories`
      );
      return data;
    } catch {
      const map: Record<number, Subcategory[]> = {
        101: [
          { id: 1001, name: "Plain", productId: 101 },
          { id: 1002, name: "Printed", productId: 101 },
        ],
        102: [
          { id: 2001, name: "Raw Silk", productId: 102 },
          { id: 2002, name: "Tussar", productId: 102 },
        ],
      };
      return map[productId] ?? [];
    }
  }
}

export const catalogService = new CatalogService();
