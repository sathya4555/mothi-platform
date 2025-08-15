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

  async createProduct(input: {
    name: string;
    size: string;
    category: "small" | "big" | "king";
    price?: number;
    isActive?: boolean;
  }) {
    const { data } = await api.post("/products", input);
    return data as Product;
  },

  async createSubcategory(input: {
    productId: number;
    value: string;
    pieceValue?: number;
    category: SubcategoryCategory;
    isActive?: boolean;
    activationDate?: string;
    expiryDate?: string;
  }) {
    const { data } = await api.post("/products/subcategories", input);
    return data as Subcategory;
  },

  async updateProduct(
    id: number,
    input: {
      name?: string;
      size?: string;
      category?: "small" | "big" | "king";
      price?: number;
      isActive?: boolean;
    }
  ) {
    const { data } = await api.patch(`/products/${id}`, input);
    return data as Product;
  },

  async deleteProduct(id: number) {
    await api.delete(`/products/${id}`);
  },

  async updateSubcategory(
    id: number,
    input: {
      value?: string;
      pieceValue?: number;
      category?: SubcategoryCategory;
      isActive?: boolean;
      activationDate?: string;
      expiryDate?: string;
    }
  ) {
    const { data } = await api.patch(`/products/subcategories/${id}`, input);
    return data as Subcategory;
  },

  async deleteSubcategory(id: number) {
    await api.delete(`/products/subcategories/${id}`);
  },
};
