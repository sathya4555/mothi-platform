import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NativeBaseProvider, useColorModeValue } from "native-base";
import { LoginScreen } from "./src/screens/LoginScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { authService, User } from "./src/services/auth.service";
import { ThemeProvider } from "./src/theme/ThemeContext";
import { theme } from "./src/theme";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      if (authenticated) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <NativeBaseProvider theme={theme}>
        <ThemeProvider>
          <LoadingScreen />
        </ThemeProvider>
      </NativeBaseProvider>
    );
  }

  return (
    <NativeBaseProvider theme={theme}>
      <ThemeProvider>
        <View style={styles.container}>
          <StatusBar style="auto" />
          {isAuthenticated && user ? (
            <DashboardScreen user={user} onLogout={handleLogout} />
          ) : (
            <LoginScreen onLoginSuccess={handleLogin} />
          )}
        </View>
      </ThemeProvider>
    </NativeBaseProvider>
  );
}

const LoadingScreen: React.FC = () => {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.600", "gray.300");

  return (
    <View style={[styles.loadingContainer, { backgroundColor: bgColor }]}>
      <StatusBar style="auto" />
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={[styles.loadingText, { color: textColor }]}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});
