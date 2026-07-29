import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { apiRequest } from '../services/api'; 
import { SafeAreaView } from 'react-native-safe-area-context';

const PaymentWebViewScreen = ({ route, navigation }) => {
  // Extract parameters passed from your checkout screen submission
  const url = route.params?.url || route.params?.payment_url;
  const orderId = route.params?.orderId || route.params?.order_id;

  console.log(`🎯 WebView Loaded parameters -> Tracking Order ID: ${orderId} | Target URL: ${url}`);

  const checkInterval = useRef(null);

  // Helper helper function to verify if the backend database updated successfully
  const verifyPaymentWithBackend = async () => {
    try {
      const orderResp = await apiRequest(`/orders/${orderId}`, "GET");
      
      // If the backend has moved past PENDING (via IPN or Callback updates)
      if (orderResp.status && orderResp.status !== "PENDING") {
        cleanUpAndExit(orderResp.status);
      }
    } catch (error) {
      console.error("Safeguard status polling error:", error);
    }
  };

  const cleanUpAndExit = (finalStatus) => {
    if (checkInterval.current) clearInterval(checkInterval.current);
    
    if (finalStatus === "COMPLETED" || finalStatus === "SUCCESS") {
      navigation.replace("OrderConfirmation", { orderId });
    } else if (finalStatus === "CANCELLED" || finalStatus === "FAILED") {
       alert("Payment was not completed. Returning to your cart.");
    navigation.navigate("CartScreen"); 
  } else {
    navigation.navigate("CartScreen");
  }
  };
  const handleMessageReceived = (event) => {
  try {
    const data = JSON.parse(event.nativeEvent.data);
    
    // ✅ Catch the explicit button action we injected into the HTML code
    if (data.action === "EXIT_TO_CHECKOUT") {
      console.log("User tapped the web Return button. Navigating back...");
      
      if (checkInterval.current) clearInterval(checkInterval.current);
      
      // Send them directly back to your checkout or cart workflow layout
      navigation.navigate("Checkout"); 
    }
  } catch (err) {
    console.error("Failed to parse WebView message data packet:", err);
  }
};

  // Triggered automatically whenever the user navigates to a new page inside the WebView
  const handleNavigationStateChange = async (navState) => {
  const { url } = navState;
  
  // 1. Detect if PesaPal is trying to redirect to our symbolic callback
  if (url.includes("pesapal/callback")) {
    console.log("🎯 Intercepted PesaPal callback link! Cutting off web routing...");
    
    // 2. STOP the WebView from physically loading the page
    this.webview.stopLoading(); 

    try {
      const trackingIdMatch = url.match(/[?&][Oo]rder[Tt]racking[Ii]d=([^&]+)/);
      const merchantRefMatch = url.match(/[?&]([Oo]rder[Mm]erchant[Rr]eference|[Mm]erchant_[Rr]eference)=([^&]+)/);

      const orderTrackingId = trackingIdMatch ? trackingIdMatch[1] : null;
      const merchantRef = merchantRefMatch ? merchantRefMatch[2] : null;

      if (!orderTrackingId) {
        console.error("❌ Failed to parse out the tracking parameters.");
        navigation.navigate("Checkout");
        return;
      }

      console.log(`🔄 Verifying status locally for Tracking ID: ${orderTrackingId}`);

      
      const response = await axios.get(
        `http://192.168.100.6:8000/pesapal/callback?OrderTrackingId=${orderTrackingId}&OrderMerchantReference=${merchantRef}`
      );

      // 4. Close the WebView and handle your UI navigation based on your database state
      if (response.status === 200) {
         console.log("✅ Database synced successfully over local network!");
         navigation.navigate("OrderConfirmation", { merchantRef });
      }

    } catch (error) {
      console.error("❌ Local callback synchronization broke down:", error);
      navigation.navigate("Checkout");
    }
  }
};

  useEffect(() => {
    // If the user's mobile data lags out or the redirect fails, check the DB every 5 seconds
    checkInterval.current = setInterval(() => {
      console.log("🔄 Running background polling check...");
      verifyPaymentWithBackend();
    }, 5000);

    // Clean up interval instantly when the user leaves this component layout to prevent memory leaks
    return () => {
      if (checkInterval.current) clearInterval(checkInterval.current);
    };
  }, [orderId]);

  return (
    <SafeAreaView style={styles.container}>
    {Platform.OS === 'web' ? (
      // Desktop Browser Fallback: 
      <iframe 
        src={url} 
        style={styles.webIframe} 
        title="PesaPal Payment Portal"
      />
    ) : (
      // Native Mobile Code
      <WebView
        source={{ uri: url }}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessageReceived}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator size="large" color="#000" style={styles.loader} />
        )}
      />
    )}
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -20 }, { translateY: -20 }] },
  webIframe: { width: '100%', height: '100%', border: 'none' }
});

export default PaymentWebViewScreen;