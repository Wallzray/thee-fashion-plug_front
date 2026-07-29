import { Platform } from "react-native";

export const getBaseUrl = (path = "") => {
  let baseUrl = "http://localhost:8000"; 

  if (Platform.OS === "web") {
    baseUrl = "http://localhost:8000"; 
  } else if (Platform.OS === "android") {
    baseUrl = "https://thee-fashion-plug-back.onrender.com"; 
  } else {
    baseUrl = "http://127.0.0.1:8000"; 
  }

  // Safety block: If no valid image path exists anywhere in that record, fallback
  if (!path || typeof path !== "string") {
    return "http://localhost:8000"; 
  }

  if (path.startsWith("/")) {
    return `${baseUrl}${path}`;
  }
  return `${baseUrl}/${path}`;
};

export const BASE_URL = getBaseUrl();

// Render backend URL in console for verification
// https://thee-fashion-plug-back.onrender.com