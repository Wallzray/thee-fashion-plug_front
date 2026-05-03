import React, { useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

export default function OrderConfirmationScreen({ route, navigation }) {
  const { order } = route.params || {};

  useEffect(() => {
    if (!order) {
      Alert.alert("Missing order", "No order details available. Returning to home.");
      // Make sure this route name matches your navigator setup
      navigation.replace("MainTabs"); 
    }
  }, [order]);

  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LottieView
        source={require("../../assets/lottie/success.json")}
        autoPlay
        loop={false}
        style={styles.animation}
      />

      <Ionicons name="checkmark-circle" size={80} color="green" style={{ marginBottom: 20 }} />

      <Text style={styles.title}>Order Confirmed!</Text>
      <Text style={styles.subtitle}>Thank you for shopping with Thee Fabric 👗</Text>

      <Text style={styles.orderId}>Order ID: {order.order_id ?? order.id ?? "N/A"}</Text>

      <Text style={styles.sectionTitle}>🛒 Items</Text>
      
      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item.product_id}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image
              source={{ uri: item.image_url }}
              style={styles.productImage}
              resizeMode="cover"
            />
            <Text>
              {item.product_name} (x{item.quantity}, size {item.size}) - UGX {item.price}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text>No items found for this order.</Text>}
      />

      <Text style={styles.total}>Total Paid: UGX {order.total_amount ?? "N/A"}</Text>

      <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate("Home")}>
        <Text style={styles.homeBtnText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff"},
  content: { alignItems: "center", justifyContent: "center" },
  animation: { width: 150, height: 150, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 10, color: "green" },
  subtitle: { fontSize: 16, marginBottom: 20 },
  orderId: { fontSize: 16, fontWeight: "bold", marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  item: { flexDirection: "row", alignItems: "center", marginBottom: 10 }, // merged duplicate definitions
  total: { fontSize: 18, fontWeight: "bold", marginVertical: 15 },
  homeBtn: { backgroundColor: "black", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 20 },
  homeBtnText: { color: "#fff", fontWeight: "bold" },
  productImage: { width: 60, height: 60, marginRight: 10, borderRadius: 8 },
});
