import React from "react";
import { HStack, IconButton, Icon, useColorModeValue } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const iconColor = useColorModeValue("gray.800", "gray.200");
  const bgColor = useColorModeValue("gray.100", "gray.800");

  return (
    <IconButton
      icon={
        <Icon
          as={Ionicons}
          name={isDarkMode ? "sunny" : "moon"}
          size="sm"
          color={iconColor}
        />
      }
      onPress={toggleTheme}
      variant="ghost"
      _pressed={{
        bg: bgColor,
      }}
      accessibilityLabel={
        isDarkMode ? "Switch to light mode" : "Switch to dark mode"
      }
    />
  );
};
