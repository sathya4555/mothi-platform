import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { purchaseService, type Purchase } from "../services/purchase.service";
import { AmountDisplay } from "../components/shared/AmountDisplay";
import { StatusBadge } from "../components/shared/StatusBadge";
import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation";

export const PurchaseDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, "PurchaseDetails">>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await purchaseService.getPurchaseById(route.params.id);
      setPurchase(data);
    } catch (e) {
      setError("Failed to load purchase details");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [route.params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const canUpdateStatus = (p: Purchase): boolean => {
    if (!user) return false;
    switch (user.role) {
      case "admin":
        return true;
      case "coordinator":
        return p.status !== "completed";
      case "agent":
        return p.createdBy === user.id && p.status === "confirmation_pending";
      default:
        return false;
    }
  };

  const getAvailableStatusOptions = (p: Purchase): Purchase["status"][] => {
    if (!user) return [];
    switch (user.role) {
      case "admin":
        return [
          "confirmation_pending",
          "processing",
          "payment_pending",
          "completed",
          "cancelled",
        ];
      case "coordinator":
        if (p.status === "completed") return [];
        return [
          "confirmation_pending",
          "processing",
          "payment_pending",
          "cancelled",
        ];
      case "agent":
        if (p.status !== "confirmation_pending") return [];
        return ["cancelled"];
      default:
        return [];
    }
  };

  const handleUpdateStatus = async (newStatus: Purchase["status"]) => {
    if (!purchase) return;
    Alert.alert(
      "Update Status",
      `Are you sure you want to mark this purchase as ${newStatus.replace("_", " ")}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          onPress: async () => {
            try {
              setUpdating(true);
              await purchaseService.updatePurchaseStatus(
                purchase.id,
                newStatus
              );
              await load();
              Alert.alert("Success", "Purchase status updated successfully");
            } catch (e) {
              console.error(e);
              Alert.alert("Error", "Failed to update purchase status");
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (error || !purchase) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error ?? "Purchase not found"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={load}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.uniqueId}>{purchase.uniqueId}</Text>
          <StatusBadge status={purchase.status} size="medium" />
        </View>
        <Text style={styles.metaText}>
          {new Date(purchase.createdAt).toLocaleString()}
        </Text>
      </View>

      {/* Party & Created By */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Party</Text>
        <Text style={styles.primaryText}>{purchase.partyName}</Text>
        <Text style={styles.secondaryText}>
          Created by: {purchase.createdByName}
        </Text>
      </View>

      {/* Items */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Items</Text>
        {purchase.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.primaryText}>{item.productName}</Text>
              {!!item.subcategoryName && (
                <Text style={styles.secondaryText}>{item.subcategoryName}</Text>
              )}
              <Text style={styles.secondaryText}>
                Qty: {item.quantity} {item.quantityType}
              </Text>
            </View>
            <AmountDisplay amount={item.totalPrice} size="medium" />
          </View>
        ))}
      </View>

      {/* Amounts */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Amounts</Text>
        <View style={styles.amountRow}>
          <Text style={styles.secondaryText}>Subtotal</Text>
          <AmountDisplay amount={purchase.totalAmount} size="medium" />
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.secondaryText}>GST</Text>
          <AmountDisplay amount={purchase.gstAmount} size="medium" />
        </View>
        <View style={[styles.amountRow, styles.amountTotalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <AmountDisplay amount={purchase.finalAmount} size="large" />
        </View>
      </View>

      {/* Invoice */}
      {(purchase.status === "completed" || purchase.invoiceNumber) && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Invoice</Text>
          {purchase.invoiceNumber ? (
            <View style={styles.invoiceRow}>
              <Ionicons name="receipt-outline" size={18} color="#6B7280" />
              <Text style={styles.secondaryText}>
                Invoice #: {purchase.invoiceNumber}
              </Text>
            </View>
          ) : (
            <Text style={styles.secondaryText}>
              Invoice will be generated upon completion.
            </Text>
          )}
        </View>
      )}

      {/* Status Actions */}
      {canUpdateStatus(purchase) && (
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          <View style={styles.actionsRow}>
            {getAvailableStatusOptions(purchase).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  status === "cancelled" && styles.cancelButton,
                ]}
                onPress={() => handleUpdateStatus(status)}
                disabled={updating}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    status === "cancelled" && styles.cancelButtonText,
                  ]}
                >
                  {status.replace("_", " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  errorText: {
    color: "#DC2626",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  uniqueId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginRight: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  primaryText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
  },
  secondaryText: {
    fontSize: 14,
    color: "#6B7280",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  amountTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  invoiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  statusButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  statusButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  cancelButtonText: {
    color: "#DC2626",
  },
});
