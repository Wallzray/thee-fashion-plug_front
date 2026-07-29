import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { apiRequest } from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function AdminOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await apiRequest("/orders", "GET", null, { token: user?.token });
        setOrders(data);
      } catch (error) {
        console.log("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Order #{item.id}</Text>
      <Text>Customer: {item.full_name} || Client</Text>
      <Text>Phone: {item.phone}</Text>
      <Text>Status: {item.status}</Text>
      <Text style={styles.amount}>UGX {item?.total_amount?.toLocaleString() || "0"}</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("OrderDetail", { order: item })}
      >
        <Text style={styles.btnText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={orders}
      keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", padding: 15, marginBottom: 10, borderRadius: 8 },
  title: { fontWeight: "bold", fontSize: 18, marginBottom: 5 },
  btn: { backgroundColor: "black", padding: 10, borderRadius: 5, marginTop: 10 },
  btnText: { color: "#fff", textAlign: "center" },
});
