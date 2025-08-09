import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  productService,
  type Product,
  type Subcategory,
  type SubcategoryCategory,
} from "@/services/product.service";
import { useAuth } from "@/context/AuthContext";

const inputBase =
  "h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 ring-ring";

const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<{
    name: string;
    size: string;
    category: SubcategoryCategory;
    price?: string;
    isActive: boolean;
  }>({ name: "", size: "", category: "small", price: "", isActive: true });
  const [subForm, setSubForm] = useState<{
    value: string;
    pieceValue: string;
    category: SubcategoryCategory;
  }>({ value: "", pieceValue: "", category: "small" });

  // Modals state
  const [confirmProductOpen, setConfirmProductOpen] = useState(false);
  const [confirmSubOpen, setConfirmSubOpen] = useState(false);
  const [productSuccessOpen, setProductSuccessOpen] = useState(false);
  const [subSuccessOpen, setSubSuccessOpen] = useState(false);

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["products", "active", { search }],
    queryFn: () => productService.listActiveProducts(),
  });

  const { data: allSubcategories, isLoading: loadingSubs } = useQuery<
    Subcategory[]
  >({
    queryKey: ["subcategories", "all"],
    queryFn: () => productService.listAllSubcategories(),
  });

  const subcategoriesForSelected = useMemo(() => {
    if (!selectedProduct) return [] as Subcategory[];
    return (allSubcategories || []).filter(
      (s) => s.productId === selectedProduct.id
    );
  }, [allSubcategories, selectedProduct]);

  const { mutateAsync: createProduct, isPending: creatingProduct } =
    useMutation({
      mutationFn: async (payload: {
        name: string;
        size: string;
        category: SubcategoryCategory;
        price?: number;
        isActive?: boolean;
      }) => {
        return productService.createProduct(payload);
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["products"] });
      },
    });

  const { mutateAsync: createSubcategory, isPending: creatingSub } =
    useMutation({
      mutationFn: async (payload: {
        productId: number;
        value: string;
        pieceValue?: number;
        category: SubcategoryCategory;
      }) => {
        return productService.createSubcategory(payload);
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["subcategories"] });
      },
    });

  const onCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmProductOpen(true);
  };

  const onCreateSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setConfirmSubOpen(true);
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen">
      <div className="container py-6 space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-sm text-muted-foreground">
              Manage products and subcategories
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Products list and create */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="flex items-center gap-2">
                <input
                  className={inputBase + " w-64"}
                  placeholder="Search products"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="mt-4 grid gap-2 max-h-[420px] overflow-auto">
                {loadingProducts && (
                  <div className="rounded border border-border p-3">
                    Loading...
                  </div>
                )}
                {products?.length
                  ? products
                      .filter((p) =>
                        `${p.name} ${p.size || ""}`
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      )
                      .map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedProduct(p)}
                          className={`text-left rounded-xl border p-3 hover:bg-accent hover:text-accent-foreground ${selectedProduct?.id === p.id ? "border-foreground" : "border-border"}`}
                        >
                          <div className="font-medium">{p.name}</div>
                          {p.size && (
                            <div className="text-xs text-muted-foreground">
                              {p.size}
                            </div>
                          )}
                        </button>
                      ))
                  : !loadingProducts && (
                      <div className="text-sm text-muted-foreground">
                        No products found
                      </div>
                    )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <h2 className="text-lg font-semibold">Create Product</h2>
              <form onSubmit={onCreateProduct} className="mt-3 grid gap-3">
                <input
                  className={inputBase}
                  placeholder="Name"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className={inputBase}
                    placeholder="Size"
                    value={productForm.size}
                    onChange={(e) =>
                      setProductForm({ ...productForm, size: e.target.value })
                    }
                    required
                  />
                  <select
                    className={inputBase}
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value as SubcategoryCategory,
                      })
                    }
                  >
                    <option value="small">Small</option>
                    <option value="big">Big</option>
                    <option value="king">King</option>
                  </select>
                </div>
                <input
                  className={inputBase}
                  placeholder="Price (optional)"
                  type="number"
                  min={0}
                  step={0.01}
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                />
                <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={productForm.isActive}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        isActive: e.target.checked,
                      })
                    }
                  />{" "}
                  Active
                </label>
                <Button type="submit" disabled={creatingProduct}>
                  Create
                </Button>
              </form>
            </div>
          </div>

          {/* Subcategories for selected product */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Subcategories</h2>
                {selectedProduct && (
                  <div className="text-sm text-muted-foreground">
                    for{" "}
                    <span className="font-medium">{selectedProduct.name}</span>
                  </div>
                )}
              </div>
              {!selectedProduct && (
                <div className="mt-3 text-sm text-muted-foreground">
                  Select a product to view subcategories
                </div>
              )}
              {selectedProduct && (
                <div className="mt-4 grid gap-2 max-h-[420px] overflow-auto">
                  {loadingSubs && (
                    <div className="rounded border border-border p-3">
                      Loading...
                    </div>
                  )}
                  {subcategoriesForSelected.length
                    ? subcategoriesForSelected.map((s) => (
                        <div
                          key={s.id}
                          className="rounded-xl border border-border p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{s.value}</div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {s.category}
                              </div>
                            </div>
                            <div className="text-sm">
                              ₹ {Number(s.pieceValue).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))
                    : !loadingSubs && (
                        <div className="text-sm text-muted-foreground">
                          No subcategories
                        </div>
                      )}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <h2 className="text-lg font-semibold">Create Subcategory</h2>
              {!selectedProduct ? (
                <div className="mt-2 text-sm text-muted-foreground">
                  Select a product first
                </div>
              ) : (
                <form onSubmit={onCreateSub} className="mt-3 grid gap-3">
                  <input
                    className={inputBase}
                    placeholder="Label (e.g., 10g, 1kg)"
                    value={subForm.value}
                    onChange={(e) =>
                      setSubForm({ ...subForm, value: e.target.value })
                    }
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className={inputBase}
                      placeholder="Piece Value"
                      type="number"
                      min={0}
                      step={0.01}
                      value={subForm.pieceValue}
                      onChange={(e) =>
                        setSubForm({ ...subForm, pieceValue: e.target.value })
                      }
                      required
                    />
                    <select
                      className={inputBase}
                      value={subForm.category}
                      onChange={(e) =>
                        setSubForm({
                          ...subForm,
                          category: e.target.value as SubcategoryCategory,
                        })
                      }
                    >
                      <option value="small">Small</option>
                      <option value="big">Big</option>
                      <option value="king">King</option>
                    </select>
                  </div>
                  <Button type="submit" disabled={creatingSub}>
                    Create
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Product Modal */}
      {confirmProductOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmProductOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-xl">
              <div className="p-6 text-center space-y-2">
                <h3 className="text-lg font-semibold tracking-tight">
                  Create Product?
                </h3>
                <p className="text-sm text-muted-foreground">
                  {productForm.name} • {productForm.size} •{" "}
                  {productForm.category}
                </p>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button
                    variant="ghost"
                    className="h-11"
                    onClick={() => setConfirmProductOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-11"
                    onClick={async () => {
                      try {
                        await createProduct({
                          name: productForm.name.trim(),
                          size: productForm.size.trim(),
                          category: productForm.category,
                          price: productForm.price
                            ? Number(productForm.price)
                            : undefined,
                          isActive: productForm.isActive,
                        });
                        setProductForm({
                          name: "",
                          size: "",
                          category: "small",
                          price: "",
                          isActive: true,
                        });
                        setProductSuccessOpen(true);
                      } finally {
                        setConfirmProductOpen(false);
                      }
                    }}
                  >
                    Yes, Create
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Subcategory Modal */}
      {confirmSubOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmSubOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-xl">
              <div className="p-6 text-center space-y-2">
                <h3 className="text-lg font-semibold tracking-tight">
                  Create Subcategory?
                </h3>
                <p className="text-sm text-muted-foreground">
                  {subForm.value} • {subForm.category} • ₹{" "}
                  {subForm.pieceValue || 0}
                </p>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button
                    variant="ghost"
                    className="h-11"
                    onClick={() => setConfirmSubOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-11"
                    onClick={async () => {
                      try {
                        if (!selectedProduct) return;
                        await createSubcategory({
                          productId: selectedProduct.id,
                          value: subForm.value.trim(),
                          pieceValue: subForm.pieceValue
                            ? Number(subForm.pieceValue)
                            : undefined,
                          category: subForm.category,
                        });
                        setSubForm({
                          value: "",
                          pieceValue: "",
                          category: "small",
                        });
                        setSubSuccessOpen(true);
                      } finally {
                        setConfirmSubOpen(false);
                      }
                    }}
                  >
                    Yes, Create
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modals */}
      {productSuccessOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setProductSuccessOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl border border-emerald-200 bg-white shadow-xl">
              <div className="p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6 text-emerald-600"
                    fill="currentColor"
                  >
                    <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm4.707 8.293-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 1 1 1.414-1.414L11 13.586l4.293-4.293a1 1 0 0 1 1.414 1.414Z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold tracking-tight text-emerald-700">
                  Product created
                </h3>
                <div className="mt-3">
                  <Button onClick={() => setProductSuccessOpen(false)}>
                    OK
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {subSuccessOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSubSuccessOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl border border-emerald-200 bg-white shadow-xl">
              <div className="p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6 text-emerald-600"
                    fill="currentColor"
                  >
                    <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm4.707 8.293-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 1 1 1.414-1.414L11 13.586l4.293-4.293a1 1 0 0 1 1.414 1.414Z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold tracking-tight text-emerald-700">
                  Subcategory created
                </h3>
                <div className="mt-3">
                  <Button onClick={() => setSubSuccessOpen(false)}>OK</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
