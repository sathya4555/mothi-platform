import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  purchaseService,
  type PurchaseListItem,
} from "@/services/purchase.service";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const PRESET_KEY = "purchases_filters_default";
const COL_WIDTHS_KEY = "purchases_table_col_widths";

function useSearchParamsState() {
  const navigate = useNavigate();
  const { search, pathname } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const get = (k: string) => params.get(k) || "";
  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    navigate({ pathname, search: next.toString() }, { replace: true });
  };
  const setMany = (entries: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(entries).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    navigate({ pathname, search: next.toString() }, { replace: true });
  };
  return { get, set, setMany, all: params };
}

const statusOptions: { key: string; label: string }[] = [
  { key: "", label: "All" },
  { key: "confirmation_pending", label: "Confirmation" },
  { key: "processing", label: "Processing" },
  { key: "payment_pending", label: "Payment" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    confirmation_pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    payment_pending: "bg-orange-100 text-orange-800",
    completed: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-800",
  };
  const cls = map[status] || "bg-slate-100 text-slate-800";
  const label =
    status === "confirmation_pending" ? "Pending" : status.replace("_", " ");
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
};

const PurchasesListPage: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrCoord = user?.role === "admin" || user?.role === "coordinator";
  const { get, set, setMany } = useSearchParamsState();

  const status = get("status");
  const partyName = get("partyName");
  const dateFrom = get("dateFrom");
  const dateTo = get("dateTo");
  const sort = get("sort") || "desc";
  const salesType = get("salesType");
  const agentId = get("agentId");

  // Mobile filters state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  // Added: copied indicator for uniqueId
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(value);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {}
  };
  const shortId = (id: string) =>
    id.length > 14 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;

  // Load saved presets on first mount if no filters in URL
  useEffect(() => {
    const hasAny = !!(
      status ||
      partyName ||
      dateFrom ||
      dateTo ||
      salesType ||
      agentId
    );
    if (hasAny) return;
    const saved = localStorage.getItem(PRESET_KEY);
    if (!saved) return;
    try {
      const preset = JSON.parse(saved) as Record<string, string>;
      setMany(preset);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isLoading, isError } = useQuery<PurchaseListItem[]>({
    queryKey: [
      "purchases",
      { status, partyName, dateFrom, dateTo, sort, salesType, agentId },
    ],
    queryFn: () =>
      purchaseService.list({
        status,
        partyName,
        dateFrom,
        dateTo,
        sort,
        salesType,
        agentId: agentId || undefined,
      }),
  });

  const isOverdue = (invoiceDate?: string) => {
    if (!invoiceDate) return false;
    const d = new Date(invoiceDate);
    const diff = Date.now() - d.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days >= 7;
  };

  // CSV Export
  const exportCSV = () => {
    const rows = (data || []).map((p) => ({
      invoiceDate: p.invoiceDate || "",
      party: p.party?.name || "",
      salesType: p.salesType,
      uniqueId: p.uniqueId,
      finalAmount: String(p.finalAmount),
      status: p.status,
    }));
    const header = [
      "Invoice Date",
      "Party",
      "Sales Type",
      "Unique ID",
      "Final Amount",
      "Status",
    ];
    const csv = [
      header,
      ...rows.map((r) => [
        r.invoiceDate,
        r.party,
        r.salesType,
        r.uniqueId,
        r.finalAmount,
        r.status,
      ]),
    ]
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purchases_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Column resizing
  const initialWidths = useMemo<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(COL_WIDTHS_KEY);
      return saved
        ? JSON.parse(saved)
        : {
            invoiceDate: 140,
            party: 180,
            salesType: 120,
            uniqueId: 180,
            finalAmount: 140,
            status: 140,
            actions: 120,
          };
    } catch {
      return {
        invoiceDate: 140,
        party: 180,
        salesType: 120,
        uniqueId: 180,
        finalAmount: 140,
        status: 140,
        actions: 120,
      };
    }
  }, []);
  const [colWidths, setColWidths] =
    useState<Record<string, number>>(initialWidths);
  const dragging = useRef<{
    key: string;
    startX: number;
    startW: number;
  } | null>(null);

  const startDrag = (key: string, e: React.MouseEvent<HTMLDivElement>) => {
    dragging.current = { key, startX: e.clientX, startW: colWidths[key] };
    window.addEventListener("mousemove", onDrag as any);
    window.addEventListener("mouseup", endDrag as any, { once: true });
  };
  const onDrag = (e: MouseEvent) => {
    const d = dragging.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const next = Math.max(90, d.startW + dx);
    setColWidths((prev) => ({ ...prev, [d.key]: next }));
  };
  const endDrag = () => {
    window.removeEventListener("mousemove", onDrag as any);
    const d = dragging.current;
    dragging.current = null;
    try {
      localStorage.setItem(COL_WIDTHS_KEY, JSON.stringify(colWidths));
    } catch {}
  };

  const savePreset = () => {
    const preset = {
      status,
      partyName,
      dateFrom,
      dateTo,
      sort,
      salesType,
      agentId,
    };
    localStorage.setItem(PRESET_KEY, JSON.stringify(preset));
  };
  const clearPreset = () => {
    localStorage.removeItem(PRESET_KEY);
  };

  return (
    <div className="min-h-screen">
      <div className="container py-6 space-y-6">
        {/* Title + Primary action */}
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Purchases</h1>
            <p className="text-sm text-muted-foreground">
              Track orders with clarity and focus.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportCSV}>
              Export CSV
            </Button>
            <Button asChild>
              <Link to="/purchases/new">Create Purchase</Link>
            </Button>
          </div>
        </header>

        {/* Segmented status control + filters (sticky) */}
        <div className="hidden md:block md:sticky md:top-16 md:z-20">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/60 p-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => set("status", opt.key)}
                className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                  (status || "") === opt.key
                    ? "bg-foreground text-background"
                    : "bg-background text-foreground hover:bg-accent"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <input
                className="h-10 w-48 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 ring-ring"
                placeholder="Search party"
                value={partyName}
                onChange={(e) => set("partyName", e.target.value)}
              />
              <select
                className="h-10 w-40 rounded-lg border border-border bg-background px-3 text-sm"
                value={salesType}
                onChange={(e) => set("salesType", e.target.value)}
              >
                <option value="">All types</option>
                <option value="small">Small</option>
                <option value="big">Big</option>
                <option value="king">King</option>
              </select>
              <input
                className="h-10 w-40 rounded-lg border border-border bg-background px-3 text-sm"
                type="date"
                value={dateFrom}
                onChange={(e) => set("dateFrom", e.target.value)}
              />
              <input
                className="h-10 w-40 rounded-lg border border-border bg-background px-3 text-sm"
                type="date"
                value={dateTo}
                onChange={(e) => set("dateTo", e.target.value)}
              />
              <select
                className="h-10 w-36 rounded-lg border border-border bg-background px-3 text-sm"
                value={sort}
                onChange={(e) => set("sort", e.target.value)}
              >
                <option value="desc">Newest</option>
                <option value="asc">Oldest</option>
              </select>
              {isAdminOrCoord && (
                <input
                  className="h-10 w-36 rounded-lg border border-border bg-background px-3 text-sm"
                  placeholder="Agent ID"
                  value={agentId}
                  onChange={(e) => set("agentId", e.target.value)}
                />
              )}
              <Button variant="outline" onClick={savePreset}>
                Save Preset
              </Button>
              <Button variant="ghost" onClick={clearPreset}>
                Clear Preset
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden grid gap-4">
          {/* Mobile status dropdown + Filters button */}
          <div className="-mx-4 px-4">
            <div className="flex items-center gap-2 py-1">
              <select
                className="h-11 flex-1 rounded-xl border border-border bg-background px-3 text-base"
                value={status}
                onChange={(e) => set("status", e.target.value)}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={() => setMobileFiltersOpen(true)}
              >
                Filters
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="rounded-xl border border-border p-4">
              Loading...
            </div>
          )}
          {isError && (
            <div className="rounded-xl border border-border p-4 text-red-600">
              Failed to load purchases
            </div>
          )}
          {data?.length
            ? data.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-4 shadow-sm ${isOverdue(p.invoiceDate) ? "border-red-400" : "border-border"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold tracking-tight max-w-[70%]">
                      <button
                        type="button"
                        title="Click to copy"
                        onClick={() => copyToClipboard(p.uniqueId)}
                        className="font-mono text-sm hover:underline"
                      >
                        {shortId(p.uniqueId)}
                      </button>
                      {copiedId === p.uniqueId && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          Copied
                        </span>
                      )}
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground capitalize">
                    {p.salesType} • {p.party?.name || ""}
                  </div>
                  <div className="mt-1 text-sm">
                    ₹ {Number(p.finalAmount).toFixed(2)}
                  </div>
                  <div className="mt-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/purchases/${p.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))
            : !isLoading &&
              !isError && (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No purchases yet.
                </div>
              )}

          {/* Mobile Filters Sheet */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border border-border bg-background p-4 space-y-4">
                <div className="mx-auto h-1 w-10 rounded bg-border" />
                <div className="grid gap-3">
                  <input
                    className="h-12 w-full rounded-xl border border-border bg-background px-3 text-base outline-none focus:ring-2 ring-ring"
                    placeholder="Search party"
                    value={partyName}
                    onChange={(e) => set("partyName", e.target.value)}
                  />
                  <select
                    className="h-12 w-full rounded-xl border border-border bg-background px-3 text-base"
                    value={salesType}
                    onChange={(e) => set("salesType", e.target.value)}
                  >
                    <option value="">All types</option>
                    <option value="small">Small</option>
                    <option value="big">Big</option>
                    <option value="king">King</option>
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="h-12 rounded-xl border border-border bg-background px-3 text-base"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => set("dateFrom", e.target.value)}
                    />
                    <input
                      className="h-12 rounded-xl border border-border bg-background px-3 text-base"
                      type="date"
                      value={dateTo}
                      onChange={(e) => set("dateTo", e.target.value)}
                    />
                  </div>
                  <select
                    className="h-12 w-full rounded-xl border border-border bg-background px-3 text-base"
                    value={sort}
                    onChange={(e) => set("sort", e.target.value)}
                  >
                    <option value="desc">Newest</option>
                    <option value="asc">Oldest</option>
                  </select>
                  {isAdminOrCoord && (
                    <input
                      className="h-12 w-full rounded-xl border border-border bg-background px-3 text-base"
                      placeholder="Agent ID"
                      value={agentId}
                      onChange={(e) => set("agentId", e.target.value)}
                    />
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    Close
                  </Button>
                  <Button onClick={() => setMobileFiltersOpen(false)}>
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop table with sticky header and resizable columns */}
        <div className="hidden md:block overflow-auto rounded-2xl border border-border bg-card/60">
          <table className="w-full text-sm table-fixed">
            <thead className="sticky top-0 z-10 bg-background/80 backdrop-blur">
              <tr className="text-muted-foreground">
                {[
                  { key: "invoiceDate", label: "Invoice Date" },
                  { key: "party", label: "Party" },
                  { key: "salesType", label: "Sales Type" },
                  { key: "uniqueId", label: "Unique ID" },
                  { key: "finalAmount", label: "Final Amount" },
                  { key: "status", label: "Status" },
                  { key: "actions", label: "Actions" },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="relative px-5 py-3 text-left align-bottom"
                    style={{ width: colWidths[col.key] }}
                  >
                    <div className="pr-3 select-none">{col.label}</div>
                    <div
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-foreground/20"
                      onMouseDown={(e) => startDrag(col.key, e)}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="px-5 py-6" colSpan={7}>
                    Loading...
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td className="px-5 py-6 text-red-600" colSpan={7}>
                    Failed to load purchases
                  </td>
                </tr>
              )}
              {data?.length
                ? data.map((p, i) => (
                    <tr
                      key={p.id}
                      className={`${i % 2 === 0 ? "bg-background/30" : "bg-transparent"} ${isOverdue(p.invoiceDate) ? "bg-red-50" : ""}`}
                    >
                      <td
                        className="px-5 py-3"
                        style={{ width: colWidths.invoiceDate }}
                      >
                        {p.invoiceDate
                          ? new Date(p.invoiceDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td
                        className="px-5 py-3"
                        style={{ width: colWidths.party }}
                      >
                        {p.party?.name || ""}
                      </td>
                      <td
                        className="px-5 py-3 capitalize"
                        style={{ width: colWidths.salesType }}
                      >
                        {p.salesType}
                      </td>
                      <td
                        className="px-5 py-3 font-medium tracking-tight"
                        style={{ width: colWidths.uniqueId }}
                      >
                        <div className="max-w-[180px] truncate">
                          <button
                            type="button"
                            title="Click to copy"
                            onClick={() => copyToClipboard(p.uniqueId)}
                            className="truncate hover:underline text-left"
                          >
                            {p.uniqueId}
                          </button>
                          {copiedId === p.uniqueId && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              Copied
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        className="px-5 py-3"
                        style={{ width: colWidths.finalAmount }}
                      >
                        ₹ {Number(p.finalAmount).toFixed(2)}
                      </td>
                      <td
                        className="px-5 py-3"
                        style={{ width: colWidths.status }}
                      >
                        <StatusBadge status={p.status} />
                      </td>
                      <td
                        className="px-5 py-3"
                        style={{ width: colWidths.actions }}
                      >
                        <Button variant="outline" asChild>
                          <Link to={`/purchases/${p.id}`}>View</Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                : !isLoading &&
                  !isError && (
                    <tr>
                      <td
                        className="px-5 py-10 text-center text-muted-foreground"
                        colSpan={7}
                      >
                        No purchases found
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchasesListPage;
