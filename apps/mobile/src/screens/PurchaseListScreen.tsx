import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  purchaseService,
  Purchase,
  PurchaseSearchParams,
} from "../services/purchase.service";
import { StatusBadge } from "../components/shared/StatusBadge";
import { AmountDisplay } from "../components/shared/AmountDisplay";
import { FilterPanel } from "../components/shared/FilterPanel";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";

const statusOptions = [
  { label: "Pending Confirmation", value: "confirmation_pending" },
  { label: "Processing", value: "processing" },
  { label: "Payment Pending", value: "payment_pending" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export const PurchaseListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<PurchaseSearchParams>({});
  const [filterCount, setFilterCount] = useState(0);

  const loadPurchases = async (filters: PurchaseSearchParams = {}) => {
    try {
      setError(null);
      // Add user-based filters
      const userFilters = {
        ...filters,
        // If user is an agent, only show their purchases
        ...(user?.role === "agent" && { createdBy: user.id }),
      };
      const data = await purchaseService.getPurchases(userFilters);
      setPurchases(data);
    } catch (err) {
      setError("Failed to load purchases");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadPurchases(activeFilters);
    } finally {
      setRefreshing(false);
    }
  }, [activeFilters]);

  useEffect(() => {
    loadPurchases(activeFilters);
  }, [activeFilters]);

  const handleFilterApply = (filters: any) => {
    const newFilters: PurchaseSearchParams = {};
    let count = 0;

    if (filters.status) {
      newFilters.status = filters.status;
      count++;
    }
    if (filters.startDate) {
      newFilters.startDate = format(filters.startDate, "yyyy-MM-dd");
      count++;
    }
    if (filters.endDate) {
      newFilters.endDate = format(filters.endDate, "yyyy-MM-dd");
      count++;
    }
    if (filters.search) {
      newFilters.search = filters.search;
      count++;
    }

    setActiveFilters(newFilters);
    setFilterCount(count);
  };

  const handleStatusUpdate = async (
    purchaseId: number,
    newStatus: Purchase["status"]
  ) => {
    try {
      await purchaseService.updatePurchaseStatus(purchaseId, newStatus);
      // Refresh the list
      loadPurchases(activeFilters);
      Alert.alert("Success", "Purchase status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Error", "Failed to update purchase status");
    }
  };

  const canUpdateStatus = (purchase: Purchase): boolean => {
    if (!user) return false;

    switch (user.role) {
      case "admin":
        return true;
      case "coordinator":
        // Coordinators can update any status except completed purchases
        return purchase.status !== "completed";
      case "agent":
        // Agents can only update their own purchases from confirmation_pending to cancelled
        return (
          purchase.createdBy === user.id &&
          purchase.status === "confirmation_pending"
        );
      default:
        return false;
    }
  };

  const getAvailableStatusOptions = (
    purchase: Purchase
  ): Purchase["status"][] => {
    if (!user) return [];

    switch (user.role) {
      case "admin":
        return statusOptions.map(
          (option) => option.value as Purchase["status"]
        );
      case "coordinator":
        if (purchase.status === "completed") return [];
        return statusOptions
          .map((option) => option.value as Purchase["status"])
          .filter((status) => status !== "completed");
      case "agent":
        if (purchase.status !== "confirmation_pending") return [];
        return ["cancelled"];
      default:
        return [];
    }
  };

  const renderPurchaseItem = ({ item }: { item: Purchase }) => (
    <TouchableOpacity
      style={styles.purchaseItem}
      onPress={() => navigation.navigate("PurchaseDetails", { id: item.id })}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.uniqueId}>{item.uniqueId}</Text>
          <StatusBadge status={item.status} size="small" />
        </View>
        <Text style={styles.date}>
          {format(new Date(item.createdAt), "dd MMM yyyy")}
        </Text>
      </View>

      <View style={styles.partyInfo}>
        <Text style={styles.partyName}>{item.partyName}</Text>
        <Text style={styles.agentName}>Agent: {item.createdByName}</Text>
      </View>

      <View style={styles.itemsSummary}>
        <Text style={styles.itemsCount}>
          {item.items.length} {item.items.length === 1 ? "Item" : "Items"}
        </Text>
        <AmountDisplay amount={item.finalAmount} size="medium" />
      </View>

      {item.invoiceNumber && (
        <View style={styles.invoiceInfo}>
          <Ionicons name="receipt-outline" size={16} color="#6B7280" />
          <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
        </View>
      )}

      {/* Status Update Options */}
      {canUpdateStatus(item) && (
        <View style={styles.statusActions}>
          {getAvailableStatusOptions(item).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                status === "cancelled" && styles.cancelButton,
              ]}
              onPress={() => {
                Alert.alert(
                  "Update Status",
                  `Are you sure you want to mark this purchase as ${status}?`,
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Update",
                      onPress: () => handleStatusUpdate(item.id, status),
                    },
                  ]
                );
              }}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  status === "cancelled" && styles.cancelButtonText,
                ]}
              >
                Mark as {status.replace("_", " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadPurchases(activeFilters)}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(true)}
      >
        <Ionicons name="filter" size={20} color="#6366F1" />
        <Text style={styles.filterButtonText}>Filters</Text>
        {filterCount > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{filterCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <FlatList
        data={purchases}
        renderItem={renderPurchaseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No purchases found</Text>
          </View>
        }
      />

      {/* Only show FAB for agents and coordinators */}
      {user && (user.role === "agent" || user.role === "coordinator") && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("CreatePurchase")}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <FilterPanel
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleFilterApply}
        statusOptions={statusOptions}
        showDateFilter={true}
        showSearch={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonText: {
    color: "#6366F1",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  filterBadge: {
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  filterBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
  },
  purchaseItem: {
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
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginRight: 8,
  },
  date: {
    fontSize: 14,
    color: "#6B7280",
  },
  partyInfo: {
    marginBottom: 12,
  },
  partyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  agentName: {
    fontSize: 14,
    color: "#6B7280",
  },
  itemsSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemsCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  invoiceInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  invoiceNumber: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  statusActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
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
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#6366F1",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
