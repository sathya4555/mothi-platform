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
import {
  Search,
  Plus,
  Package,
  Tag,
  DollarSign,
  CheckCircle,
  X,
  Filter,
  Grid3X3,
  Edit,
  Trash2,
  MoreVertical,
  ChevronRight,
  List,
} from "lucide-react";

const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showCreateSub, setShowCreateSub] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showEditSub, setShowEditSub] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{
    type: "product" | "subcategory";
    id: number;
    name: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "subcategories">(
    "products"
  );
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

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) =>
      `${p.name} ${p.size || ""}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

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
        setShowCreateProduct(false);
        setProductForm({
          name: "",
          size: "",
          category: "small",
          price: "",
          isActive: true,
        });
      },
    });

  const { mutateAsync: createSubcategory, isPending: creatingSub } =
    useMutation({
      mutationFn: async (payload: {
        value: string;
        pieceValue: number;
        category: SubcategoryCategory;
        productId: number;
      }) => {
        return productService.createSubcategory(payload);
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["subcategories"] });
        setShowCreateSub(false);
        setSubForm({ value: "", pieceValue: "", category: "small" });
      },
    });

  const { mutateAsync: updateProduct, isPending: updatingProduct } =
    useMutation({
      mutationFn: async ({
        id,
        payload,
      }: {
        id: number;
        payload: {
          name?: string;
          size?: string;
          category?: SubcategoryCategory;
          price?: number;
          isActive?: boolean;
        };
      }) => {
        return productService.updateProduct(id, payload);
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["products"] });
        setShowEditProduct(false);
        setEditingProduct(null);
      },
    });

  const { mutateAsync: deleteProduct, isPending: deletingProduct } =
    useMutation({
      mutationFn: async (id: number) => {
        return productService.deleteProduct(id);
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["products"] });
        setShowDeleteConfirm(false);
        setDeletingItem(null);
        if (selectedProduct?.id === deletingItem?.id) {
          setSelectedProduct(null);
        }
      },
    });

  const { mutateAsync: updateSubcategory, isPending: updatingSub } =
    useMutation({
      mutationFn: async ({
        id,
        payload,
      }: {
        id: number;
        payload: {
          value?: string;
          pieceValue?: number;
          category?: SubcategoryCategory;
          isActive?: boolean;
          activationDate?: string;
          expiryDate?: string;
        };
      }) => {
        return productService.updateSubcategory(id, payload);
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["subcategories"] });
        setShowEditSub(false);
        setEditingSub(null);
      },
    });

  const { mutateAsync: deleteSubcategory, isPending: deletingSub } =
    useMutation({
      mutationFn: async (id: number) => {
        return productService.deleteSubcategory(id);
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["subcategories"] });
        setShowDeleteConfirm(false);
        setDeletingItem(null);
      },
    });

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      size: product.size || "",
      category: "small", // Default since Product interface doesn't have category
      price: product.price?.toString() || "",
      isActive: product.isActive,
    });
    setShowEditProduct(true);
  };

  const handleEditSub = (sub: Subcategory) => {
    setEditingSub(sub);
    setSubForm({
      value: sub.value,
      pieceValue: sub.pieceValue.toString(),
      category: sub.category,
    });
    setShowEditSub(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingItem({
      type: "product",
      id: product.id,
      name: product.name,
    });
    setShowDeleteConfirm(true);
  };

  const handleDeleteSub = (sub: Subcategory) => {
    setDeletingItem({
      type: "subcategory",
      id: sub.id,
      name: sub.value,
    });
    setShowDeleteConfirm(true);
  };

  const onUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    await updateProduct({
      id: editingProduct.id,
      payload: {
        name: productForm.name,
        size: productForm.size,
        category: productForm.category,
        price: productForm.price ? Number(productForm.price) : undefined,
        isActive: productForm.isActive,
      },
    });
  };

  const onUpdateSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;

    await updateSubcategory({
      id: editingSub.id,
      payload: {
        value: subForm.value,
        pieceValue: Number(subForm.pieceValue),
        category: subForm.category,
      },
    });
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    if (deletingItem.type === "product") {
      await deleteProduct(deletingItem.id);
    } else {
      await deleteSubcategory(deletingItem.id);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProduct({
      name: productForm.name.trim(),
      size: productForm.size.trim(),
      category: productForm.category,
      price: productForm.price ? Number(productForm.price) : undefined,
      isActive: productForm.isActive,
    });
  };

  const onCreateSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    await createSubcategory({
      productId: selectedProduct.id,
      value: subForm.value.trim(),
      pieceValue: subForm.pieceValue ? Number(subForm.pieceValue) : undefined,
      category: subForm.category,
    });
  };

  const clearSearch = () => {
    setSearch("");
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    // On mobile, switch to subcategories tab when product is selected
    if (window.innerWidth < 768) {
      setActiveTab("subcategories");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 px-4 sm:py-6 sm:px-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Products & Subcategories
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Manage your product catalog and pricing
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCreateProduct(true)}
              className="flex items-center gap-2"
              size="lg"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="sm:hidden">
          <div className="bg-card rounded-lg border border-border p-1">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setActiveTab("products")}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "products"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Package className="h-4 w-4" />
                Products ({filteredProducts.length})
              </button>
              <button
                onClick={() => setActiveTab("subcategories")}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "subcategories"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                Subcategories
                {selectedProduct && (
                  <span className="bg-primary-foreground text-primary text-xs px-1.5 py-0.5 rounded-full">
                    {subcategoriesForSelected.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search products..."
              className="h-12 w-full rounded-lg border border-border bg-background pl-10 pr-10 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content - Desktop Side-by-Side, Mobile Tabbed */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Products Section */}
          <div
            className={`space-y-4 ${activeTab === "subcategories" ? "hidden sm:block" : ""}`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                Products ({filteredProducts.length})
              </h2>
              <Button
                onClick={() => setShowCreateProduct(true)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>

            <div className="bg-card rounded-lg border border-border">
              {loadingProducts ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-muted rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length ? (
                <div className="max-h-[600px] overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`p-4 border-b border-border last:border-b-0 cursor-pointer transition-colors ${
                        selectedProduct?.id === product.id
                          ? "bg-primary/5 border-l-4 border-l-primary"
                          : "hover:bg-accent/20"
                      }`}
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground truncate">
                                {product.name}
                              </h3>
                              {selectedProduct?.id === product.id && (
                                <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              {product.size && (
                                <div className="flex items-center gap-1">
                                  <span className="truncate">
                                    {product.size}
                                  </span>
                                </div>
                              )}
                              {product.price && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span>
                                    ₹{Number(product.price).toFixed(2)}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                <span className="text-xs">
                                  {product.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProduct(product);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProduct(product);
                            }}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {search ? "No products found" : "No products yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    {search
                      ? "Try adjusting your search terms"
                      : "Get started by creating your first product"}
                  </p>
                  {!search && (
                    <Button onClick={() => setShowCreateProduct(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Product
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Subcategories Section */}
          <div
            className={`space-y-4 ${activeTab === "products" ? "hidden sm:block" : ""}`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                Subcategories
                {selectedProduct && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    for {selectedProduct.name}
                  </span>
                )}
              </h2>
              {selectedProduct && (
                <Button
                  onClick={() => setShowCreateSub(true)}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Subcategory
                </Button>
              )}
            </div>

            <div className="bg-card rounded-lg border border-border">
              {!selectedProduct ? (
                <div className="p-8 text-center">
                  <Grid3X3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Select a Product
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Choose a product from the list to view and manage its
                    subcategories
                  </p>
                </div>
              ) : (
                <div className="p-4">
                  {/* Selected Product Info */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-accent/20 rounded-lg">
                    <Package className="h-4 w-4 text-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {selectedProduct.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedProduct.size}
                        {selectedProduct.price &&
                          ` • ₹${Number(selectedProduct.price).toFixed(2)}`}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProduct(selectedProduct)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Subcategories List */}
                  {loadingSubs ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 bg-muted rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : subcategoriesForSelected.length ? (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {subcategoriesForSelected.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/20 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                              <Tag className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground truncate">
                                {sub.value}
                              </div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {sub.category}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <div className="text-right">
                              <div className="font-semibold text-foreground">
                                ₹{Number(sub.pieceValue).toFixed(2)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                per piece
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSub(sub)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSub(sub)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Grid3X3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-4">
                        No subcategories for this product
                      </p>
                      <Button onClick={() => setShowCreateSub(true)} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Subcategory
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Product Modal */}
      {showCreateProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card rounded-lg border border-border shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border sticky top-0 bg-card">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                Create New Product
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateProduct(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={onSubmit} className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Product Name
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Enter product name"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Size
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Enter size (optional)"
                  value={productForm.size}
                  onChange={(e) =>
                    setProductForm({ ...productForm, size: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Category
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Base Price (₹)
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Enter base price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={productForm.isActive}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      isActive: e.target.checked,
                    })
                  }
                  className="rounded border-border h-4 w-4"
                />
                <label htmlFor="isActive" className="text-sm text-foreground">
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateProduct(false)}
                  className="flex-1 h-12"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creatingProduct}
                  className="flex-1 h-12"
                >
                  {creatingProduct ? "Creating..." : "Create Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Subcategory Modal */}
      {showCreateSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card rounded-lg border border-border shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border sticky top-0 bg-card">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                Create New Subcategory
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateSub(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={onCreateSub} className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Subcategory Name
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Enter subcategory name"
                  value={subForm.value}
                  onChange={(e) =>
                    setSubForm({ ...subForm, value: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Piece Value (₹)
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Enter piece value"
                  type="number"
                  step="0.01"
                  value={subForm.pieceValue}
                  onChange={(e) =>
                    setSubForm({ ...subForm, pieceValue: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Category
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateSub(false)}
                  className="flex-1 h-12"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creatingSub}
                  className="flex-1 h-12"
                >
                  {creatingSub ? "Creating..." : "Create Subcategory"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card rounded-lg border border-border shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border sticky top-0 bg-card">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                Edit Product
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditProduct(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={onUpdateProduct} className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Product Name
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Enter product name"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Size
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Enter size (optional)"
                  value={productForm.size}
                  onChange={(e) =>
                    setProductForm({ ...productForm, size: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Category
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Base Price (₹)
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Enter base price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={productForm.isActive}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      isActive: e.target.checked,
                    })
                  }
                  className="rounded border-border h-4 w-4"
                />
                <label
                  htmlFor="editIsActive"
                  className="text-sm text-foreground"
                >
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditProduct(false)}
                  className="flex-1 h-12"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updatingProduct}
                  className="flex-1 h-12"
                >
                  {updatingProduct ? "Updating..." : "Update Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subcategory Modal */}
      {showEditSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card rounded-lg border border-border shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border sticky top-0 bg-card">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                Edit Subcategory
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditSub(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={onUpdateSub} className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Subcategory Name
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Enter subcategory name"
                  value={subForm.value}
                  onChange={(e) =>
                    setSubForm({ ...subForm, value: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Piece Value (₹)
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Enter piece value"
                  type="number"
                  step="0.01"
                  value={subForm.pieceValue}
                  onChange={(e) =>
                    setSubForm({ ...subForm, pieceValue: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Category
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditSub(false)}
                  className="flex-1 h-12"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updatingSub}
                  className="flex-1 h-12"
                >
                  {updatingSub ? "Updating..." : "Update Subcategory"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card rounded-lg border border-border shadow-lg">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Confirm Delete
              </h2>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete{" "}
                <span className="font-medium text-foreground">
                  {deletingItem?.name}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-12"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  disabled={deletingProduct || deletingSub}
                  className="flex-1 h-12 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deletingProduct || deletingSub ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
