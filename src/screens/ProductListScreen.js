import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useContext, useEffect, useState, useMemo } from "react";
import { 
  ActivityIndicator, 
  FlatList, 
  Image, 
  Modal, 
  Platform, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  useWindowDimensions, 
  View 
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { apiRequest } from "../services/api";

const BASE_URL = "https://thee-fashion-plug-back.onrender.com";

export default function ProductsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { width: screenWidth } = useWindowDimensions();
  
  // 1. All States
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedVariation, setSelectedVariation] = useState("");
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  // 2. Fetch Logic with Safety Guard
  const fetchProducts = async (category = "") => {
    try {
      setLoading(true);
      const url = category
        ? `${BASE_URL}/products?category=${encodeURIComponent(category)}`
        : `${BASE_URL}/products`;

      const response = await fetch(url);
      const data = await response.json();

      console.log("RAW DATA FROM SERVER:", data);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch products error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    setIsClient(true);
    fetchProducts();
  }, []);

  // 3. Grouping Logic with Safety Guard
  // useMemo prevents this from recalculating unless products change
  const grouped = useMemo(() => {
    if (!Array.isArray(products)) return {};
    return products.reduce((acc, product) => {
      const cat = product?.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    }, {});
  }, [products]);

  if (!isClient) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  const CARD_WIDTH = screenWidth - 40;
  const IMAGE_WIDTH = CARD_WIDTH - 30;

  // 4. Render Item Function
  const renderProductCard = ({ item }) => {
    if (!item) return null; // Safety guard

    const images = Array.isArray(item.image)
      ? item.image
      : typeof item.image === "string"
      ? item.image.split(",").map((img) => img.trim())
      : [];

    return (
      <View style={[styles.card, { width: CARD_WIDTH }]}>
        <View style={{ height: 200, width: IMAGE_WIDTH, overflow: 'hidden', alignSelf: 'center' }}>
          {images.length > 0 ? (
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              snapToInterval={IMAGE_WIDTH}
              decelerationRate="fast"
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item: imageUrl }) => (
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: IMAGE_WIDTH, height: 200, borderRadius: 10, resizeMode: "cover" }}
                />
              )}
            />
          ) : (
            <View style={{ width: '100%', height: 200, backgroundColor: "#eee", borderRadius: 10 }} />
          )}
        </View>

        <Text style={styles.name}>{item.name || "Unnamed Product"}</Text>
        <Text style={styles.categoryText}>{item.category || "General"}</Text>
        <Text style={styles.price}>UGX {item.price || "0"}</Text>

        <View style={styles.cardFooter}>
          <TouchableOpacity onPress={() => handleWishlistPress(item)}>
            <Ionicons name="heart-outline" size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setSelectedProduct(item);
              setSelectedSize("");
              setSelectedVariation("");
              setQuantity("");
              setCartModalVisible(true);
            }}
          >
            <Ionicons name="cart-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 5. Action Handlers (Kept from your original)
  const handleWishlistPress = (item) => user ? addToWishlist(item) : navigation.navigate("Login");

  const addToWishlist = async (product) => {
    try {
      await apiRequest("/wishlist/add", "POST", { product_id: product.id });
      alert("Added to wishlist!");
    } catch (error) { console.error(error); }
  };

  const addToCart = async () => {
    if (!selectedSize) return alert("Please select a size");
    try {
      const formData = new FormData();
      formData.append("product_id", selectedProduct.id);
      formData.append("size", selectedSize);
      formData.append("quantity", quantity || "1");
      formData.append("variation", selectedVariation || "Standard");

      await apiRequest("/cart", "POST", formData);
      alert("Added to cart!");
      setCartModalVisible(false);
    } catch (error) { console.error(error); }
  };

  // 6. Main UI
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterVisible(true)}>
        <Text style={{ color: "white" }}>Filter</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={Object.keys(grouped)}
          keyExtractor={(cat) => cat}
          renderItem={({ item: category }) => (
            <View style={styles.categoryBlock}>
              <Text style={styles.categoryTitle}>{category}</Text>
              <FlatList
                data={grouped[category]}
                keyExtractor={(prod) => prod.id.toString()}
                renderItem={renderProductCard}
                scrollEnabled={false} // Nested FlatLists should usually have one handling scroll
              />
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No products available.</Text>}
        />
      )}

      {/* Modals remain essentially the same but ensure they use the new styles */}
      <Modal visible={filterVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Filter by Category</Text>
                <Picker
                    selectedValue={selectedCategory}
                    onValueChange={(v) => setSelectedCategory(v)}
                    style={styles.picker}
                >
                    <Picker.Item label="All Categories" value="" />
                    <Picker.Item label="Tshirts" value="Tshirts" />
                    <Picker.Item label="Capes" value="Capes" />
                    <Picker.Item label="Vests" value="Vests" />
                    <Picker.Item label="Shorts" value="Shorts" />
                    <Picker.Item label="Jackets" value="Jackets" />
                </Picker>
                <TouchableOpacity style={styles.applyBtn} onPress={() => { fetchProducts(selectedCategory); setFilterVisible(false); }}>
                    <Text style={{ color: "white" }}>Apply</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilterVisible(false)}>
                    <Text style={{ marginTop: 15, textAlign: 'center' }}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      {/* Add To Cart Modal (Simplified for brevity) */}
      <Modal visible={cartModalVisible} transparent animationType="fade">
          <View style={styles.modalContainer}>
              <View style={styles.modalBox}>
                  <Text style={styles.modalTitle}>{selectedProduct?.name}</Text>
                  <TextInput 
                    placeholder="Qty" 
                    value={quantity} 
                    onChangeText={setQuantity} 
                    keyboardType="numeric" 
                    style={styles.input} 
                  />
                  <TouchableOpacity style={styles.applyBtn} onPress={addToCart}>
                      <Text style={{ color: "white" }}>Add to Cart</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setCartModalVisible(false)}>
                      <Text style={{ marginTop: 15, textAlign: 'center' }}>Cancel</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  filterBtn: { alignSelf: 'flex-end', backgroundColor: "black", padding: 10, borderRadius: 8, marginBottom: 10 },
  categoryBlock: { marginBottom: 30 },
  categoryTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textTransform: 'capitalize' },
  card: { marginBottom: 20, padding: 15, borderRadius: 12, backgroundColor: "#f9f9f9", alignSelf: 'center' },
  name: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  categoryText: { color: '#888', marginVertical: 2 },
  price: { fontWeight: '600', color: '#222' },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContainer: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "#fff", margin: 20, padding: 25, borderRadius: 20 },
  modalBox: { backgroundColor: "#fff", margin: 20, padding: 25, borderRadius: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#eee", padding: 12, borderRadius: 10, marginBottom: 15 },
  picker: { backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 15, padding: 12},
  applyBtn: { backgroundColor: "black", padding: 15, alignItems: "center", borderRadius: 10 },
  emptyText: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#999" }
});