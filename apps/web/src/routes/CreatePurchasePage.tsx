import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  purchaseService,
  type CreatePurchaseInput,
  type QuantityType,
} from "@/services/purchase.service";
import { Link, useNavigate } from "react-router-dom";
import { partyService, type Party } from "@/services/party.service";
import {
  productService,
  type Product,
  type Subcategory,
} from "@/services/product.service";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Search,
  Building2,
  Package,
  Tag,
  DollarSign,
  Calendar,
  Truck,
  MapPin,
  Percent,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  X,
} from "lucide-react";

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

const generateUniqueId = (): string => {
  try {
    if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
      return (crypto as any).randomUUID();
    }
  } catch {}
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const CreatePurchasePage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [partyQuery, setPartyQuery] = useState("");
  const [partyOpen, setPartyOpen] = useState(false);
  const debouncedPartyQuery = useDebounced(partyQuery, 300);

  // Success modal state
  const [successState, setSuccessState] = useState<{
    open: boolean;
    id?: number;
  }>({ open: false, id: undefined });

  // Confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Per-item combobox UI state
  const [productQueryByIdx, setProductQueryByIdx] = useState<
    Record<number, string>
  >({});
  const [productOpenIdx, setProductOpenIdx] = useState<number | null>(null);
  const [subQueryByIdx, setSubQueryByIdx] = useState<Record<number, string>>(
    {}
  );
  const [subOpenIdx, setSubOpenIdx] = useState<number | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState<CreatePurchaseInput>({
    partyId: 0,
    salesType: "small",
    uniqueId: generateUniqueId(),
    destination: "",
    transport: "",
    invoiceDate: today,
    orderPlacedDate: today,
    orderApprovalDate: today,
    discount: 0,
    remarks: "",
    items: [],
  });

  const { data: parties } = useQuery<Party[]>({
    queryKey: ["parties", { search: debouncedPartyQuery }],
    queryFn: () => partyService.list(debouncedPartyQuery || undefined),
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["products", "active"],
    queryFn: () => productService.listActiveProducts(),
  });

  const { data: subcategories } = useQuery<Subcategory[]>({
    queryKey: ["subcategories", "all"],
    queryFn: () => productService.listAllSubcategories(),
  });

  const addItem = () => {
    setForm((f) => ({
      ...f,
      items: [
        ...f.items,
        { productId: 0, quantity: 1, quantityType: "piece", unitPrice: 0 },
      ],
    }));
  };

  const removeItem = (idx: number) => {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const duplicateItem = (idx: number) => {
    setForm((f) => ({
      ...f,
      items: [
        ...f.items.slice(0, idx + 1),
        { ...f.items[idx] },
        ...f.items.slice(idx + 1),
      ],
    }));
  };

  const filteredSubcategories = (productId: number) => {
    const list = subcategories || [];
    return list.filter(
      (s) => s.productId === productId && s.category === form.salesType
    );
  };

  const totals = useMemo(() => {
    let total = 0;
    form.items.forEach((it) => {
      const itemTotal = it.quantity * it.unitPrice;
      const itemDisc = it.discount ? (itemTotal * it.discount) / 100 : 0;
      total += itemTotal - itemDisc;
    });
    if (form.discount) total -= (total * form.discount) / 100;
    const gst = total * 0.05;
    const final = total + gst;
    return { total: round2(total), gst: round2(gst), final: round2(final) };
  }, [form.items, form.discount]);

  const { mutateAsync: createPurchase, isPending } = useMutation({
    mutationFn: (input: CreatePurchaseInput) => purchaseService.create(input),
    onSuccess: (p: any) => {
      qc.invalidateQueries({ queryKey: ["purchases"] });
      setSuccessState({ open: true, id: p?.id });
    },
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.partyId || !form.uniqueId || !form.items.length) return;
    setConfirmOpen(true);
  };

  const disabledCTA =
    isPending || !form.partyId || !form.uniqueId || !form.items.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild className="h-9 w-9 p-0">
                <Link to="/purchases">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
                  Create Purchase
                </h1>
                <p className="text-sm text-muted-foreground">
                  Build your purchase order step by step
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/purchases">View All</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Party Selection Card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Party Details
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Select the party for this purchase
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Party Selection State */}
                  {!form.partyId ? (
                    /* No Party Selected - Show Search Interface */
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          className="h-12 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          placeholder="Search parties by name or GST number..."
                          value={partyQuery}
                          onChange={(e) => setPartyQuery(e.target.value)}
                          onFocus={() => setPartyOpen(true)}
                          onBlur={() =>
                            setTimeout(() => setPartyOpen(false), 150)
                          }
                        />
                      </div>

                      {/* Party Dropdown */}
                      {partyOpen && (
                        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-border bg-card shadow-lg">
                          {parties && parties.length > 0 ? (
                            parties.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setForm({ ...form, partyId: p.id });
                                  setPartyQuery("");
                                  setPartyOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground border-b border-border last:border-b-0"
                              >
                                <div className="font-medium">{p.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  GST: {p.gstNumber}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-muted-foreground">
                              {partyQuery
                                ? "No parties found"
                                : "Start typing to search parties"}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Empty State */}
                      {!partyQuery && !partyOpen && (
                        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <h3 className="text-sm font-medium text-foreground mb-1">
                            No party selected
                          </h3>
                          <p className="text-xs text-muted-foreground mb-4">
                            Search and select a party to continue
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Party Selected - Show Selected Party Info */
                    <div className="space-y-3">
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {
                                  parties?.find((p) => p.id === form.partyId)
                                    ?.name
                                }
                              </div>
                              <div className="text-sm text-muted-foreground">
                                GST:{" "}
                                {
                                  parties?.find((p) => p.id === form.partyId)
                                    ?.gstNumber
                                }
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setForm({ ...form, partyId: 0 });
                                setPartyQuery("");
                              }}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Change Party Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setForm({ ...form, partyId: 0 });
                          setPartyQuery("");
                        }}
                        className="w-full"
                      >
                        Change Party
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase Details Card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Purchase Details
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Configure purchase settings
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Sales Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Sales Type
                    </label>
                    <select
                      className="h-11 w-full rounded-lg border border-border bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={form.salesType}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          salesType: e.target.value as any,
                          items: form.items.map((it) => ({
                            ...it,
                            subcategoryId: undefined,
                          })),
                        })
                      }
                    >
                      <option value="small">Small</option>
                      <option value="big">Big</option>
                      <option value="king">King</option>
                    </select>
                  </div>

                  {/* Overall Discount */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Overall Discount (%)
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        type="number"
                        min={0}
                        max={100}
                        placeholder="0"
                        value={form.discount || 0}
                        onChange={(e) =>
                          setForm({ ...form, discount: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Destination
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        placeholder="Enter destination"
                        value={form.destination || ""}
                        onChange={(e) =>
                          setForm({ ...form, destination: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Transport */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Transport
                    </label>
                    <div className="relative">
                      <Truck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        placeholder="Enter transport details"
                        value={form.transport || ""}
                        onChange={(e) =>
                          setForm({ ...form, transport: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Package className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground">
                        Purchase Items
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {form.items.length} item
                        {form.items.length !== 1 ? "s" : ""} added
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {form.items.map((it, idx) => {
                    const subcats = it.productId
                      ? filteredSubcategories(it.productId)
                      : [];
                    const productQuery = productQueryByIdx[idx] ?? "";
                    const subQuery = subQueryByIdx[idx] ?? "";
                    const filteredProducts = (products || []).filter((p) =>
                      `${p.name}${p.size ? " " + p.size : ""}`
                        .toLowerCase()
                        .includes(productQuery.toLowerCase())
                    );
                    const filteredSubcats = (subcats || []).filter((s) =>
                      s.value.toLowerCase().includes(subQuery.toLowerCase())
                    );

                    return (
                      <div
                        key={idx}
                        className="rounded-lg border border-border bg-background/50 p-4 space-y-4"
                      >
                        {/* Item Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {idx + 1}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              Item {idx + 1}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicateItem(idx)}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(idx)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Product & Subcategory Selection */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          {/* Product Selection */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                              Product
                            </label>
                            <div className="relative">
                              <input
                                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                placeholder="Search products..."
                                value={productQuery}
                                onChange={(e) =>
                                  setProductQueryByIdx((prev) => ({
                                    ...prev,
                                    [idx]: e.target.value,
                                  }))
                                }
                                onFocus={() => setProductOpenIdx(idx)}
                                onBlur={() =>
                                  setTimeout(
                                    () =>
                                      setProductOpenIdx((open) =>
                                        open === idx ? null : open
                                      ),
                                    120
                                  )
                                }
                              />
                              {productOpenIdx === idx && (
                                <div className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-border bg-card shadow-lg">
                                  {filteredProducts.length ? (
                                    filteredProducts.map((p) => (
                                      <button
                                        key={p.id}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => {
                                          setForm((f) => ({
                                            ...f,
                                            items: f.items.map((row, i) =>
                                              i === idx
                                                ? {
                                                    ...row,
                                                    productId: p.id,
                                                    subcategoryId: undefined,
                                                  }
                                                : row
                                            ),
                                          }));
                                          setProductQueryByIdx((prev) => ({
                                            ...prev,
                                            [idx]: `${p.name}${p.size ? " • " + p.size : ""}`,
                                          }));
                                          setProductOpenIdx(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground border-b border-border last:border-b-0"
                                      >
                                        <div className="font-medium">
                                          {p.name}
                                        </div>
                                        {p.size && (
                                          <div className="text-xs text-muted-foreground">
                                            {p.size}
                                          </div>
                                        )}
                                      </button>
                                    ))
                                  ) : (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">
                                      No products found
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Subcategory Selection */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                              Subcategory
                            </label>
                            <div className="relative">
                              <input
                                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                                placeholder="Select subcategory..."
                                value={subQuery}
                                onChange={(e) =>
                                  setSubQueryByIdx((prev) => ({
                                    ...prev,
                                    [idx]: e.target.value,
                                  }))
                                }
                                onFocus={() => setSubOpenIdx(idx)}
                                onBlur={() =>
                                  setTimeout(
                                    () =>
                                      setSubOpenIdx((open) =>
                                        open === idx ? null : open
                                      ),
                                    120
                                  )
                                }
                                disabled={!it.productId}
                              />
                              {subOpenIdx === idx && it.productId && (
                                <div className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-border bg-card shadow-lg">
                                  {filteredSubcats.length ? (
                                    filteredSubcats.map((s) => (
                                      <button
                                        key={s.id}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => {
                                          setForm((f) => ({
                                            ...f,
                                            items: f.items.map((row, i) =>
                                              i === idx
                                                ? {
                                                    ...row,
                                                    subcategoryId: s.id,
                                                    unitPrice: Number(
                                                      s.pieceValue
                                                    ),
                                                  }
                                                : row
                                            ),
                                          }));
                                          setSubQueryByIdx((prev) => ({
                                            ...prev,
                                            [idx]: `${s.value} • ₹${Number(s.pieceValue).toFixed(2)}`,
                                          }));
                                          setSubOpenIdx(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground border-b border-border last:border-b-0"
                                      >
                                        <div className="font-medium">
                                          {s.value}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          ₹{Number(s.pieceValue).toFixed(2)}
                                        </div>
                                      </button>
                                    ))
                                  ) : (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">
                                      No subcategories found
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quantity & Price Details */}
                        <div className="grid gap-4 sm:grid-cols-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                              Quantity
                            </label>
                            <input
                              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              type="number"
                              min={1}
                              placeholder="1"
                              value={it.quantity || 1}
                              onChange={(e) =>
                                updateItem(setForm, idx, {
                                  quantity: Number(e.target.value),
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                              Type
                            </label>
                            <select
                              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              value={it.quantityType}
                              onChange={(e) =>
                                updateItem(setForm, idx, {
                                  quantityType: e.target.value as QuantityType,
                                })
                              }
                            >
                              <option value="piece">Piece</option>
                              <option value="bale">Bale</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                              Unit Price
                            </label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <input
                                className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                type="number"
                                min={0}
                                step={0.01}
                                placeholder="0.00"
                                value={it.unitPrice || 0}
                                onChange={(e) =>
                                  updateItem(setForm, idx, {
                                    unitPrice: Number(e.target.value),
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                              Discount %
                            </label>
                            <div className="relative">
                              <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <input
                                className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-base outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                type="number"
                                min={0}
                                max={100}
                                placeholder="0"
                                value={it.discount || 0}
                                onChange={(e) =>
                                  updateItem(setForm, idx, {
                                    discount: Number(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                          <span className="text-sm font-medium text-foreground">
                            Item Total
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            ₹
                            {(
                              (it.quantity || 1) *
                              (it.unitPrice || 0) *
                              (1 - (it.discount || 0) / 100)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {form.items.length === 0 && (
                    <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No items added
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Start building your purchase order by adding items
                      </p>
                      <Button type="button" onClick={addItem}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Item
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Right: Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Order Summary */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      ₹{totals.total.toFixed(2)}
                    </span>
                  </div>

                  {form.discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Discount ({form.discount}%)
                      </span>
                      <span className="font-medium text-green-600">
                        -₹{((totals.total * form.discount) / 100).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">GST (5%)</span>
                    <span className="font-medium">
                      ₹{totals.gst.toFixed(2)}
                    </span>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="flex items-center justify-between text-base font-semibold">
                    <span>Final Total</span>
                    <span className="text-lg">₹{totals.final.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 h-12"
                  onClick={onSubmit as any}
                  disabled={disabledCTA}
                >
                  {isPending ? "Creating..." : "Create Purchase"}
                </Button>

                <p className="mt-3 text-xs text-muted-foreground text-center">
                  Purchase will be created with status "Pending"
                </p>
              </div>

              {/* Quick Actions */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h4 className="font-medium text-foreground mb-3">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={addItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to="/parties">
                      <Building2 className="h-4 w-4 mr-2" />
                      Manage Parties
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to="/products">
                      <Package className="h-4 w-4 mr-2" />
                      Manage Products
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successState.open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-xl border border-emerald-200 bg-card shadow-xl">
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
                  <CheckCircle className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Purchase Created Successfully!
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your purchase order has been created with status{" "}
                  <span className="font-medium text-amber-600">Pending</span>.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-3">
                  <Button
                    className="h-11 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      const id = successState.id;
                      setSuccessState({ open: false, id });
                      if (id) navigate(`/purchases/${id}`);
                    }}
                  >
                    View Purchase
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11"
                    onClick={() => {
                      setSuccessState({ open: false, id: undefined });
                      setForm((f) => ({
                        ...f,
                        uniqueId: generateUniqueId(),
                        destination: "",
                        transport: "",
                        discount: 0,
                        remarks: "",
                        items: [],
                      }));
                    }}
                  >
                    Create Another
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-200">
                  <AlertCircle className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Confirm Purchase Creation
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please review your purchase details before creating. You can
                  edit after creation.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-3">
                  <Button
                    className="h-11"
                    onClick={async () => {
                      setConfirmOpen(false);
                      await createPurchase(form);
                    }}
                  >
                    Yes, Create Purchase
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11"
                    onClick={() => setConfirmOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function updateItem(
  setForm: React.Dispatch<React.SetStateAction<CreatePurchaseInput>>,
  idx: number,
  changes: any
) {
  setForm((f) => ({
    ...f,
    items: f.items.map((it, i) => (i === idx ? { ...it, ...changes } : it)),
  }));
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default CreatePurchasePage;
