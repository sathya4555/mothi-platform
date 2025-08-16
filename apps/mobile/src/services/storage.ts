import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // ignore
      }
    }
    await AsyncStorage.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch {
        // ignore
      }
    }
    await AsyncStorage.removeItem(key);
  },

  async multiRemove(keys: string[]): Promise<void> {
    if (Platform.OS === "web") {
      try {
        keys.forEach((k) => window.localStorage.removeItem(k));
        return;
      } catch {
        // ignore
      }
    }
    await AsyncStorage.multiRemove(keys);
  },
};
