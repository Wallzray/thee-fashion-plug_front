// src/screens/OrderDetailScreen.js
import React, { useContext, useEffect, useState } from "react";
import {View,Text,FlatList,TouchableOpacity,StyleSheet,Alert,ActivityIndicator, Linking} from "react-native";
import { apiRequest } from "../services/api";
import { AuthContext } from "../context/AuthContext";

const normalizePhone = (rawPhone, countryCode = "256") => {
  if (!rawPhone) return null;
  const digits = rawPhone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith(countryCode)) return digits;
  if (digits.startsWith("0")) return countryCode + digits.slice(1);
  return digits;
};

export default function OrderDetailScreen({ route, navigation }) {
  const { order } = route.params || {};
  const { user } = useContext(AuthContext);
  const [updating, setUpdating] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      Alert.alert("Access denied", "You must be an admin to view this page.");
      navigation.replace("MainTabs");
    }
    if (!order) {
      Alert.alert("Missing data", "Order data is missing.");
      navigation.goBack();
    }
  }, [user, order, navigation]);

  if (!order) return null;

  const updateStatus = async (status) => {
    try {
      setUpdating(true);
      const response = await apiRequest(`/orders/${order.id}/status`, "PUT", { status });
      Alert.alert("Success", `Order updated to ${response?.status ?? status}`);
      navigation.goBack();
    } catch (error) {
      console.log("Error updating status:", error);
      Alert.alert("Update failed", error?.data?.detail || error?.message || "Could not update order");
    } finally {
      setUpdating(false);
    }
  };

  const sendWhatsAppServer = async () => {
    const normalized = normalizePhone(order.phone);
    if (!normalized) {
      Alert.alert("Invalid phone", "Customer phone number is missing or invalid.");
      return;
    }

    try {
      setSendingWhatsApp(true);
      await apiRequest(`/orders/${order.id}/notify_whatsapp`, "POST");
      Alert.alert("Sent", "WhatsApp confirmation sent successfully.");
    } catch (err) {
      console.error("Notify WhatsApp error:", err);
      const message = err?.data?.detail || err?.message || "Could not send WhatsApp message.";
      Alert.alert("Failed to send", message);
    } finally {
      setSendingWhatsApp(false);
    }
  };

  // Deep link fallback (opens WhatsApp on admin device with prefilled message)
  const sendWhatsAppDeepLink = async () => {
    const normalized = normalizePhone(order.phone);
    if (!normalized) {
      Alert.alert("Invalid phone", "Customer phone number is missing or invalid.");
      return;
    }

    const message = `Hello ${order.full_name},
      Your order #${order.id} has been updated.
      Items:
      ${(order.items || []).map((i) => `- ${i.name} x${i.quantity}`).join("\n")}
      Total: UGX ${order.total_amount}
      Status: ${order.status}
      Thank you for shopping with Thee Fabric.`;

    const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("WhatsApp not available", "WhatsApp is not installed on this device.");
        return;
      }
      await Linking.openURL(url);
    } catch (err) {
      console.error("WhatsApp link error:", err);
      Alert.alert("Error", "Could not open WhatsApp.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order #{order.id}</Text>
      <Text>Customer: {order.full_name}</Text>
      <Text>Phone: {order.phone}</Text>
      <Text>Address: {order.address}</Text>
      <Text>Total: UGX {order.total_amount}</Text>
      <Text>Status: {order.status}</Text>

      <Text style={styles.sectionTitle}>Items</Text>
      <FlatList
        data={Array.isArray(order.items) ? order.items : []}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        renderItem={({ item }) => (
          <Text>{item.product_name} (x{item.quantity}) - UGX {item.price} -
          Size: {item.size} | Variation: {item.variation}
          </Text>
        )}
        ListEmptyComponent={<Text>No items</Text>}
      />

      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.btn, { minWidth: 120 }]}
          onPress={() => updateStatus("confirmed")}
          disabled={updating}
        >
          {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Confirm</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { minWidth: 120 }]}
          onPress={() => updateStatus("shipped")}
          disabled={updating}
        >
          {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Mark Shipped</Text>}
        </TouchableOpacity>
      </View>

      <View style={{ height: 16 }} />

      {/* WhatsApp actions */}
      <Text style={styles.sectionTitle}>Notifications</Text>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#25D366", marginBottom: 10 }]}
        onPress={sendWhatsAppServer}
        disabled={sendingWhatsApp}
      >
        {sendingWhatsApp ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send WhatsApp (Server)</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#128C7E" }]}
        onPress={sendWhatsAppDeepLink}
      >
        <Text style={styles.btnText}>Open WhatsApp (Deep Link)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  btnRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 20 },
  btn: { backgroundColor: "black", padding: 12, borderRadius: 6, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600" },
});
