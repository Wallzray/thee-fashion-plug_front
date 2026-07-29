import 'react-native-get-random-values'
import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { apiRequest } from "../services/api";

// If your backend returns full image URL in `image`, use that field
const safeImage = (item) => item.image_url || "";

export default function CartScreen({ navigation }) {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/cart", "GET"); // returns parsed data or throws
      // defensive checks
      setCart(Array.isArray(data?.items) ? data.items : []);
      setTotal(data?.total_amount ?? 0);
    } catch (error) {
      console.log("Error fetching cart:", error);
      Alert.alert("Network error", error?.message || "Could not load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  const handleDelete = async (itemId) => {
    try {
      await apiRequest(`/cart/${itemId}`, "DELETE");
      fetchCart();
    } catch (error) {
      console.log("Delete error:", error);
      Alert.alert("Delete failed", error?.message || "Could not remove item");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: safeImage(item) }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text>Size: {item.size}</Text>
        <Text>Qty: {item.quantity}</Text>
        <Text>Variation: {item.variation}</Text>
        <Text style={styles.price}>UGX {item.price}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Ionicons name="trash" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (cart.length === 0) return <View style={styles.center}><Text>Your cart is empty</Text></View>;

  return (
    <View style={styles.container}>
      <FlatList data={cart} keyExtractor={(item) => item.id.toString()} renderItem={renderItem} />
      <View style={styles.footer}>
        <Text style={styles.total}>Total: UGX {total}</Text>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate("Checkout")}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  card: { flexDirection: "row", backgroundColor: "#fff", padding: 10, marginBottom: 10, borderRadius: 10, elevation: 2, alignItems: "center" },
  image: { width: 70, height: 70, borderRadius: 8, marginRight: 10 },
  info: { flex: 1 },
  name: { fontWeight: "bold", fontSize: 16 },
  price: { marginTop: 5, fontWeight: "bold" },
  footer: { paddingVertical: 15, borderTopWidth: 1, borderColor: "#ddd" },
  total: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  checkoutBtn: { backgroundColor: "black", padding: 15, borderRadius: 8, alignItems: "center" },
  checkoutText: { color: "#fff", fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});