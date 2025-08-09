import React from "react";
import { ScrollView, Alert } from "react-native";
import {
  Box,
  Text,
  VStack,
  HStack,
  Pressable,
  useColorModeValue,
  Icon,
  IconButton,
  Divider,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "../services/auth.service";
import { ThemeToggle } from "../components/ThemeToggle";
import { useNavigation } from "@react-navigation/native";

interface DashboardUser {
  name: string;
  role: "admin" | "agent" | "coordinator";
}

interface DashboardScreenProps {
  user: DashboardUser;
  onLogout: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  onLogout,
}) => {
  const navigation = useNavigation<any>();
  console.log("🏠 DashboardScreen rendered with user:", user);
  // Simple color values for clean theme support with explicit dark mode colors
  const bgColor = useColorModeValue("#ffffff", "#171717");
  const surfaceColor = useColorModeValue("#fafafa", "#262626");
  const cardBg = useColorModeValue("#ffffff", "#262626");
  const textColor = useColorModeValue("#171717", "#fafafa");
  const textSecondary = useColorModeValue("#64748b", "#94a3b8");
  const borderColor = useColorModeValue("#e2e8f0", "#475569");

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await authService.logout();
          onLogout();
        },
      },
    ]);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "agent":
        return "Sales Agent";
      case "coordinator":
        return "Coordinator";
      default:
        return role;
    }
  };

  const renderAdminDashboard = () => (
    <Box mb={8}>
      <Text fontSize="2xl" fontWeight="700" color={textColor} mb={6}>
        Admin Controls
      </Text>
      <VStack space={4}>
        <HStack space={4} flexWrap="wrap">
          <Pressable flex={1} minW="48%">
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              borderWidth={1}
              borderColor={borderColor}
              shadow={2}
            >
              <Icon
                as={Ionicons}
                name="people"
                size="lg"
                color="primary.500"
                mb={3}
              />
              <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
                Manage Users
              </Text>
              <Text fontSize="sm" color={textSecondary}>
                Add, edit, or remove users
              </Text>
            </Box>
          </Pressable>
          <Pressable flex={1} minW="48%">
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              borderWidth={1}
              borderColor={borderColor}
              shadow={2}
            >
              <Icon
                as={Ionicons}
                name="settings"
                size="lg"
                color="secondary.500"
                mb={3}
              />
              <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
                System Settings
              </Text>
              <Text fontSize="sm" color={textSecondary}>
                Configure system parameters
              </Text>
            </Box>
          </Pressable>
          <Pressable flex={1} minW="48%">
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              borderWidth={1}
              borderColor={borderColor}
              shadow={2}
            >
              <Icon
                as={Ionicons}
                name="analytics"
                size="lg"
                color="primary.500"
                mb={3}
              />
              <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
                Analytics
              </Text>
              <Text fontSize="sm" color={textSecondary}>
                View detailed reports
              </Text>
            </Box>
          </Pressable>
          <Pressable flex={1} minW="48%">
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              borderWidth={1}
              borderColor={borderColor}
              shadow={2}
            >
              <Icon
                as={Ionicons}
                name="cube"
                size="lg"
                color="secondary.500"
                mb={3}
              />
              <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
                Products
              </Text>
              <Text fontSize="sm" color={textSecondary}>
                Manage product catalog
              </Text>
            </Box>
          </Pressable>
        </HStack>
      </VStack>
    </Box>
  );

  const renderAgentDashboard = () => (
    <Box mb={8}>
      <Text fontSize="2xl" fontWeight="700" color={textColor} mb={6}>
        Agent Dashboard
      </Text>
      <VStack space={4}>
        <HStack space={4} flexWrap="wrap">
          <Pressable
            flex={1}
            minW="48%"
            onPress={() => navigation.navigate("CreatePurchase")}
          >
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              borderWidth={1}
              borderColor={borderColor}
              shadow={2}
            >
              <Icon
                as={Ionicons}
                name="add-circle"
                size="lg"
                color="primary.500"
                mb={3}
              />
              <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
                Create Purchase
              </Text>
              <Text fontSize="sm" color={textSecondary}>
                Place new orders
              </Text>
            </Box>
          </Pressable>
          <Pressable
            flex={1}
            minW="48%"
            onPress={() => navigation.navigate("PurchaseList")}
          >
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              borderWidth={1}
              borderColor={borderColor}
              shadow={2}
            >
              <Icon
                as={Ionicons}
                name="trending-up"
                size="lg"
                color="secondary.500"
                mb={3}
              />
              <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
                My Sales
              </Text>
              <Text fontSize="sm" color={textSecondary}>
                View your sales history
              </Text>
            </Box>
          </Pressable>
          <Pressable
            flex={1}
            minW="48%"
            onPress={() => navigation.navigate("PurchaseList")}
          >
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              borderWidth={1}
              borderColor={borderColor}
              shadow={2}
            >
              <Icon
                as={Ionicons}
                name="people-circle"
                size="lg"
                color="primary.500"
                mb={3}
              />
              <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
                Parties
              </Text>
              <Text fontSize="sm" color={textSecondary}>
                Manage customer parties
              </Text>
            </Box>
          </Pressable>
          <Pressable
            flex={1}
            minW="48%"
            onPress={() => navigation.navigate("PurchaseList")}
          >
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              borderWidth={1}
              borderColor={borderColor}
              shadow={2}
            >
              <Icon
                as={Ionicons}
                name="time"
                size="lg"
                color="secondary.500"
                mb={3}
              />
              <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
                Pending Orders
              </Text>
              <Text fontSize="sm" color={textSecondary}>
                Orders awaiting approval
              </Text>
            </Box>
          </Pressable>
        </HStack>
      </VStack>
    </Box>
  );

  const renderCoordinatorDashboard = () => (
    <Box mb={8}>
      <Text fontSize="2xl" fontWeight="700" color={textColor} mb={6}>
        Coordinator Dashboard
      </Text>
      <VStack space={4}>
        <HStack space={4} flexWrap="wrap">
          <Pressable flex={1} minW="48%">
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              borderWidth={1}
              borderColor={borderColor}
              shadow={2}
            >
              <Icon
                as={Ionicons}
                name="checkmark-circle"
                size="lg"
                color="primary.500"
                mb={3}
              />
              <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
                Approve Orders
              </Text>
              <Text fontSize="sm" color={textSecondary}>
                Review and approve purchases
              </Text>
            </Box>
          </Pressable>
          <Pressable flex={1} minW="48%">
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              borderWidth={1}
              borderColor={borderColor}
              shadow={2}
            >
              <Icon
                as={Ionicons}
                name="cube"
                size="lg"
                color="secondary.500"
                mb={3}
              />
              <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
                Manage Products
              </Text>
              <Text fontSize="sm" color={textSecondary}>
                Update product information
              </Text>
            </Box>
          </Pressable>
          <Pressable flex={1} minW="48%">
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              borderWidth={1}
              borderColor={borderColor}
              shadow={2}
            >
              <Icon
                as={Ionicons}
                name="document-text"
                size="lg"
                color="primary.500"
                mb={3}
              />
              <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
                Reports
              </Text>
              <Text fontSize="sm" color={textSecondary}>
                Generate sales reports
              </Text>
            </Box>
          </Pressable>
          <Pressable flex={1} minW="48%">
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              borderWidth={1}
              borderColor={borderColor}
              shadow={2}
            >
              <Icon
                as={Ionicons}
                name="eye"
                size="lg"
                color="secondary.500"
                mb={3}
              />
              <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
                System Overview
              </Text>
              <Text fontSize="sm" color={textSecondary}>
                Monitor system status
              </Text>
            </Box>
          </Pressable>
        </HStack>
      </VStack>
    </Box>
  );

  const renderQuickStats = () => (
    <Box mb={8}>
      <Text fontSize="2xl" fontWeight="700" color={textColor} mb={6}>
        Quick Stats
      </Text>
      <HStack space={4}>
        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          flex={1}
          alignItems="center"
          borderWidth={1}
          borderColor={borderColor}
          shadow={2}
        >
          <Text fontSize="3xl" fontWeight="800" color="primary.500" mb={2}>
            0
          </Text>
          <Text
            fontSize="sm"
            color={textSecondary}
            textAlign="center"
            fontWeight="500"
          >
            Total Sales
          </Text>
        </Box>
        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          flex={1}
          alignItems="center"
          borderWidth={1}
          borderColor={borderColor}
          shadow={2}
        >
          <Text fontSize="3xl" fontWeight="800" color="secondary.500" mb={2}>
            0
          </Text>
          <Text
            fontSize="sm"
            color={textSecondary}
            textAlign="center"
            fontWeight="500"
          >
            Pending Orders
          </Text>
        </Box>
        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          flex={1}
          alignItems="center"
          borderWidth={1}
          borderColor={borderColor}
          shadow={2}
        >
          <Text fontSize="3xl" fontWeight="800" color="primary.500" mb={2}>
            0
          </Text>
          <Text
            fontSize="sm"
            color={textSecondary}
            textAlign="center"
            fontWeight="500"
          >
            Parties
          </Text>
        </Box>
        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          flex={1}
          alignItems="center"
          borderWidth={1}
          borderColor={borderColor}
          shadow={2}
        >
          <Text fontSize="3xl" fontWeight="800" color="secondary.500" mb={2}>
            0
          </Text>
          <Text
            fontSize="sm"
            color={textSecondary}
            textAlign="center"
            fontWeight="500"
          >
            Products
          </Text>
        </Box>
      </HStack>
    </Box>
  );

  return (
    <Box flex={1} bg={bgColor}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
      >
        {/* Header */}
        <Box
          bg={surfaceColor}
          px={6}
          pt={16}
          pb={6}
          borderBottomWidth={1}
          borderColor={borderColor}
          shadow={3}
        >
          <HStack justifyContent="space-between" alignItems="center">
            <Box flex={1}>
              <Text fontSize="sm" color={textColor} mb={1} fontWeight="500">
                Welcome back,
              </Text>
              <Text fontSize="3xl" fontWeight="800" color={textColor} mb={3}>
                {user.name}
              </Text>
              <Box
                bg="primary.500"
                px={4}
                py={2}
                borderRadius="full"
                alignSelf="flex-start"
                shadow={1}
              >
                <Text color="white" fontSize="sm" fontWeight="600">
                  {getRoleDisplayName(user.role)}
                </Text>
              </Box>
            </Box>
            <HStack space={3} alignItems="center">
              <ThemeToggle />
              <IconButton
                icon={
                  <Icon
                    as={Ionicons}
                    name="log-out-outline"
                    size="md"
                    color="secondary.500"
                  />
                }
                onPress={handleLogout}
                variant="ghost"
                _pressed={{ bg: "secondary.50" }}
                borderRadius="full"
              />
            </HStack>
          </HStack>
        </Box>

        <Box px={6} py={8}>
          {/* Quick Stats */}
          {renderQuickStats()}

          <Divider my={4} bg={borderColor} />

          {/* Role-based Dashboard */}
          {user.role === "admin" && renderAdminDashboard()}
          {user.role === "agent" && renderAgentDashboard()}
          {user.role === "coordinator" && renderCoordinatorDashboard()}

          {/* Recent Activity */}
          <Box mb={8}>
            <Text fontSize="2xl" fontWeight="700" color={textColor} mb={6}>
              Recent Activity
            </Text>
            <Box
              bg={cardBg}
              p={8}
              borderRadius="xl"
              alignItems="center"
              borderWidth={1}
              borderColor={borderColor}
              shadow={2}
            >
              <Icon
                as={Ionicons}
                name="time-outline"
                size="xl"
                color={textSecondary}
                mb={4}
              />
              <Text fontSize="lg" color={textSecondary} mb={2} fontWeight="500">
                No recent activity
              </Text>
              <Text fontSize="sm" color={textSecondary} textAlign="center">
                Your recent actions will appear here
              </Text>
            </Box>
          </Box>
        </Box>
      </ScrollView>
    </Box>
  );
};
