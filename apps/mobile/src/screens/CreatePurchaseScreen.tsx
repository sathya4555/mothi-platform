import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import {
  catalogService,
  type Party,
  type Product,
  type Subcategory,
} from "../services/catalog.service";
import { purchaseService } from "../services/purchase.service";
import { AmountDisplay } from "../components/shared/AmountDisplay";

interface LineItem {
  id: number;
  productId?: number;
  subcategoryId?: number;
  quantity: number;
  quantityType: "piece" | "bale";
  price: number;
}

export const CreatePurchaseScreen: React.FC = () => {
  const [parties, setParties] = useState<Party[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const [partyId, setPartyId] = useState<number | undefined>();
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, quantity: 1, quantityType: "piece", price: 0 },
  ]);

  useEffect(() => {
    (async () => {
      setParties(await catalogService.getParties());
      setProducts(await catalogService.getProducts());
    })();
  }, []);

  const totalAmount = useMemo(
    () => items.reduce((sum, i) => sum + (i.quantity || 0) * (i.price || 0), 0),
    [items]
  );
  const gstAmount = useMemo(() => totalAmount * 0.05, [totalAmount]);
  const finalAmount = useMemo(
    () => totalAmount + gstAmount,
    [totalAmount, gstAmount]
  );

  const updateItem = (id: number, patch: Partial<LineItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: prev.length ? Math.max(...prev.map((i) => i.id)) + 1 : 1,
        quantity: 1,
        quantityType: "piece",
        price: 0,
      },
    ]);
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const onSelectProduct = async (id: number | undefined, lineId: number) => {
    updateItem(lineId, { productId: id, subcategoryId: undefined });
    if (id) {
      setSubcategories(await catalogService.getSubcategories(id));
    } else {
      setSubcategories([]);
    }
  };

  const canSubmit = useMemo(() => {
    if (!partyId) return false;
    if (items.length === 0) return false;
    return items.every((i) => i.productId && i.quantity > 0 && i.price >= 0);
  }, [partyId, items]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      const payload = {
        partyId: partyId!,
        items: items.map((i) => ({
          productId: i.productId!,
          subcategoryId: i.subcategoryId,
          quantity: i.quantity,
          quantityType: i.quantityType,
          price: i.price,
        })),
      };
      const created = await purchaseService.createPurchase(payload);
      Alert.alert("Success", `Purchase ${created.uniqueId} created`);
    } catch (e) {
      Alert.alert("Error", "Failed to create purchase");
    }
  };

  const renderLine = ({ item }: { item: LineItem }) => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Item #{item.id}</Text>
      {/* Product select */}
      <View style={styles.row}>
        <Text style={styles.label}>Product</Text>
        <FlatList
          horizontal
          data={products}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={{ gap: 8 }}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: p }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                item.productId === p.id && styles.chipActive,
              ]}
              onPress={() => onSelectProduct(p.id, item.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  item.productId === p.id && styles.chipTextActive,
                ]}
              >
                {p.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Subcategory select */}
      {item.productId && subcategories.length > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Subcategory</Text>
          <FlatList
            horizontal
            data={subcategories.filter((s) => s.productId === item.productId)}
            keyExtractor={(s) => String(s.id)}
            contentContainerStyle={{ gap: 8 }}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: s }) => (
              <TouchableOpacity
                style={[
                  styles.chip,
                  item.subcategoryId === s.id && styles.chipActive,
                ]}
                onPress={() => updateItem(item.id, { subcategoryId: s.id })}
              >
                <Text
                  style={[
                    styles.chipText,
                    item.subcategoryId === s.id && styles.chipTextActive,
                  ]}
                >
                  {s.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Quantity & Price - responsive grid */}
      <View style={styles.gridRow}>
        <View style={styles.gridCol}>
          <Text style={styles.label}>Quantity Type</Text>
          <View style={styles.pillGroup}>
            {(["piece", "bale"] as const).map((qt) => (
              <TouchableOpacity
                key={qt}
                style={[
                  styles.pill,
                  item.quantityType === qt && styles.pillActive,
                ]}
                onPress={() => updateItem(item.id, { quantityType: qt })}
              >
                <Text
                  style={[
                    styles.pillText,
                    item.quantityType === qt && styles.pillTextActive,
                  ]}
                >
                  {qt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.gridCol}>
          <Text style={styles.label}>Quantity</Text>
          <View style={styles.counterGroup}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() =>
                updateItem(item.id, {
                  quantity: Math.max(0, item.quantity - 1),
                })
              }
            >
              <Text style={styles.counterText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() =>
                updateItem(item.id, { quantity: item.quantity + 1 })
              }
            >
              <Text style={styles.counterText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.gridCol}>
          <Text style={styles.label}>Unit Price</Text>
          <View style={styles.counterGroup}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() =>
                updateItem(item.id, { price: Math.max(0, item.price - 10) })
              }
            >
              <Text style={styles.counterText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>₹{item.price}</Text>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => updateItem(item.id, { price: item.price + 10 })}
            >
              <Text style={styles.counterText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.rowSpace}>
        <Text style={styles.secondary}>Line Total</Text>
        <AmountDisplay amount={item.quantity * item.price} />
      </View>

      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => removeItem(item.id)}
      >
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Purchase</Text>

      {/* Party select */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Party</Text>
        <FlatList
          horizontal
          data={parties}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={{ gap: 8 }}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: p }) => (
            <TouchableOpacity
              style={[styles.chip, partyId === p.id && styles.chipActive]}
              onPress={() => setPartyId(p.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  partyId === p.id && styles.chipTextActive,
                ]}
              >
                {p.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Items */}
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderLine}
        contentContainerStyle={{ paddingBottom: 180, gap: 12 }}
        ListFooterComponent={
          <TouchableOpacity style={styles.addBtn} onPress={addItem}>
            <Text style={styles.addBtnText}>Add Item</Text>
          </TouchableOpacity>
        }
      />

      {/* Totals & Submit */}
      <View style={styles.footer}>
        <View style={{ gap: 6 }}>
          <View style={styles.rowSpace}>
            <Text style={styles.secondary}>Subtotal</Text>
            <AmountDisplay amount={totalAmount} />
          </View>
          <View style={styles.rowSpace}>
            <Text style={styles.secondary}>GST (5%)</Text>
            <AmountDisplay amount={gstAmount} />
          </View>
          <View style={styles.rowSpace}>
            <Text style={styles.totalLabel}>Total</Text>
            <AmountDisplay amount={finalAmount} />
          </View>
        </View>
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          disabled={!canSubmit}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>Create Purchase</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  label: { color: "#374151", fontWeight: "600", marginBottom: 6 },
  chip: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  chipActive: { backgroundColor: "#EEF2FF", borderColor: "#6366F1" },
  chipText: { color: "#374151" },
  chipTextActive: { color: "#4F46E5", fontWeight: "600" },
  row: { marginBottom: 10 },
  rowSpace: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 6,
  },
  gridCol: { width: "48%", marginBottom: 8 },
  pillGroup: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  pill: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  pillActive: { backgroundColor: "#ECFEFF", borderColor: "#06B6D4" },
  pillText: { color: "#374151" },
  pillTextActive: { color: "#0891B2", fontWeight: "600" },
  counterGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  counterBtn: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  counterText: { fontSize: 16, fontWeight: "700", color: "#111827" },
  counterValue: {
    minWidth: 40,
    textAlign: "center",
    fontWeight: "600",
    color: "#111827",
  },
  secondary: { color: "#6B7280" },
  totalLabel: { fontWeight: "700", color: "#111827" },
  addBtn: {
    marginTop: 12,
    alignSelf: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addBtnText: { color: "#4F46E5", fontWeight: "600" },
  removeBtn: { marginTop: 10, alignSelf: "flex-end" },
  removeText: { color: "#DC2626", fontWeight: "600" },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  submitBtn: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  submitBtnDisabled: { backgroundColor: "#CBD5E1" },
  submitText: { color: "#FFFFFF", fontWeight: "700" },
});
