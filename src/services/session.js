import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";

export const getSessionId = async () => {
  let sessionId = await AsyncStorage.getItem("session_id");

  if (!sessionId) {
    sessionId = `guest-${uuidv4()}`;
    await AsyncStorage.setItem("session_id", sessionId);
  }

  return sessionId;
};