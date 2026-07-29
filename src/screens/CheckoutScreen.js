import React, { useState, useEffect } from "react";
import {View,Text,FlatList,TextInput,Button,StyleSheet,ActivityIndicator,Alert,} from "react-native";
import { apiRequest } from "../services/api";
import { useNavigation } from "@react-navigation/native";

// Replace with your backend endpoint that creates Pesapal orders


export default function CheckoutScreen({ navigation }) {
  const nav = useNavigation();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Buyer info
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchCart = async () => {
      try {
        setLoading(true);
        const data = await apiRequest("/cart", "GET");
        if (!mounted) return;
        setCart(Array.isArray(data?.items) ? data.items : []);
        setTotal(data?.total_amount ?? 0);
      } catch (error) {
        console.log("Error fetching cart:", error);
        Alert.alert("Error", error?.data?.detail || error?.message || "Could not load cart");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCart();
    return () => {
      mounted = false;
    };
  }, []);

  // Helper: build merchant reference (unique per order)
  const buildMerchantReference = () => {
    // Use timestamp + random suffix; you can replace with your own order id
    return `ORDER-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  };




  // Create Pesapal order on backend and open payment page
  const handleCheckout = async () => {
  if (!fullName.trim() || !phone.trim() || !address.trim()) {
    Alert.alert("Validation", "Please fill in all contact info");
    return;
  }

  if (!cart || cart.length === 0) {
    Alert.alert("Cart empty", "Your cart is empty. Add items before checking out.");
    return;
  }

  try {
    setSubmitting(true);

    // CREATE ORDER FIRST (your backend requires this)
    const checkoutResp = await apiRequest("/checkout", "POST", {
      full_name: fullName,
      phone,
      address,
      total_amount: total,
    });

    const orderId = checkoutResp?.order_id || checkoutResp?.orderId || checkoutResp?.id;

    const checkoutPayload = {
      full_name: fullName,
      phone: phone,
      address: address,
      total_amount: total,
    };

    if (!orderId) {
      Alert.alert("Error", "Order ID missing from checkout response");
      return;
    }

    //CALL PESAPAL CREATE-ORDER WITH { order_id }
    const pesapalResp = await apiRequest("/checkout", "POST", checkoutPayload);

    const paymentUrl =
      pesapalResp?.payment_url ||
      pesapalResp?.checkout_url;

    const targetUrl = pesapalResp.payment_url || pesapalResp.raw?.redirect_url;

    const orderTrackingId =
      pesapalResp?.orderTrackingId ||
      pesapalResp?.order_tracking_id;

    const merchant_reference =
      pesapalResp?.merchant_reference ||
      checkoutResp?.merchant_reference ||
      `ORDER-${orderId}`;

    if (!paymentUrl) {
      Alert.alert("Error", "Backend did not return a payment URL");
      return;
    }
    console.log("🚨 RAW BACKEND CHECKOUT RESPONSE:", JSON.stringify(pesapalResp, null, 2));

    // NAVIGATE TO PAYMENT WEBVIEW
    navigation.navigate("PaymentWebView", {
      url: targetUrl,
      orderId: pesapalResp.order_id,
      paymentUrl,
      merchant_reference,
      orderId,
      orderTrackingId,
    });

  } catch (error) {
    
    console.log("Checkout error:", error);
    const message =
      error?.data?.detail ||
      error?.message ||
      "Checkout failed. Try again.";
    Alert.alert("Checkout failed", message);
  } finally {
    setSubmitting(false);
  }
};


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🛒 Product Summary</Text>

      {cart.length === 0 ? (
        <View style={styles.center}>
          <Text>Your cart is empty</Text>
        </View>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text>
                {item.name} (x{item.quantity}) - UGX {item.price}
              </Text>
            </View>
          )}
        />
      )}

      <Text style={styles.sectionTitle}>📞 Contact Info</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.sectionTitle}>💳 Payment</Text>
      <Text style={styles.total}>Total: UGX {total}</Text>

      <View style={{ marginTop: 10 }}>
        <Button
          title={submitting ? "Processing..." : "Confirm & Pay"}
          onPress={handleCheckout}
          disabled={submitting || cart.length === 0}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  item: { marginBottom: 5 },
  input: {borderWidth: 1,borderColor: "#ddd",padding: 10,marginBottom: 10,borderRadius: 8,},
  total: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
