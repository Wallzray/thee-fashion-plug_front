import { getSessionId } from "./session";
import { BASE_URL } from "../config/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const apiRequest = async (endpoint, method = "GET", body = null, { timeout = 15000 } = {}) => {
  const sessionId = await getSessionId();
  const token = await AsyncStorage.getItem("authToken");

  const headers = new Headers();

  // Always attach session ID
  if (sessionId) {
    headers.append("X-Session-ID", sessionId);
  }

  // Attach Authorization if token exists
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  let options = { method, headers };

  if (body instanceof FormData) {
    options.body = body; // do NOT set Content-Type for FormData
  } else if (body != null) {
    headers.append("Content-Type", "application/json");
    options.body = JSON.stringify(body);
  }

  const controller = new AbortController();
  options.signal = controller.signal;
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const url = BASE_URL.endsWith("/")
    ? `${BASE_URL}${endpoint.replace(/^\//, "")}`
    : `${BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, options);
    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await res.json() : await res.text();

    if (!res.ok) {
      const err = new Error("Request failed");
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw err;
  }
};
