import { BASE_URL } from "../config/config";

export const getImageUrl = (url) => {
  if (!url) return null;

  if (url.startsWith("http")) {
    return url;
  }

  return BASE_URL + url;
};