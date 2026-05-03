import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const loadCart = async () => {
      const stored = await AsyncStorage.getItem("guest_cart");
      if (stored) setCartItems(JSON.parse(stored));
    };
    loadCart();
  }, []);

  const persistCart = async (items) => {
    setCartItems(items);
    await AsyncStorage.setItem("guest_cart", JSON.stringify(items));
  };

  const addToCart = (product) => {
    persistCart([...cartItems, product]);
  };

  const removeFromCart = (id) => {
    persistCart(cartItems.filter(item => item.id !== id));
  };

  const getTotalPrice = () => cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, getTotalPrice }}>
      {children}
    </CartContext.Provider>
  );
};
