import React from "react";
import { Navigation } from "./src/navigation";
import { AuthProvider } from "./src/context/AuthContext";
import { NativeBaseProvider } from "native-base";
import { ThemeProvider } from "./src/theme/ThemeContext";
import { theme } from "./src/theme";

export default function App() {
  return (
    <NativeBaseProvider theme={theme}>
      <ThemeProvider>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </ThemeProvider>
    </NativeBaseProvider>
  );
}
