import { storage } from "wxt/utils/storage";
export const storeApiKey = storage.defineItem<string>("local:apiKey", {
  fallback: "",
});
