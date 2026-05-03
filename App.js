// App.js
import React from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./src/screens/HomeScreen";
import ProductListScreen from "./src/screens/ProductListScreen";
import CartScreen from "./src/screens/CartScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import OrderDetailScreen from "./src/screens/OrderDetailScreen";
import OrderConfirmationScreen from "./src/screens/OrderConfirmationScreen";
import VendorUploadScreen from "./src/screens/VendorUploadScreen"; // keep for protected stacks if needed
import AdminOrdersScreen from "./src/screens/AdminOrdersScreen";
import CheckoutScreen from "./src/screens/CheckoutScreen";

import { AuthProvider } from "./src/context/AuthContext";

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const isWeb = typeof window !== "undefined" && Platform.OS === "web";
const linking = isWeb
  ? {
      prefixes: [window.location.origin + "/#"],
      config: {
        screens: {
          MainTabs: "",
          Auth: {
            path: "auth",
            screens: { Login: "login", Signup: "signup" },
          },
          AdminStack: "admin",
        },
      },
    }
  : undefined;

function ProductStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProductList" component={ProductListScreen} options={{ title: "Products" }} />
    </Stack.Navigator>
  );
}

function CartStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = "home";
          if (route.name === "Products") iconName = "shirt";
          if (route.name === "Cart") iconName = "cart";
          if (route.name === "Login") iconName = "log-in";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductStack} options={{ headerShown: false }} />
      <Tab.Screen name="Cart" component={CartStack} options={{ headerShown: false }} />
      <Tab.Screen name="Login" component={AuthStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} options={{ title: "Orders (Admin)" }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Order Detail" }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer linking={linking}>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="MainTabs" component={MainTabs} />
          <RootStack.Screen name="AdminStack" component={AdminStack} />
          <RootStack.Screen name="Auth" component={AuthStack} />
          <RootStack.Screen name="VendorUpload" component={VendorUploadScreen} />
        </RootStack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
