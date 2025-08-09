import { api } from "@/services/api";

export interface Product {
  id: number;
  name: string;
  price?: number;
  size?: string;
  isActive?: boolean;
}

export type SubcategoryCategory = "small" | "big" | "king";

export interface Subcategory {
  id: number;
  productId: number;
  value: string;
  isActive: boolean;
  expiryDate: string;
  activationDate: string;
  pieceValue: number;
  category: SubcategoryCategory;
}

export const productService = {
  async listActiveProducts() {
    const { data } = await api.get("/products/active");
    return data as Product[];
  },

  async listAllSubcategories() {
    const { data } = await api.get("/products/subcategories/all");
    return data as Subcategory[];
  },
};
