import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { LoginScreen } from "../screens/LoginScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ComponentPreviewScreen } from "../screens/ComponentPreviewScreen";
import { PurchaseListScreen } from "../screens/PurchaseListScreen";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { authService } from "../services/auth.service";
import { PurchaseDetailsScreen } from "../screens/PurchaseDetailsScreen";
import { useAuth } from "../context/AuthContext";

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  ComponentPreview: undefined;
  PurchaseList: undefined;
  PurchaseDetails: { id: number };
  CreatePurchase: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const DashboardWrapper: React.FC<any> = ({ navigation }) => {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <DashboardScreen
      user={user}
      onLogout={async () => {
        await authService.logout();
        navigation.replace("Login");
      }}
    />
  );
};

export const Navigation: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator
          initialRouteName="Dashboard"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Dashboard" component={DashboardWrapper} />
          <Stack.Screen
            name="ComponentPreview"
            component={ComponentPreviewScreen}
          />
          <Stack.Screen name="PurchaseList" component={PurchaseListScreen} />
          <Stack.Screen
            name="PurchaseDetails"
            component={PurchaseDetailsScreen}
          />
          <Stack.Screen
            name="CreatePurchase"
            component={
              require("../screens/CreatePurchaseScreen").CreatePurchaseScreen
            }
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {({ navigation }) => (
              <LoginScreen
                onLoginSuccess={() => {
                  navigation.replace("Dashboard");
                }}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};
