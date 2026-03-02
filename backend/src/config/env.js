import dotenv from "dotenv";

dotenv.config();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: toNumber(process.env.PORT, 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gods-cake",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  bakerySearchRadiusKm: toNumber(process.env.BAKERY_SEARCH_RADIUS_KM, 10),
  geocodeProvider: process.env.GEOCODE_PROVIDER || "openstreetmap",
  mapboxToken: process.env.MAPBOX_TOKEN || "",
  nominatimUserAgent: process.env.NOMINATIM_USER_AGENT || "gods-cake-app/1.0",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  placesApiBaseUrl: process.env.PLACES_API_BASE_URL || "https://maps-api.digitalleadpro.com",
  placesApiTimeoutMs: toNumber(process.env.PLACES_API_TIMEOUT_MS, 12000),
  placesApiRetries: toNumber(process.env.PLACES_API_RETRIES, 2),
  placesApiCategory: process.env.PLACES_API_CATEGORY || "bakery",
};
