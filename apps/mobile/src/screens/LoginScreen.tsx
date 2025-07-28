import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  Box,
  Text,
  VStack,
  HStack,
  Input,
  Button,
  FormControl,
  Icon,
  useColorModeValue,
  Spinner,
  Divider,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { authService, LoginCredentials, User } from "../services/auth.service";

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});

  // Simple color values for clean theme support with explicit dark mode colors
  const bgColor = useColorModeValue("#ffffff", "#171717");
  const cardBg = useColorModeValue("#ffffff", "#262626");
  const textColor = useColorModeValue("#171717", "#fafafa");
  const textSecondary = useColorModeValue("#64748b", "#94a3b8");
  const borderColor = useColorModeValue("#e2e8f0", "#475569");

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

    if (!credentials.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!credentials.password) {
      newErrors.password = "Password is required";
    } else if (credentials.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await authService.login(credentials);

      // Store user data (you might want to decode JWT to get user info)
      // For now, we'll create a basic user object
      const user = {
        id: 1, // This should come from JWT decode
        name: credentials.email.split("@")[0], // Temporary
        email: credentials.email,
        role: "admin" as const, // This should come from JWT decode
        phone: "",
        isActive: true,
      };

      await authService.storeUserData(user);
      onLoginSuccess(user);
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.message || "An error occurred during login. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: "admin" | "agent" | "coordinator") => {
    const testCredentials = {
      admin: { email: "admin@mothi.com", password: "admin123" },
      agent: { email: "agent@mothi.com", password: "agent123" },
      coordinator: {
        email: "coordinator@mothi.com",
        password: "coordinator123",
      },
    };

    setCredentials(testCredentials[role]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Box flex={1} bg={bgColor} px={6} pt={20} pb={12}>
          {/* Header */}
          <VStack alignItems="center" mb={16}>
            <Box bg="primary.500" p={4} borderRadius="full" mb={6} shadow={4}>
              <Icon as={Ionicons} name="business" size="3xl" color="white" />
            </Box>
            <Text
              fontSize="4xl"
              fontWeight="800"
              color={textColor}
              mb={3}
              textAlign="center"
            >
              Mothi Platform
            </Text>
            <Text
              fontSize="lg"
              color={textSecondary}
              textAlign="center"
              fontWeight="500"
            >
              Sales Management System
            </Text>
          </VStack>

          {/* Login Form */}
          <Box
            bg={cardBg}
            borderRadius="2xl"
            p={8}
            mb={8}
            borderWidth={1}
            borderColor={borderColor}
            shadow={4}
          >
            <VStack alignItems="center" mb={8}>
              <Icon
                as={Ionicons}
                name="lock-closed"
                size="xl"
                color="primary.500"
                mb={3}
              />
              <Text
                fontSize="2xl"
                fontWeight="700"
                color={textColor}
                textAlign="center"
              >
                Welcome Back
              </Text>
              <Text fontSize="sm" color={textSecondary} textAlign="center">
                Sign in to your account
              </Text>
            </VStack>

            <VStack space={6}>
              {/* Email Input */}
              <FormControl isInvalid={!!errors.email}>
                <FormControl.Label>
                  <Text color={textColor} fontWeight="600" fontSize="md">
                    Email Address
                  </Text>
                </FormControl.Label>
                <Input
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChangeText={(text) => {
                    setCredentials({ ...credentials, email: text });
                    if (errors.email)
                      setErrors({ ...errors, email: undefined });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  size="lg"
                  borderRadius="xl"
                  borderColor={errors.email ? "secondary.500" : borderColor}
                  _focus={{
                    borderColor: "primary.500",
                    bg: "background.50",
                    shadow: 2,
                  }}
                  InputLeftElement={
                    <Icon
                      as={Ionicons}
                      name="mail"
                      size="sm"
                      color="secondary.400"
                      ml={3}
                    />
                  }
                />
                <FormControl.ErrorMessage>
                  {errors.email}
                </FormControl.ErrorMessage>
              </FormControl>

              {/* Password Input */}
              <FormControl isInvalid={!!errors.password}>
                <FormControl.Label>
                  <Text color={textColor} fontWeight="600" fontSize="md">
                    Password
                  </Text>
                </FormControl.Label>
                <Input
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChangeText={(text) => {
                    setCredentials({ ...credentials, password: text });
                    if (errors.password)
                      setErrors({ ...errors, password: undefined });
                  }}
                  type="password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  size="lg"
                  borderRadius="xl"
                  borderColor={errors.password ? "secondary.500" : borderColor}
                  _focus={{
                    borderColor: "primary.500",
                    bg: "background.50",
                    shadow: 2,
                  }}
                  InputLeftElement={
                    <Icon
                      as={Ionicons}
                      name="lock-closed"
                      size="sm"
                      color="secondary.400"
                      ml={3}
                    />
                  }
                />
                <FormControl.ErrorMessage>
                  {errors.password}
                </FormControl.ErrorMessage>
              </FormControl>

              {/* Login Button */}
              <Button
                size="lg"
                onPress={handleLogin}
                isLoading={isLoading}
                isLoadingText="Signing In..."
                colorScheme="primary"
                borderRadius="xl"
                py={4}
                mt={4}
                _pressed={{ opacity: 0.8 }}
                shadow={3}
              >
                <HStack space={2} alignItems="center">
                  <Icon as={Ionicons} name="log-in" size="sm" color="white" />
                  <Text fontSize="md" fontWeight="600">
                    Sign In
                  </Text>
                </HStack>
              </Button>
            </VStack>
          </Box>

          {/* Quick Login Buttons */}
          <Box
            bg={cardBg}
            borderRadius="2xl"
            p={6}
            mb={8}
            borderWidth={1}
            borderColor={borderColor}
            shadow={3}
          >
            <VStack alignItems="center" mb={6}>
              <Icon
                as={Ionicons}
                name="flash"
                size="lg"
                color="secondary.500"
                mb={2}
              />
              <Text
                fontSize="lg"
                fontWeight="600"
                color={textColor}
                textAlign="center"
              >
                Quick Login (Development)
              </Text>
              <Text fontSize="sm" color={textSecondary} textAlign="center">
                For testing purposes only
              </Text>
            </VStack>

            <VStack space={3}>
              <Button
                onPress={() => handleQuickLogin("admin")}
                colorScheme="primary"
                variant="solid"
                borderRadius="xl"
                py={3}
                _pressed={{ opacity: 0.8 }}
              >
                <HStack space={2} alignItems="center" justifyContent="center">
                  <Icon as={Ionicons} name="shield" size="sm" color="white" />
                  <Text fontWeight="600">Administrator</Text>
                </HStack>
              </Button>

              <Button
                onPress={() => handleQuickLogin("agent")}
                colorScheme="secondary"
                variant="solid"
                borderRadius="xl"
                py={3}
                _pressed={{ opacity: 0.8 }}
              >
                <HStack space={2} alignItems="center" justifyContent="center">
                  <Icon as={Ionicons} name="person" size="sm" color="white" />
                  <Text fontWeight="600">Sales Agent</Text>
                </HStack>
              </Button>

              <Button
                onPress={() => handleQuickLogin("coordinator")}
                colorScheme="primary"
                variant="outline"
                borderRadius="xl"
                py={3}
                _pressed={{ opacity: 0.8 }}
              >
                <HStack space={2} alignItems="center" justifyContent="center">
                  <Icon
                    as={Ionicons}
                    name="people"
                    size="sm"
                    color="primary.500"
                  />
                  <Text fontWeight="600" color="primary.500">
                    Coordinator
                  </Text>
                </HStack>
              </Button>
            </VStack>
          </Box>

          {/* Footer */}
          <VStack alignItems="center" mt="auto">
            <Divider bg={borderColor} mb={4} />
            <Text
              fontSize="xs"
              color={textSecondary}
              textAlign="center"
              fontWeight="500"
            >
              © 2024 Mothi Platform. All rights reserved.
            </Text>
            <Text fontSize="xs" color={textSecondary} textAlign="center">
              Built with ❤️ for modern businesses
            </Text>
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
