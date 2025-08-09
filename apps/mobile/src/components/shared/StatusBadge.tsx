import React from "react";
import { View, Text, StyleSheet } from "react-native";

export type PurchaseStatus =
  | "confirmation_pending"
  | "processing"
  | "payment_pending"
  | "completed"
  | "cancelled";

interface StatusBadgeProps {
  status: PurchaseStatus;
  size?: "small" | "medium" | "large";
}

const statusConfig = {
  confirmation_pending: {
    backgroundColor: "#FEF3C7", // Light yellow
    textColor: "#92400E", // Dark yellow
    label: "Pending Confirmation",
  },
  processing: {
    backgroundColor: "#DBEAFE", // Light blue
    textColor: "#1E40AF", // Dark blue
    label: "Processing",
  },
  payment_pending: {
    backgroundColor: "#FCE7F3", // Light pink
    textColor: "#9D174D", // Dark pink
    label: "Payment Pending",
  },
  completed: {
    backgroundColor: "#D1FAE5", // Light green
    textColor: "#065F46", // Dark green
    label: "Completed",
  },
  cancelled: {
    backgroundColor: "#FEE2E2", // Light red
    textColor: "#991B1B", // Dark red
    label: "Cancelled",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "medium",
}) => {
  const config = statusConfig[status];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.backgroundColor },
        styles[size],
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: config.textColor },
          styles[`${size}Text`],
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  text: {
    fontWeight: "600",
  },
  // Size variants
  small: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  large: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  // Text size variants
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
});
