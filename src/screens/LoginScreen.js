// src/screens/LoginScreen.js
import React, { useState, useEffect, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { apiRequest } from "../services/api";


export default function LoginScreen({ navigation }) {
  const { user, login, isReady } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  console.log("LoginScreen render start");
  console.log("AuthContext login:", typeof login);
  console.log("apiRequest:", typeof apiRequest);
  
  useEffect(() => {
    // Wait for AuthContext to finish restoring stored user if isReady exists
    if (typeof isReady !== "undefined" && !isReady) return;
    
    if (user) {
      if (user.role === "admin") navigation.replace("AdminStack", { screen: "AdminOrders" });
      else if (user.role === "vendor") navigation.replace("VendorUpload");
      else navigation.replace("MainTabs");
    }
  }, [isReady, user, navigation]);

  
  const handleLogin = async () => {
  if (!username || !password) {
    Alert.alert("Validation", "Please enter both username and password");
    return;
  }

  try {
    const data = await apiRequest("/login", "POST", { username, password });
    console.log("Login response:", data);

    const token = data.token ?? data.accessToken ?? null;
    if (!token) {
      Alert.alert("Login error", "Server did not return an auth token.");
      return;
    }

    const userPayload = {
      id: data.user_id ?? data.id,
      username: data.username ?? username,
      role: data.role ?? "customer",
      token,
    };

    // Removed AsyncStorage.setItem — we now keep login state only in memory
    await login(userPayload);

    if (userPayload.role === "vendor") {
      navigation.replace("VendorUpload");
    } else if (userPayload.role === "admin") {
      navigation.replace("AdminStack", { screen: "AdminOrders" });
    } else {
      navigation.replace("MainTabs");
    }
  } catch (err) {
    console.log("Login error:", err);
    Alert.alert("Login failed", err?.message || "Invalid credentials");
  }
};

  return (
    <View style={styles.container}>
      {/* safe background placeholder to avoid require errors */}
      <View style={[styles.background, { backgroundColor: "#8f96ee" }]} />
      <View style={styles.dim} />
      <View style={styles.overlay}>
        <Text style={styles.title}>Login</Text>
        <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <Button title="Login" onPress={handleLogin} />
        <Button title="Go to Signup" onPress={() => navigation.navigate("Signup")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 10 },
  background: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 },
  dim: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)", zIndex: 1 },
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", zIndex: 2, paddingHorizontal: 10, height: "80%", width: "100%" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#fff" },
  input: { width: "60%", height: 40, borderColor: "gray", borderWidth: 1, marginBottom: 15, paddingHorizontal: 10, color: "#000", backgroundColor: "#fff" },
});
