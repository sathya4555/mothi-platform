import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterPanelProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  statusOptions?: FilterOption[];
  showPartyFilter?: boolean;
  showDateFilter?: boolean;
  showSearch?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  visible,
  onClose,
  onApply,
  statusOptions = [],
  showPartyFilter = true,
  showDateFilter = true,
  showSearch = true,
}) => {
  const [filters, setFilters] = useState({
    status: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
    search: "",
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleStatusSelect = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const handleDateChange = (type: "start" | "end", date: Date | null) => {
    if (type === "start") {
      setShowStartDatePicker(false);
      setFilters((prev) => ({ ...prev, startDate: date }));
    } else {
      setShowEndDatePicker(false);
      setFilters((prev) => ({ ...prev, endDate: date }));
    }
  };

  const handleSearch = (text: string) => {
    setFilters((prev) => ({ ...prev, search: text }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      status: "",
      startDate: null,
      endDate: null,
      search: "",
    });
  };

  const formatDate = (date: Date | null) => {
    return date ? format(date, "dd MMM yyyy") : "Select Date";
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.panel}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Search */}
            {showSearch && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Search</Text>
                <View style={styles.searchContainer}>
                  <Ionicons
                    name="search"
                    size={20}
                    color="#6B7280"
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by ID or invoice number..."
                    value={filters.search}
                    onChangeText={handleSearch}
                  />
                </View>
              </View>
            )}

            {/* Status Filter */}
            {statusOptions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Status</Text>
                <View style={styles.statusContainer}>
                  {statusOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.statusOption,
                        filters.status === option.value &&
                          styles.statusOptionSelected,
                      ]}
                      onPress={() => handleStatusSelect(option.value)}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          filters.status === option.value &&
                            styles.statusTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Date Filter */}
            {showDateFilter && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Date Range</Text>
                <View style={styles.dateContainer}>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {formatDate(filters.startDate)}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.dateSeperator}>to</Text>

                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {formatDate(filters.endDate)}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showStartDatePicker && (
                  <DateTimePicker
                    value={filters.startDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(_, date) =>
                      handleDateChange("start", date || null)
                    }
                  />
                )}

                {showEndDatePicker && (
                  <DateTimePicker
                    value={filters.endDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(_, date) =>
                      handleDateChange("end", date || null)
                    }
                  />
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  panel: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#111827",
  },
  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    margin: 4,
  },
  statusOptionSelected: {
    backgroundColor: "#6366F1",
  },
  statusText: {
    color: "#4B5563",
    fontSize: 14,
  },
  statusTextSelected: {
    color: "#FFFFFF",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
  },
  dateButtonText: {
    color: "#111827",
    fontSize: 14,
    textAlign: "center",
  },
  dateSeperator: {
    marginHorizontal: 12,
    color: "#6B7280",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6366F1",
  },
  resetButtonText: {
    color: "#6366F1",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  applyButton: {
    flex: 2,
    backgroundColor: "#6366F1",
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
