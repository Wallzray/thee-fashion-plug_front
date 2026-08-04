// src/context/AuthContext.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useState } from "react";
import { apiRequest } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (userData, cartItems = []) => {
    const toStore = {
      id: userData.id,
      username: userData.username,
      role: userData.role,
      token: userData.token,
    };
    setUser(toStore);

    // Persist token for api.js
    await AsyncStorage.setItem("authToken", userData.token);

    try {
      for (const item of cartItems) {
        await apiRequest("/cart", "POST", {
          product_id: item.id,
          size: item.size,
          quantity: item.quantity,
        });
      }
    } catch (err) {
      console.warn("Failed to merge guest cart", err);
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("authToken");
  };

  const clearStorageForDev = async () => {
    setUser(null);
    await AsyncStorage.removeItem("authToken");
    console.log("AuthProvider: cleared stored user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, clearStorageForDev }}>
      {children}
    </AuthContext.Provider>
  );
};
