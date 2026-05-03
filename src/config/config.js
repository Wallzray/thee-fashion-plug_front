import { Platform } from "react-native";

const getBaseUrl = () => {
  if (Platform.OS === "web") {
    return "https://thee-fashion-plug-back.onrender.com"; // Deployed backend URL
  }

  if (Platform.OS === "android") {
    return "https://thee-fashion-plug-back.onrender.com"; // Android emulator
  }

  return "https://thee-fashion-plug-back.onrender.com"; // Physical device or iOS simulator
};

export const BASE_URL = getBaseUrl();