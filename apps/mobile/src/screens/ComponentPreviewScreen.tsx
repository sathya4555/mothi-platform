import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { StatusBadge } from "../components/shared/StatusBadge";
import { AmountDisplay } from "../components/shared/AmountDisplay";
import { PartySelector } from "../components/shared/PartySelector";
import type { Party } from "../services/party.service";

export const ComponentPreviewScreen: React.FC = () => {
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Status Badges</Text>
      <View style={styles.section}>
        <View style={styles.row}>
          <StatusBadge status="confirmation_pending" size="small" />
        </View>
        <View style={styles.row}>
          <StatusBadge status="processing" />
        </View>
        <View style={styles.row}>
          <StatusBadge status="payment_pending" />
        </View>
        <View style={styles.row}>
          <StatusBadge status="completed" />
        </View>
        <View style={styles.row}>
          <StatusBadge status="cancelled" />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Amount Display</Text>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Simple Amount:</Text>
          <AmountDisplay amount={1000} size="small" />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>With GST:</Text>
          <AmountDisplay amount={1000} showGst size="medium" />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Success Amount:</Text>
          <AmountDisplay amount={5000} type="success" size="large" />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Danger Amount:</Text>
          <AmountDisplay amount={-1000} type="danger" size="medium" />
        </View>

        <View style={styles.breakdownSection}>
          <Text style={styles.label}>Full Breakdown:</Text>
          <AmountDisplay amount={1050} showGst showBreakdown size="medium" />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Party Selector</Text>
      <View style={[styles.section, styles.selectorSection]}>
        <PartySelector
          onSelect={setSelectedParty}
          selectedPartyId={selectedParty?.id}
          userId={1}
          userRole="admin"
          showRecent={true}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginTop: 24,
    marginBottom: 16,
  },
  section: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  selectorSection: {
    height: 400, // Fixed height for the selector section
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  breakdownSection: {
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 12,
    minWidth: 100,
  },
});
