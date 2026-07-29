import React, { useState, useEffect, useContext } from "react";
import { Alert, Platform, View, TextInput, Button, Image, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "../context/AuthContext";
import { BASE_URL } from "../config/config";

export default function VendorUploadScreen({ navigation }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState([]); // array of URIs
  const [loading, setLoading] = useState(false);

  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    if (!user || user.role !== "vendor") {
      Alert.alert("Restricted", "You must be a vendor to access this page.");
      navigation.replace("Auth", { screen: "Login" });
    }
  }, [user, navigation]);

  if (!user || user.role !== "vendor") return null;

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Permission to access media library is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      setSelectionLimit: 3, 
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
    // Correctly extracting the URIs into an array
    const selectedUris = result.assets.map(asset => asset.uri);
    setImage(selectedUris); 
  }
  };

  const getBaseUrl = () => {
  if (Platform.OS === "web") return "http://localhost:8000";
  if (Platform.OS === "android") return "https://thee-fashion-plug-back.onrender.com";
  return "https://thee-fashion-plug-back.onrender.com";
  };
  const BASE_URL = getBaseUrl();

  const handleUpload = async () => {
  if (!image.length || !name || !price || !category) {
    Alert.alert("Missing fields", "Please fill all fields and pick an image");
    return;
  }

  if (!user?.token) {
    Alert.alert("Not authenticated", "Your session is missing. Please log in again.");
    navigation.replace("Auth", { screen: "Login" });
    return;
  }

  setLoading(true);

  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", price);
  formData.append("category", category);

  try {
     if (Platform.OS === "web") {
      // loop through selected URIs
      for (let i = 0; i < image.length; i++) {
        const imgResponse = await fetch(image[i]);
        const blob = await imgResponse.blob();
        formData.append("image", blob, `product_${i}.jpg`);
      }
    } else {
      // native: append each URI
      image.forEach((uri, i) => {
        const filename = uri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image";
        formData.append("image", { uri, name: filename || `product_${i}.jpg`, type });
      });
    }

    // now do the actual upload
    const uploadResponse = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${user.token}`,
        // Do NOT set Content-Type manually when sending FormData
      },
    });

    if (!uploadResponse.ok) {
      const errText = await uploadResponse.text();
      console.error("Upload failed:", errText);
      Alert.alert("Upload failed", "Check server logs.");
    } else {
      // const data = await uploadResponse.json();
      const data = await uploadResponse.json();
      console.log("Server returned:", data.image);
      console.log("Upload success:", data);

      Alert.alert("Success", "Product uploaded and saved to the database.");
      setName("");
      setPrice("");
      setCategory("");
      setImage([]); // clear after upload
    }
  } catch (error) {
    console.error("Upload error:", error);
  } finally {
    setLoading(false);
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Upload New Product</Text>

      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />

      <Picker selectedValue={category} onValueChange={(itemValue) => setCategory(itemValue)} style={styles.picker}>
        <Picker.Item label="Select Category" value="" />
        <Picker.Item label="Tshirts" value="Tshirts" />
        <Picker.Item label="Capes" value="Capes" />
        <Picker.Item label="Vests" value="Vests" />
        <Picker.Item label="Shorts" value="Shorts" />
        <Picker.Item label="Jackets" value="Jackets" />
        <Picker.Item label="Featured" value="featured" />
      </Picker>

      <View style={{ marginVertical: 10 }}>
        <Button title="Pick Image" onPress={pickImage} />
      </View>

      {/* Preview all selected images */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
        {image && Array.isArray(image) && image.map((uri, idx) => (
          <Image 
            key={idx} 
            source={{ uri }} 
            style={{ width: 100, height: 100, marginRight: 10, borderRadius: 8 }} 
            />
        ))}
      </View>

      <View style={{ marginTop: 20 }}>
        {loading ? <ActivityIndicator size="large" color="#000" /> : <Button title="Upload Product" onPress={handleUpload} />}
      </View>

      <View style={{ marginVertical: 10 }}>
        <Button
          title="Back Home"
          onPress={async () => {
            await logout();
            navigation.navigate("MainTabs", { screen: "Home" });
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 10, marginBottom: 20, borderRadius: 8 },
  picker: { borderWidth: 1, borderColor: "#ddd", marginBottom: 20, borderRadius: 8, padding: 10 },
});
