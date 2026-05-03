import React, { useState, useContext, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { apiRequest } from "../services/api";

export default function SignupScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigation.replace("Home");
    }
  }, [user]);

  const handleSignup = async () => {
    if (!username || !phone || !password) {
      Alert.alert("Validation", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest("/signup", "POST", { username, phone, password });
      // If your backend returns a success object, handle it; otherwise assume success
      Alert.alert("Success", "Signup successful! Please login.");
      navigation.replace("Login");
    } catch (error) {
      console.log("Signup error:", error);
      const message = error?.data?.detail || error?.message || "Signup failed. Try again.";
      Alert.alert("Signup failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signup</Text>
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title={loading ? "Signing up..." : "Signup"} onPress={handleSignup} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 10, marginBottom: 15, borderRadius: 8 },
});
