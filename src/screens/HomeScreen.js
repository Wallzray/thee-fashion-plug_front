import React from "react";
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList, ScrollView, Platform } from "react-native";
import { useEffect, useState } from "react";
import { Video } from "expo-av"; 
import { getBaseUrl } from "../config/config";

  const screenWidth = Dimensions.get("window").width;
  const CARD_WIDTH = screenWidth - 40;
  const IMAGE_WIDTH = CARD_WIDTH - 30;

export default function HomeScreen({ navigation }) {

  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "https://thee-fashion-plug-back.onrender.com" //  : "http://localhost:8000";

const getProductImageThumbnail = (imageField) => {
  if (!imageField) return null;
  
  // If the backend sent a native array
  if (Array.isArray(imageField) && imageField.length > 0) return imageField[0];

  if (typeof imageField === "string") {
    
    if (!imageField.startsWith("[") && !imageField.startsWith("{")) {
      return imageField;
    }
    try {
      const parsed = JSON.parse(imageField);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      if (parsed && typeof parsed === "object") return Object.values(parsed)[0]; // If it's stored as a keyed dictionary object
      return parsed;
    } catch (e) {
      return imageField;
    }
  }
  return null;
};

  const fetchFeatured = async () => {
  try {
    // Hardcode the featured category query string directly
    const url = `${BASE_URL}/products?category=featured`;
    
    console.log("Direct Fetching Featured from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    const data = await response.json();
    setFeatured(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Direct fetchFeatured error:", error);
  }
};

  useEffect(() => {
    fetchFeatured();
  }, []);

  return (
    <View style={styles.container}>
      <Video
        source={ require('../../assets/videos/bg.mp4') } // or 'uri:https://www.example.com/video.mp4'
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
        shouldPlay
        isLooping
        isMuted
        pointerEvents="none"
      />

      {/* dim layer so text is readable */}
      <View style={styles.dim} pointerEvents="none"/>
      <ScrollView contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Welcome to Thee Fabric 👗</Text>

        {/* Featured card */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.card}
          onPress={() => navigation.navigate("Products")}
        >
          <Image
            source={ require('../../assets/images/models-classy.jpeg') }
            style={styles.cardImage}
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Discover the New Collection</Text>
            <Text style={styles.cardSubtitle}>Find yourself the latest trend in the perfect design and fit.</Text>
            <View style={styles.cardButtons}>
              <Button title="Shop Now" onPress={() => navigation.navigate("Products")} />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.buttons}>
          <Button
            title="View Products"
            onPress={() => navigation.navigate("Products")}
          />
        </View>

    <View style={styles.pdtcontainer}>
      <Text style={styles.categoryTitle}>Featured Products</Text>
        <FlatList
          data={featured}
          horizontal={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
    
    const thumbnailPath = getProductImageThumbnail(item.image);
    // console.log(`Product: ${item.name} | Raw Image Field:`, item.image, `| Extracted Path: ${thumbnailPath} | Full URI: ${getBaseUrl(thumbnailPath)}`);
    return (
        <TouchableOpacity
          style={[styles.pdtcard, { width: CARD_WIDTH }]}
          onPress={() => navigation.navigate("Products")}>
         <Image source= {{ uri: thumbnailPath.startsWith("http") ? thumbnailPath : getBaseUrl(thumbnailPath)}} style={styles.cardImage}/>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSubtitle}>UGX {item.price}</Text>
                </View>
        </TouchableOpacity>);}}
      />
    </View>
  </ScrollView>
</View>
      
  );
}

const styles = StyleSheet.create({
  container: {flex: 1,position: "relative",backgroundColor: "#000",},
  pdtcontainer: { flex: 1, padding: 10, backgroundColor: "#fff", width: "100%", borderRadius: 12},
  pdtcard: { marginBottom: 20, padding: 10, borderRadius: 12, backgroundColor: "#f9f9f9", alignSelf: 'justify', },
  categoryTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textTransform: 'capitalize', alignContent: 'center', textAlign: 'center', },
  scrollContent: {flexGrow: 1,justifyContent: "center",alignItems: "center",zIndex: 3,paddingHorizontal: 20,},
  overlay1: {flex: 1,justifyContent: "center",alignItems: "center",zIndex: 3,paddingHorizontal: 10, height: "200px", backgroundColor: "#fff", marginTop: 20, borderRadius: 12},
  title: {fontSize: 26,fontWeight: "700",marginBottom: 18,color: "#fff",textAlign: "center",textShadowColor: "rgba(0,0,0,0.6)", textShadowOffset: { width: 0, height: 1 },textShadowRadius: 4, justifyContent: "center"},
  /* Featured card */
  card: {width: "90%",backgroundColor: "#fff",borderRadius: 12, marginBottom: 12,shadowColor: "#000",shadowOpacity: 0.12,shadowRadius: 8,elevation: 6, height: "400px", alignItems: "center"},
  cardImage: { height: 200, width: "80%", overflow: 'hidden', alignSelf: 'center'},
  cardContent: {padding: 14,},
  cardTitle: {fontSize: 18,fontWeight: "700",marginBottom: 6,color: "#111",},
  cardSubtitle: {fontSize: 14,color: "#666",marginBottom: 12,},
  cardButtons: {alignSelf: "flex-start",},
  buttons: {width: "40%",marginTop: 6, marginBottom: 20,},
});
