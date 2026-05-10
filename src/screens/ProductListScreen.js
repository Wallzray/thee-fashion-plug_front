import React, { useEffect, useState, useContext, } from "react";
import {View,Text,Image,FlatList,StyleSheet,TouchableOpacity,Modal,TextInput,Platform, useWindowDimensions} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { apiRequest } from "../services/api";

const getBaseUrl = () => {
  if (Platform.OS === "web") return "https://thee-fashion-plug-back.onrender.com";
  if (Platform.OS === "android") return "https://thee-fashion-plug-back.onrender.com";
  return "https://thee-fashion-plug-back.onrender.com";
};
const BASE_URL = getBaseUrl();

export default function ProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedVariation, setSelectedVariation] = useState("");
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  
  
  const { width: screenWidth } = useWindowDimensions();
  const CARD_WIDTH = screenWidth - 40;
  const IMAGE_WIDTH = CARD_WIDTH - 30;  

  const { user } = useContext(AuthContext);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.log("Fetch products error:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const applyFilter = async (category) => {
    try {
      if (!category) {
        fetchProducts();
        return;
      }
      const response = await fetch(`${BASE_URL}/products?category=${encodeURIComponent(category)}`);
      const data = await response.json();
      setProducts(data);
      setFilterVisible(false);
    } catch (error) {
      console.log("Filter error:", error);
    }
  };

  const clearFilter = async () => {
    setSelectedCategory("");
    fetchProducts();
    setFilterVisible(false);
  };

  const handleWishlistPress = (item) => {
    if (user) {
      addToWishlist(item);
    } else {
      navigation.navigate("Login");
    }
  };

  const addToWishlist = async (product) => {
    try {
      await apiRequest("/wishlist/add", "POST", { product_id: product.id });
      alert("Added to wishlist!");
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  const addToCart = async (productId, size, qty) => {
    try {
      // backend expects form fields; apiRequest should handle FormData if provided
      const formData = new FormData();
      formData.append("product_id", productId);
      formData.append("size", size);
      formData.append("quantity", qty);
      formData.append("variation", selectedProduct.variation || "1");

      await apiRequest("/cart", "POST", formData);
      alert("Added to cart!");
    } catch (error) {
      console.error("Cart error:", error);
    }
  };

  const groupByCategory = (products) => {
    return products.reduce((acc, product) => {
      const cat = product.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    }, {});
  };

  const grouped = groupByCategory(products);

  const ProductCard = ({ item }) => {
  // Ensure we have a clean array 
 const images = Array.isArray(item.image)
  ? item.image
  : typeof item.image === "string"
  ? item.image.split(",").map((img) => img.trim()) // Splits "url1, url2" into ["url1", "url2"]
  : [];

  return (
    <View style={styles.card}>
      {/* Container for images to ensure they don't inherit card padding if needed */}
      <View style={{ height: 200, width: IMAGE_WIDTH, overflowX: 'hidden'}}>
        {images.length > 0 ? (
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={true}
            snapToInterval={IMAGE_WIDTH}
            decelerationRate="fast"
            keyExtractor={(url, index) => index.toString()}
            renderItem={({ item: imageUrl }) => (
              <Image
                source={{ uri: imageUrl }}
                style={{
                  width: IMAGE_WIDTH,
                  height: 200,
                  borderRadius: 10,
                  resizeMode: "cover",
                }}
              />
            )}
          />
        ) : (
          <View style={{ width: CARD_WIDTH, height: 200, backgroundColor: "#eee", borderRadius: 10 }} />
        )}
      </View>

      <Text style={styles.name}>{item.name}</Text>
      <Text>{item.category}</Text>
      <Text style={styles.price}>UGX {item.price}</Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
        <TouchableOpacity onPress={() => handleWishlistPress(item)}>
          <Ionicons name="heart-outline" size={24} color="black" style={{ marginRight: 15 }} />
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


  return (
    <View style={styles.container}>
      {/* Filter Button */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 10 }}>
        <TouchableOpacity
          style={{ backgroundColor: "black", padding: 10, borderRadius: 8 }}
          onPress={() => setFilterVisible(true)}
        >
          <Text style={{ color: "white" }}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Category sliders */}
      <FlatList
        data={Object.keys(grouped)}
        keyExtractor={(cat) => cat}
        renderItem={({ item: category }) => (
          <View style={styles.categoryBlock}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <FlatList
              data={grouped[category]}
              // horizontal
              keyExtractor={(prod) => prod.id.toString()}
              renderItem={({ item }) => <ProductCard item={item} />}
              showsHorizontalScrollIndicator={false}
              ListEmptyComponent={<Text style={styles.emptyText}>No products in this category</Text>}
            />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>There are currently no products available</Text>}
      />

      {/* Filter Modal */}
      <Modal visible={filterVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Category</Text>

            <Picker
              selectedValue={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Category" value="" />
                <Picker.Item label="Tshirts" value="Tshirts" />
                <Picker.Item label="Capes" value="Capes" />
                <Picker.Item label="Vests" value="Vests" />
                <Picker.Item label="Shorts" value="Shorts" />
                <Picker.Item label="Jackets" value="Jackets" />
            </Picker>

            <TouchableOpacity style={styles.applyBtn} onPress={() => applyFilter(selectedCategory)}>
              <Text style={{ color: "white" }}>Apply</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={clearFilter}>
              <Text style={{ marginTop: 10 }}>Clear Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add To Cart Modal */}
      <Modal visible={cartModalVisible} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>{selectedProduct?.name}</Text>

            <Picker
              selectedValue={selectedSize}
              onValueChange={(itemValue) => setSelectedSize(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Size" value="" />
              <Picker.Item label="Small" value="S" />
              <Picker.Item label="Medium" value="M" />
              <Picker.Item label="Large" value="L" />
              <Picker.Item label="Extra Large" value="XL" />
            </Picker>

            <Picker
              selectedValue={selectedVariation}
              onValueChange={(itemValue) => setSelectedVariation(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Variation" value="" />
              <Picker.Item label="Red" value="Red" />
              <Picker.Item label="Blue" value="Blue" />
              <Picker.Item label="Green" value="Green" />
              <Picker.Item label="Black" value="Black" />
              <Picker.Item label="White" value="White" />
            </Picker>

            <TextInput
              placeholder="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              style={styles.input}
            />

            <TouchableOpacity
              onPress={() => {
                if (!selectedSize) {
                  alert("Please select a size");
                  return;
                }
                addToCart(selectedProduct.id, selectedSize, quantity, selectedVariation || "1");
                setCartModalVisible(false);
              }}
              style={[styles.applyBtn, { marginTop: 10 }]}
            >
              <Text style={{ color: "white" }}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCartModalVisible(false)} style={{ marginTop: 10 }}>
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  card: { width: CARD_WIDTH, marginBottom: 20, padding: 15, borderRadius: 12, backgroundColor: "#f4f4f4" },
  flatList: { marginBottom: 20},
  name: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  price: { marginBottom: 10 },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  modalContainer: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "#fff", margin: 20, padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  applyBtn: { backgroundColor: "black", padding: 10, alignItems: "center", marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 8, marginBottom: 15 },
  modalBox: { backgroundColor: "#fff", margin: 20, padding: 20, borderRadius: 12 },
  picker: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 8, marginBottom: 15 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#666" },
});
