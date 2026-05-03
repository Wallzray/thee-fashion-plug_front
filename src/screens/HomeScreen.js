// src/screens/HomeScreen.js
import React from "react";
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, Dimensions } from "react-native";
import { Video } from "expo-av";

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Video
        source={ require('../../assets/videos/bg.mp4') } // or 'uri:https://www.example.com/video.mp4'
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
        shouldPlay
        isLooping
        isMuted
      />

      {/* dim layer so text is readable */}
      <View style={styles.dim} />

      <View style={styles.overlay}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1,position: "relative",backgroundColor: "#000",},
  dim: {...StyleSheet.absoluteFillObject,backgroundColor: "rgba(0,0,0,0.35)",zIndex: 1,},
  overlay: {flex: 1,justifyContent: "center",alignItems: "center",zIndex: 2,paddingHorizontal: 20, height: "80%",},
  title: {fontSize: 26,fontWeight: "700",marginBottom: 18,color: "#fff",textAlign: "center",textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },textShadowRadius: 4, justifyContent: "center"},
  /* Featured card */
  card: {width: "90%",backgroundColor: "#fff",borderRadius: 12,overflow: "auto",marginBottom: 12,shadowColor: "#000",
    shadowOpacity: 0.12,shadowRadius: 8,elevation: 6, height: "70%", alignItems: "center"},
  cardImage: {width: "100%",height: "70%",},
  cardContent: {padding: 14,},
  cardTitle: {fontSize: 18,fontWeight: "700",marginBottom: 6,color: "#111",},
  cardSubtitle: {fontSize: 14,color: "#666",marginBottom: 12,},
  cardButtons: {alignSelf: "flex-start",},
  buttons: {width: "40%",marginTop: 6,},
});
