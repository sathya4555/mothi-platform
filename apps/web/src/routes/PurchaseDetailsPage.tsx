import React from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  purchaseService,
  type PurchaseStatus,
} from "@/services/purchase.service";
import { useAuth } from "@/context/AuthContext";

const PurchaseDetailsPage: React.FC = () => {
  const { id } = useParams();
  const purchaseId = Number(id);
  const qc = useQueryClient();
  const { user } = useAuth();
  const isAdminOrCoord = user?.role === "admin" || user?.role === "coordinator";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["purchase", purchaseId],
    queryFn: () => purchaseService.getById(purchaseId),
    enabled: Number.isFinite(purchaseId),
  });

  const { mutateAsync: setStatus, isPending: statusPending } = useMutation({
    mutationFn: (status: PurchaseStatus) =>
      purchaseService.updateStatus(purchaseId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase", purchaseId] });
      qc.invalidateQueries({ queryKey: ["purchases"] });
    },
  });

  const { mutateAsync: genInvoice, isPending: invoicePending } = useMutation({
    mutationFn: () => purchaseService.generateInvoice(purchaseId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["purchase", purchaseId] }),
  });

  if (!Number.isFinite(purchaseId))
    return <div className="p-6">Invalid ID</div>;
  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError)
    return <div className="p-6 text-red-600">Failed to load purchase</div>;

  const p = data;

  return (
    <div className="min-h-screen">
      <div className="container py-6 space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Purchase {p.uniqueId}</h1>
            <div className="text-sm text-muted-foreground capitalize">
              {p.status.replace("_", " ")} • {p.party?.name || ""}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdminOrCoord ? (
              <>
                <Button
                  disabled={statusPending}
                  onClick={() => setStatus("processing")}
                >
                  Mark Processing
                </Button>
                <Button
                  disabled={statusPending}
                  onClick={() => setStatus("payment_pending")}
                >
                  Mark Payment Pending
                </Button>
                <Button
                  disabled={statusPending}
                  onClick={() => setStatus("completed")}
                >
                  Mark Completed
                </Button>
                {!p.invoiceNumber && (
                  <Button
                    variant="outline"
                    disabled={invoicePending}
                    onClick={() => genInvoice()}
                  >
                    Generate Invoice Number
                  </Button>
                )}
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                Status updates require coordinator/admin.
              </span>
            )}
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="rounded-lg border border-border p-4">
              <div className="font-medium mb-2">Summary</div>
              <div className="text-sm">
                Sales Type: <span className="capitalize">{p.salesType}</span>
              </div>
              <div className="text-sm">
                Invoice Date:{" "}
                {p.invoiceDate
                  ? new Date(p.invoiceDate).toLocaleDateString()
                  : "-"}
              </div>
              <div className="text-sm">
                Order Placed:{" "}
                {p.orderPlacedDate
                  ? new Date(p.orderPlacedDate).toLocaleDateString()
                  : "-"}
              </div>
              <div className="text-sm">
                Order Approval:{" "}
                {p.orderApprovalDate
                  ? new Date(p.orderApprovalDate).toLocaleDateString()
                  : "-"}
              </div>
              <div className="text-sm">
                Invoice Number: {p.invoiceNumber || "-"}
              </div>
              <div className="text-sm">Destination: {p.destination || "-"}</div>
              <div className="text-sm">Transport: {p.transport || "-"}</div>
              <div className="text-sm">Discount: {p.discount ?? 0}%</div>
              <div className="text-sm">
                GST: ₹ {Number(p.gstAmount || 0).toFixed(2)}
              </div>
              <div className="text-sm font-medium">
                Final Amount: ₹ {Number(p.finalAmount || 0).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-border p-4">
              <div className="font-medium mb-2">Items</div>
              <div className="space-y-2">
                {p.purchaseItems?.length ? (
                  p.purchaseItems.map((it: any) => (
                    <div
                      key={it.id}
                      className="rounded border border-border p-3 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          Product #{it.productId}{" "}
                          {it.subcategory ? `• ${it.subcategory.value}` : ""}
                        </div>
                        <div>₹ {Number(it.totalPrice).toFixed(2)}</div>
                      </div>
                      <div className="text-muted-foreground">
                        {it.quantity} {it.quantityType} × ₹{" "}
                        {Number(it.unitPrice).toFixed(2)}{" "}
                        {it.discount ? `(disc ${it.discount}%)` : ""}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">No items</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetailsPage;
