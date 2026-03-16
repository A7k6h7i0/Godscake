import axios from "axios";
import { getBakeryOwnerToken } from "./bakeryOwnerAuth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export const bakeryOwnerApi = axios.create({
  baseURL: API_BASE_URL,
});

bakeryOwnerApi.interceptors.request.use((config) => {
  const token = getBakeryOwnerToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
