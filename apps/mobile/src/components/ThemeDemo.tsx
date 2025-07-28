import React from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  Switch,
  Checkbox,
  Radio,
  Select,
  TextArea,
  useColorModeValue,
  Divider,
  Icon,
  ScrollView,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

export const ThemeDemo: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const bgColor = useColorModeValue("background.50", "background.100");
  const cardBg = useColorModeValue("background.50", "background.200");
  const textColor = useColorModeValue("text.900", "text.50");
  const textSecondary = useColorModeValue("text.400", "text.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box flex={1} bg={bgColor}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space={6} p={6}>
          {/* Header */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="2xl"
            borderWidth={1}
            borderColor={borderColor}
            shadow={3}
          >
            <VStack alignItems="center" space={4}>
              <Icon
                as={Ionicons}
                name={isDarkMode ? "moon" : "sunny"}
                size="2xl"
                color={isDarkMode ? "accent.400" : "warning.500"}
              />
              <Text
                fontSize="2xl"
                fontWeight="800"
                color={textColor}
                textAlign="center"
              >
                Theme Showcase
              </Text>
              <Text color={textSecondary} textAlign="center" fontSize="md">
                Current theme: {isDarkMode ? "Dark" : "Light"} Mode
              </Text>
              <Button
                onPress={toggleTheme}
                colorScheme="primary"
                size="lg"
                borderRadius="xl"
                px={8}
                _pressed={{ opacity: 0.8 }}
              >
                <HStack space={2} alignItems="center">
                  <Icon
                    as={Ionicons}
                    name="color-palette"
                    size="sm"
                    color="white"
                  />
                  <Text fontWeight="600">Toggle Theme</Text>
                </HStack>
              </Button>
            </VStack>
          </Box>

          {/* Color Palette */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="2xl"
            borderWidth={1}
            borderColor={borderColor}
            shadow={3}
          >
            <VStack space={4}>
              <HStack alignItems="center" space={2}>
                <Icon
                  as={Ionicons}
                  name="color-palette"
                  size="lg"
                  color="primary.500"
                />
                <Text fontSize="xl" fontWeight="700" color={textColor}>
                  Color Palette
                </Text>
              </HStack>

              <VStack space={4}>
                {/* Primary Colors */}
                <VStack space={2}>
                  <Text fontSize="lg" fontWeight="600" color={textColor}>
                    Primary Colors
                  </Text>
                  <HStack space={3} flexWrap="wrap">
                    <VStack alignItems="center" space={1}>
                      <Box
                        bg="primary.500"
                        w={12}
                        h={12}
                        borderRadius="xl"
                        shadow={2}
                      />
                      <Text
                        fontSize="xs"
                        color={textSecondary}
                        fontWeight="500"
                      >
                        Primary
                      </Text>
                    </VStack>
                    <VStack alignItems="center" space={1}>
                      <Box
                        bg="info.500"
                        w={12}
                        h={12}
                        borderRadius="xl"
                        shadow={2}
                      />
                      <Text
                        fontSize="xs"
                        color={textSecondary}
                        fontWeight="500"
                      >
                        Info
                      </Text>
                    </VStack>
                    <VStack alignItems="center" space={1}>
                      <Box
                        bg="accent.500"
                        w={12}
                        h={12}
                        borderRadius="xl"
                        shadow={2}
                      />
                      <Text
                        fontSize="xs"
                        color={textSecondary}
                        fontWeight="500"
                      >
                        Accent
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>

                {/* Semantic Colors */}
                <VStack space={2}>
                  <Text fontSize="lg" fontWeight="600" color={textColor}>
                    Semantic Colors
                  </Text>
                  <HStack space={3} flexWrap="wrap">
                    <VStack alignItems="center" space={1}>
                      <Box
                        bg="success.500"
                        w={12}
                        h={12}
                        borderRadius="xl"
                        shadow={2}
                      />
                      <Text
                        fontSize="xs"
                        color={textSecondary}
                        fontWeight="500"
                      >
                        Success
                      </Text>
                    </VStack>
                    <VStack alignItems="center" space={1}>
                      <Box
                        bg="error.500"
                        w={12}
                        h={12}
                        borderRadius="xl"
                        shadow={2}
                      />
                      <Text
                        fontSize="xs"
                        color={textSecondary}
                        fontWeight="500"
                      >
                        Error
                      </Text>
                    </VStack>
                    <VStack alignItems="center" space={1}>
                      <Box
                        bg="warning.500"
                        w={12}
                        h={12}
                        borderRadius="xl"
                        shadow={2}
                      />
                      <Text
                        fontSize="xs"
                        color={textSecondary}
                        fontWeight="500"
                      >
                        Warning
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>

                {/* Neutral Colors */}
                <VStack space={2}>
                  <Text fontSize="lg" fontWeight="600" color={textColor}>
                    Neutral Colors
                  </Text>
                  <HStack space={2} flexWrap="wrap">
                    <VStack alignItems="center" space={1}>
                      <Box
                        bg="gray.100"
                        w={8}
                        h={8}
                        borderRadius="lg"
                        borderWidth={1}
                        borderColor={borderColor}
                      />
                      <Text fontSize="xs" color={textSecondary}>
                        100
                      </Text>
                    </VStack>
                    <VStack alignItems="center" space={1}>
                      <Box
                        bg="gray.300"
                        w={8}
                        h={8}
                        borderRadius="lg"
                        borderWidth={1}
                        borderColor={borderColor}
                      />
                      <Text fontSize="xs" color={textSecondary}>
                        300
                      </Text>
                    </VStack>
                    <VStack alignItems="center" space={1}>
                      <Box
                        bg="gray.500"
                        w={8}
                        h={8}
                        borderRadius="lg"
                        borderWidth={1}
                        borderColor={borderColor}
                      />
                      <Text fontSize="xs" color={textSecondary}>
                        500
                      </Text>
                    </VStack>
                    <VStack alignItems="center" space={1}>
                      <Box
                        bg="gray.700"
                        w={8}
                        h={8}
                        borderRadius="lg"
                        borderWidth={1}
                        borderColor={borderColor}
                      />
                      <Text fontSize="xs" color={textSecondary}>
                        700
                      </Text>
                    </VStack>
                    <VStack alignItems="center" space={1}>
                      <Box
                        bg="gray.900"
                        w={8}
                        h={8}
                        borderRadius="lg"
                        borderWidth={1}
                        borderColor={borderColor}
                      />
                      <Text fontSize="xs" color={textSecondary}>
                        900
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </VStack>
            </VStack>
          </Box>

          {/* Form Elements */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="2xl"
            borderWidth={1}
            borderColor={borderColor}
            shadow={3}
          >
            <VStack space={4}>
              <HStack alignItems="center" space={2}>
                <Icon
                  as={Ionicons}
                  name="create"
                  size="lg"
                  color="primary.500"
                />
                <Text fontSize="xl" fontWeight="700" color={textColor}>
                  Form Elements
                </Text>
              </HStack>

              <VStack space={4}>
                <Input
                  placeholder="Enter text here"
                  size="lg"
                  borderRadius="xl"
                  InputLeftElement={
                    <Icon
                      as={Ionicons}
                      name="text"
                      size="sm"
                      color="gray.400"
                      ml={3}
                    />
                  }
                />
                <Input
                  placeholder="Enter multiline text"
                  size="lg"
                  borderRadius="xl"
                  InputLeftElement={
                    <Icon
                      as={Ionicons}
                      name="document-text"
                      size="sm"
                      color="gray.400"
                      ml={3}
                    />
                  }
                />
                <Select
                  placeholder="Select an option"
                  size="lg"
                  borderRadius="xl"
                >
                  <Select.Item label="Option 1" value="1" />
                  <Select.Item label="Option 2" value="2" />
                  <Select.Item label="Option 3" value="3" />
                </Select>
                <HStack space={6} alignItems="center" flexWrap="wrap">
                  <Checkbox value="demo" colorScheme="primary">
                    <Text color={textColor} fontWeight="500">
                      Checkbox
                    </Text>
                  </Checkbox>
                  <Radio value="demo" colorScheme="primary">
                    <Text color={textColor} fontWeight="500">
                      Radio
                    </Text>
                  </Radio>
                  <HStack space={2} alignItems="center">
                    <Switch colorScheme="primary" />
                    <Text color={textColor} fontWeight="500">
                      Switch
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            </VStack>
          </Box>

          {/* Buttons */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="2xl"
            borderWidth={1}
            borderColor={borderColor}
            shadow={3}
          >
            <VStack space={4}>
              <HStack alignItems="center" space={2}>
                <Icon as={Ionicons} name="apps" size="lg" color="primary.500" />
                <Text fontSize="xl" fontWeight="700" color={textColor}>
                  Buttons
                </Text>
              </HStack>

              <VStack space={4}>
                <HStack space={3} flexWrap="wrap">
                  <Button
                    colorScheme="primary"
                    borderRadius="xl"
                    _pressed={{ opacity: 0.8 }}
                  >
                    <HStack space={1} alignItems="center">
                      <Icon
                        as={Ionicons}
                        name="checkmark"
                        size="sm"
                        color="white"
                      />
                      <Text fontWeight="600">Primary</Text>
                    </HStack>
                  </Button>
                  <Button
                    colorScheme="success"
                    borderRadius="xl"
                    _pressed={{ opacity: 0.8 }}
                  >
                    <HStack space={1} alignItems="center">
                      <Icon
                        as={Ionicons}
                        name="checkmark-circle"
                        size="sm"
                        color="white"
                      />
                      <Text fontWeight="600">Success</Text>
                    </HStack>
                  </Button>
                  <Button
                    colorScheme="error"
                    borderRadius="xl"
                    _pressed={{ opacity: 0.8 }}
                  >
                    <HStack space={1} alignItems="center">
                      <Icon
                        as={Ionicons}
                        name="close"
                        size="sm"
                        color="white"
                      />
                      <Text fontWeight="600">Error</Text>
                    </HStack>
                  </Button>
                </HStack>

                <HStack space={3} flexWrap="wrap">
                  <Button
                    colorScheme="warning"
                    borderRadius="xl"
                    _pressed={{ opacity: 0.8 }}
                  >
                    <HStack space={1} alignItems="center">
                      <Icon
                        as={Ionicons}
                        name="warning"
                        size="sm"
                        color="white"
                      />
                      <Text fontWeight="600">Warning</Text>
                    </HStack>
                  </Button>
                  <Button
                    colorScheme="accent"
                    borderRadius="xl"
                    _pressed={{ opacity: 0.8 }}
                  >
                    <HStack space={1} alignItems="center">
                      <Icon as={Ionicons} name="star" size="sm" color="white" />
                      <Text fontWeight="600">Accent</Text>
                    </HStack>
                  </Button>
                  <Button
                    variant="outline"
                    borderRadius="xl"
                    _pressed={{ opacity: 0.8 }}
                  >
                    <HStack space={1} alignItems="center">
                      <Icon
                        as={Ionicons}
                        name="ellipse-outline"
                        size="sm"
                        color="primary.500"
                      />
                      <Text fontWeight="600" color="primary.500">
                        Outline
                      </Text>
                    </HStack>
                  </Button>
                </HStack>
              </VStack>
            </VStack>
          </Box>

          {/* Typography */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="2xl"
            borderWidth={1}
            borderColor={borderColor}
            shadow={3}
          >
            <VStack space={4}>
              <HStack alignItems="center" space={2}>
                <Icon as={Ionicons} name="text" size="lg" color="primary.500" />
                <Text fontSize="xl" fontWeight="700" color={textColor}>
                  Typography
                </Text>
              </HStack>

              <VStack space={3}>
                <Text fontSize="4xl" fontWeight="800" color={textColor}>
                  Heading 4XL
                </Text>
                <Text fontSize="3xl" fontWeight="700" color={textColor}>
                  Heading 3XL
                </Text>
                <Text fontSize="2xl" fontWeight="600" color={textColor}>
                  Heading 2XL
                </Text>
                <Text fontSize="xl" color={textColor}>
                  Large text
                </Text>
                <Text fontSize="lg" color={textColor}>
                  Medium text
                </Text>
                <Text fontSize="md" color={textSecondary}>
                  Regular text
                </Text>
                <Text fontSize="sm" color={textSecondary}>
                  Small text
                </Text>
                <Text fontSize="xs" color={textSecondary}>
                  Extra small text
                </Text>
              </VStack>
            </VStack>
          </Box>

          {/* Theme Info */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="2xl"
            borderWidth={1}
            borderColor={borderColor}
            shadow={3}
          >
            <VStack space={4}>
              <HStack alignItems="center" space={2}>
                <Icon
                  as={Ionicons}
                  name="information-circle"
                  size="lg"
                  color="info.500"
                />
                <Text fontSize="xl" fontWeight="700" color={textColor}>
                  Theme Information
                </Text>
              </HStack>

              <VStack space={3}>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text color={textColor} fontWeight="500">
                    Current Mode:
                  </Text>
                  <Text
                    color={isDarkMode ? "accent.400" : "warning.500"}
                    fontWeight="600"
                  >
                    {isDarkMode ? "Dark" : "Light"}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text color={textColor} fontWeight="500">
                    Background:
                  </Text>
                  <Text color={textSecondary}>
                    {isDarkMode ? "Dark Gray" : "White"}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text color={textColor} fontWeight="500">
                    Text Color:
                  </Text>
                  <Text color={textSecondary}>
                    {isDarkMode ? "Light Gray" : "Dark Gray"}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text color={textColor} fontWeight="500">
                    Primary Color:
                  </Text>
                  <Text color="primary.500" fontWeight="600">
                    Sky Blue
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </ScrollView>
    </Box>
  );
};
