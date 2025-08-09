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

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

const inputBase =
  "h-11 rounded-xl border border-border bg-background px-3.5 text-[15px] outline-none focus:ring-2 ring-ring transition";
const selectBase = inputBase;

const generateUniqueId = (): string => {
  try {
    // Prefer secure browser UUID
    if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
      return (crypto as any).randomUUID();
    }
  } catch {}
  // Fallback RFC4122 v4 polyfill
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
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Header */}
      <div className="border-b border-border bg-background/60 backdrop-blur">
        <div className="container py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Create Purchase
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Delightfully fast. Thoughtfully simple.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/purchases">Back</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6 grid gap-8 lg:grid-cols-12">
        {/* Left: Form */}
        <form onSubmit={onSubmit} className="lg:col-span-8 space-y-8">
          {/* Card: Party & Meta */}
          <div className="rounded-2xl border border-border bg-card/60 p-5 sm:p-7 shadow-md shadow-black/5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 relative">
                <label className="sr-only">Party</label>
                <div className="relative">
                  <input
                    className="peer h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[15px] outline-none focus:ring-2 ring-ring transition"
                    placeholder="Search or select a party"
                    value={partyQuery}
                    onChange={(e) => setPartyQuery(e.target.value)}
                    onFocus={() => setPartyOpen(true)}
                    onBlur={() => setTimeout(() => setPartyOpen(false), 150)}
                  />
                </div>
                {partyOpen && (
                  <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-border bg-background shadow-sm">
                    {parties && parties.length > 0 ? (
                      parties.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setForm({ ...form, partyId: p.id });
                            setPartyQuery(`${p.name} (${p.gstNumber})`);
                            setPartyOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${form.partyId === p.id ? "bg-accent/40" : ""}`}
                        >
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">
                            GST: {p.gstNumber}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No matches
                      </div>
                    )}
                  </div>
                )}
                {form.partyId ? (
                  <div className="text-xs text-muted-foreground">
                    Selected party ID: {form.partyId}
                  </div>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sales Type</label>
                <select
                  className={selectBase}
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
              {/* Unique ID is auto-generated and not shown to the user */}
              <div className="space-y-2">
                <label className="sr-only">Destination</label>
                <div className="relative">
                  <input
                    className="peer h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[15px] outline-none focus:ring-2 ring-ring transition placeholder-transparent"
                    placeholder=" "
                    value={form.destination || ""}
                    onChange={(e) =>
                      setForm({ ...form, destination: e.target.value })
                    }
                  />
                  <span className="pointer-events-none absolute left-3.5 -top-2 bg-background px-1 rounded text-xs text-muted-foreground">
                    Destination (optional)
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="sr-only">Transport</label>
                <div className="relative">
                  <input
                    className="peer h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[15px] outline-none focus:ring-2 ring-ring transition placeholder-transparent"
                    placeholder=" "
                    value={form.transport || ""}
                    onChange={(e) =>
                      setForm({ ...form, transport: e.target.value })
                    }
                  />
                  <span className="pointer-events-none absolute left-3.5 -top-2 bg-background px-1 rounded text-xs text-muted-foreground">
                    Transport (optional)
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="sr-only">Overall Discount %</label>
                <div className="relative">
                  <input
                    className="peer h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[15px] outline-none focus:ring-2 ring-ring transition placeholder-transparent"
                    type="number"
                    min={0}
                    max={100}
                    placeholder=" "
                    value={form.discount || 0}
                    onChange={(e) =>
                      setForm({ ...form, discount: Number(e.target.value) })
                    }
                  />
                  <span className="pointer-events-none absolute left-3.5 -top-2 bg-background px-1 rounded text-xs text-muted-foreground">
                    Overall Discount %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Items */}
          <div className="rounded-2xl border border-border bg-card/60 p-5 sm:p-7 shadow-md shadow-black/5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Items</h2>
                <p className="text-sm text-muted-foreground">
                  Choose product and subcategory. Price auto-fills from
                  subcategory.
                </p>
              </div>
              <Button type="button" onClick={addItem}>
                Add Item
              </Button>
            </div>

            <div className="mt-5 grid gap-4">
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
                    className="rounded-xl border border-border bg-background/70 p-4 shadow-sm"
                  >
                    {/* Row 1: Product + Subcategory comboboxes */}
                    <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                      <div className="relative min-w-0">
                        <label className="sr-only">Product</label>
                        <input
                          className="peer h-11 w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 ring-ring transition"
                          placeholder="Search or select a product"
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
                          <div className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-border bg-background shadow-sm">
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
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                >
                                  <div className="font-medium">{p.name}</div>
                                  {p.size ? (
                                    <div className="text-xs text-muted-foreground">
                                      {p.size}
                                    </div>
                                  ) : null}
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-muted-foreground">
                                No matches
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="relative min-w-0">
                        <label className="sr-only">Subcategory</label>
                        <input
                          className="peer h-11 w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 ring-ring transition"
                          placeholder="Search or select a subcategory"
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
                          <div className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-border bg-background shadow-sm">
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
                                              unitPrice: Number(s.pieceValue),
                                            }
                                          : row
                                      ),
                                    }));
                                    setSubQueryByIdx((prev) => ({
                                      ...prev,
                                      [idx]: `${s.value} • ₹ ${Number(s.pieceValue).toFixed(2)}`,
                                    }));
                                    setSubOpenIdx(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                >
                                  <div className="font-medium">{s.value}</div>
                                  <div className="text-xs text-muted-foreground">
                                    ₹ {Number(s.pieceValue).toFixed(2)}
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-muted-foreground">
                                No matches
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Simple numeric inputs */}
                    <div className="mt-3 grid gap-3 grid-cols-1 lg:grid-cols-12">
                      <div className="relative min-w-0 lg:col-span-3">
                        <label className="sr-only">Quantity</label>
                        <input
                          className="peer h-11 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 ring-ring transition placeholder-transparent"
                          type="number"
                          min={1}
                          placeholder=" "
                          value={it.quantity || 1}
                          onChange={(e) =>
                            updateItem(setForm, idx, {
                              quantity: Number(e.target.value),
                            })
                          }
                        />
                        <span className="pointer-events-none absolute left-3 -top-2 bg-background px-1 rounded text-xs text-muted-foreground transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-[15px] peer-placeholder-shown:bg-transparent peer-focus:-top-2 peer-focus:bg-background peer-focus:text-foreground">
                          Quantity
                        </span>
                      </div>
                      <div className="relative min-w-0 lg:col-span-3">
                        <label className="sr-only">Quantity Type</label>
                        <select
                          className="peer h-11 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 ring-ring transition"
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
                        <span className="pointer-events-none absolute left-3 -top-2 bg-background px-1 rounded text-xs text-muted-foreground">
                          Quantity Type
                        </span>
                      </div>
                      <div className="relative min-w-0 lg:col-span-6">
                        <label className="sr-only">Unit Price</label>
                        <input
                          className="peer h-11 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 ring-ring transition placeholder-transparent"
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder=" "
                          value={it.unitPrice || 0}
                          onChange={(e) =>
                            updateItem(setForm, idx, {
                              unitPrice: Number(e.target.value),
                            })
                          }
                        />
                        <span className="pointer-events-none absolute left-3 -top-2 bg-background px-1 rounded text-xs text-muted-foreground transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-[15px] peer-focus:-top-2 peer-focus:bg-background peer-focus:text-foreground">
                          Unit Price
                        </span>
                      </div>
                      <div className="relative min-w-0 lg:col-span-12">
                        <label className="sr-only">Discount %</label>
                        <input
                          className="peer h-11 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 ring-ring transition placeholder-transparent"
                          type="number"
                          min={0}
                          max={100}
                          placeholder=" "
                          value={it.discount || 0}
                          onChange={(e) =>
                            updateItem(setForm, idx, {
                              discount: Number(e.target.value) || 0,
                            })
                          }
                        />
                        <span className="pointer-events-none absolute left-3 -top-2 bg-background px-1 rounded text-xs text-muted-foreground transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-[15px] peer-placeholder-shown:bg-transparent peer-focus:-top-2 peer-focus:bg-background peer-focus:text-foreground">
                          Discount %
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeItem(idx)}
                      >
                        Remove Item
                      </Button>
                    </div>
                  </div>
                );
              })}
              {form.items.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No items yet. Click “Add Item” to begin.
                </div>
              )}
            </div>
          </div>

          {/* Mobile sticky footer for actions */}
          <div className="lg:hidden sticky bottom-0 inset-x-0 z-10 bg-background/80 backdrop-blur border-t border-border">
            <div className="container py-3 flex items-center justify-between">
              <div className="text-sm">
                <div>Total ₹ {totals.total.toFixed(2)}</div>
                <div className="text-muted-foreground">
                  Final ₹ {totals.final.toFixed(2)}
                </div>
              </div>
              <Button type="submit" disabled={disabledCTA}>
                Create
              </Button>
            </div>
          </div>
        </form>

        {/* Right: Summary card */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-border bg-card/60 p-6 shadow-md shadow-black/5 sticky top-24">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            <div className="mt-3 grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹ {totals.total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">GST (5%)</span>
                <span>₹ {totals.gst.toFixed(2)}</span>
              </div>
              <div className="h-px bg-border my-1" />
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Final</span>
                <span>₹ {totals.final.toFixed(2)}</span>
              </div>
            </div>
            <Button
              className="w-full mt-5 h-11 text-[15px]"
              onClick={onSubmit as any}
              disabled={disabledCTA}
            >
              Create Purchase
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Dates are applied automatically.
            </p>
          </div>
        </aside>
      </div>

      {/* Success Modal */}
      {successState.open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white shadow-xl">
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7 text-emerald-600"
                    fill="currentColor"
                  >
                    <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm4.707 8.293-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 1 1 1.414-1.414L11 13.586l4.293-4.293a1 1 0 0 1 1.414 1.414Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-emerald-700">
                  Purchase Created
                </h3>
                <p className="mt-1 text-sm text-emerald-700/80">
                  Status is <span className="font-medium">Pending</span> until
                  reviewed by a coordinator or admin.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                    className="h-11 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => {
                      setSuccessState({ open: false, id: undefined });
                      // Soft reset form for a new entry with a fresh UUID
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
                <button
                  type="button"
                  className="mt-3 inline-flex text-xs text-emerald-700/70 underline"
                  onClick={() =>
                    setSuccessState({ open: false, id: undefined })
                  }
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-xl">
              <div className="p-6 text-center">
                <h3 className="text-lg font-semibold tracking-tight">
                  Create Purchase?
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Please confirm you want to create this purchase. You can
                  review details after creation.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button
                    variant="ghost"
                    className="h-11"
                    onClick={() => setConfirmOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-11"
                    onClick={async () => {
                      setConfirmOpen(false);
                      await createPurchase(form);
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
