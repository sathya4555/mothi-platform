import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { partyService, Party } from "../../services/party.service";
import debounce from "lodash/debounce";

interface PartySelectorProps {
  onSelect: (party: Party) => void;
  selectedPartyId?: number;
  userId?: number;
  userRole?: string;
  showRecent?: boolean;
}

export const PartySelector: React.FC<PartySelectorProps> = ({
  onSelect,
  selectedPartyId,
  userId,
  userRole,
  showRecent = true,
}) => {
  const [parties, setParties] = useState<Party[]>([]);
  const [recentParties, setRecentParties] = useState<Party[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      try {
        setLoading(true);
        setError(null);
        const params = {
          search: query,
          isActive: true,
          ...(userRole === "agent" && { createdBy: userId }),
        };
        const results = await partyService.getParties(params);
        setParties(results);
      } catch (err) {
        setError("Failed to fetch parties");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300),
    [userId, userRole]
  );

  // Load recent parties
  const loadRecentParties = async () => {
    if (!showRecent) return;
    try {
      const recent = await partyService.getRecentParties();
      setRecentParties(recent);
    } catch (err) {
      console.error("Failed to load recent parties:", err);
    }
  };

  // Initial load
  useEffect(() => {
    debouncedSearch("");
    loadRecentParties();
  }, []);

  // Handle search input
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const renderPartyItem = ({ item }: { item: Party }) => (
    <TouchableOpacity
      style={[
        styles.partyItem,
        selectedPartyId === item.id && styles.selectedParty,
      ]}
      onPress={() => onSelect(item)}
    >
      <View style={styles.partyInfo}>
        <Text style={styles.partyName}>{item.name}</Text>
        <Text style={styles.partyDetails}>
          {item.phone} {item.gstNumber ? `• GST: ${item.gstNumber}` : ""}
        </Text>
        <Text style={styles.partyAddress} numberOfLines={2}>
          {item.address}
        </Text>
      </View>
      {selectedPartyId === item.id && (
        <Ionicons name="checkmark-circle" size={24} color="#059669" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#6B7280"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search parties..."
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
      </View>

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Loading Indicator */}
      {loading && <ActivityIndicator style={styles.loading} color="#6366F1" />}

      {/* Recent Parties */}
      {showRecent && recentParties.length > 0 && !searchQuery && (
        <>
          <Text style={styles.sectionTitle}>Recent Parties</Text>
          <FlatList
            data={recentParties}
            renderItem={renderPartyItem}
            keyExtractor={(item) => `recent-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recentList}
            contentContainerStyle={styles.recentListContent}
          />
        </>
      )}

      {/* All Parties */}
      <Text style={styles.sectionTitle}>
        {searchQuery ? "Search Results" : "All Parties"}
      </Text>
      <FlatList
        data={parties}
        renderItem={renderPartyItem}
        keyExtractor={(item) => `party-${item.id}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loading ? null : (
            <Text style={styles.emptyText}>
              {searchQuery ? "No parties found" : "No parties available"}
            </Text>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  recentList: {
    maxHeight: 120,
    marginBottom: 24,
  },
  recentListContent: {
    paddingRight: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  partyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedParty: {
    backgroundColor: "#ECFDF5",
    borderColor: "#059669",
    borderWidth: 1,
  },
  partyInfo: {
    flex: 1,
  },
  partyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  partyDetails: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  partyAddress: {
    fontSize: 14,
    color: "#4B5563",
  },
  loading: {
    marginVertical: 20,
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    marginVertical: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 20,
  },
});
