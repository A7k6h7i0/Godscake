import axios from "axios";
import { getToken } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const geocodeAddress = async (address: string) => {
  const response = await api.get("/bakeries/geocode", { params: { address } });
  return response.data?.data as { lat: number; lng: number };
};

export const reverseGeocode = async (lat: number, lng: number) => {
  const response = await api.get("/bakeries/reverse-geocode", { params: { lat, lng } });
  return response.data?.data?.address as string;
};
