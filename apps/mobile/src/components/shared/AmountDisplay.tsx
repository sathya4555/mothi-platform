import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface AmountDisplayProps {
  amount: number;
  showGst?: boolean;
  showBreakdown?: boolean;
  size?: "small" | "medium" | "large";
  type?: "default" | "success" | "danger";
}

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount,
  showGst = false,
  showBreakdown = false,
  size = "medium",
  type = "default",
}) => {
  const baseAmount = showGst ? amount / 1.05 : amount;
  const gstAmount = showGst ? baseAmount * 0.05 : 0;

  const getColorByType = () => {
    switch (type) {
      case "success":
        return "#059669"; // Green
      case "danger":
        return "#DC2626"; // Red
      default:
        return "#111827"; // Dark gray
    }
  };

  if (showBreakdown) {
    return (
      <View style={styles.container}>
        <Text style={[styles.label, styles[`${size}Label`]]}>Base Amount</Text>
        <Text
          style={[
            styles.amount,
            styles[`${size}Amount`],
            { color: getColorByType() },
          ]}
        >
          {formatAmount(baseAmount)}
        </Text>

        <Text style={[styles.label, styles[`${size}Label`]]}>GST (5%)</Text>
        <Text
          style={[
            styles.amount,
            styles[`${size}Amount`],
            { color: getColorByType() },
          ]}
        >
          {formatAmount(gstAmount)}
        </Text>

        <View style={styles.divider} />

        <Text style={[styles.label, styles[`${size}Label`], styles.totalLabel]}>
          Total Amount
        </Text>
        <Text
          style={[
            styles.amount,
            styles[`${size}Amount`],
            styles.totalAmount,
            { color: getColorByType() },
          ]}
        >
          {formatAmount(amount)}
        </Text>
      </View>
    );
  }

  return (
    <Text
      style={[
        styles.amount,
        styles[`${size}Amount`],
        { color: getColorByType() },
      ]}
    >
      {formatAmount(amount)}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  label: {
    color: "#6B7280",
    marginBottom: 4,
  },
  amount: {
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  totalLabel: {
    fontWeight: "600",
    color: "#374151",
  },
  totalAmount: {
    fontWeight: "700",
  },
  // Size variants - Labels
  smallLabel: {
    fontSize: 12,
  },
  mediumLabel: {
    fontSize: 14,
  },
  largeLabel: {
    fontSize: 16,
  },
  // Size variants - Amounts
  smallAmount: {
    fontSize: 14,
  },
  mediumAmount: {
    fontSize: 16,
  },
  largeAmount: {
    fontSize: 20,
  },
});
