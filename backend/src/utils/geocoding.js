import axios from "axios";
import { env } from "../config/env.js";

const normalizeCoords = (lat, lng) => ({
  lat: Number(lat),
  lng: Number(lng),
});

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

// Forward geocoding (address -> coordinates)
const geocodeWithMapbox = async (address) => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`;
  const response = await axios.get(url, {
    params: { access_token: env.mapboxToken, limit: 1 },
    timeout: 10000,
  });
  const feature = response.data?.features?.[0];
  if (!feature) return null;
  const [lng, lat] = feature.center;
  return normalizeCoords(lat, lng);
};

const geocodeWithNominatim = async (address) => {
  const response = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: { q: address, format: "json", limit: 1, addressdetails: 0 },
    headers: { "User-Agent": env.nominatimUserAgent },
    timeout: 10000,
  });
  const best = response.data?.[0];
  if (!best) return null;
  return normalizeCoords(best.lat, best.lon);
};

const geocodeWithPhoton = async (address) => {
  const response = await axios.get("https://photon.komoot.io/api", {
    params: { q: address, limit: 1 },
    headers: { "User-Agent": env.nominatimUserAgent },
    timeout: 10000,
  });
  const feature = response.data?.features?.[0];
  const [lng, lat] = feature?.geometry?.coordinates || [];
  if (lat == null || lng == null) return null;
  return normalizeCoords(lat, lng);
};

const geocodeWithPlacesApi = async (address) => {
  const response = await axios.get(`${env.placesApiBaseUrl}/api/places`, {
    params: {
      page: 1,
      limit: 1,
      search: address,
    },
    timeout: env.placesApiTimeoutMs,
  });

  const first = response.data?.data?.[0];
  if (!first) return null;
  const lat = toNumber(first.latitude ?? first.lat ?? first.location?.coordinates?.[1]);
  const lng = toNumber(first.longitude ?? first.lng ?? first.lon ?? first.location?.coordinates?.[0]);
  if (lat == null || lng == null) return null;
  return normalizeCoords(lat, lng);
};

// Reverse geocoding (coordinates -> address)
const reverseGeocodeWithMapbox = async (lat, lng) => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`;
  const response = await axios.get(url, {
    params: { access_token: env.mapboxToken, limit: 1 },
    timeout: 10000,
  });
  const feature = response.data?.features?.[0];
  if (!feature) return null;
  return feature.place_name;
};

const reverseGeocodeWithNominatim = async (lat, lng) => {
  const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
    params: { lat, lon: lng, format: "json", addressdetails: 1 },
    headers: { "User-Agent": env.nominatimUserAgent },
    timeout: 10000,
  });
  const data = response.data;
  if (!data || !data.display_name) return null;
  return data.display_name;
};

const reverseGeocodeWithPhoton = async (lat, lng) => {
  const response = await axios.get("https://photon.komoot.io/reverse", {
    params: { lat, lon: lng, limit: 1 },
    headers: { "User-Agent": env.nominatimUserAgent },
    timeout: 10000,
  });
  const feature = response.data?.features?.[0];
  if (!feature) return null;
  return feature.properties?.name || feature.properties?.address?.road || feature.properties?.address?.city || feature.properties?.address?.state || feature.properties?.address?.country;
};

const reverseGeocodeWithPlacesApi = async (lat, lng) => {
  // Assuming our custom places API has a reverse endpoint
  const response = await axios.get(`${env.placesApiBaseUrl}/api/places/reverse`, {
    params: {
      lat,
      lng,
    },
    timeout: env.placesApiTimeoutMs,
  });

  const first = response.data?.data?.[0];
  if (!first) return null;
  // Adjust based on your API's response structure
  return first.display_name || first.address || first.formatted_address;
};

export const geocodeAddress = async (address) => {
  if (!address?.trim()) return null;

  const attempts = [];

  if (env.geocodeProvider === "mapbox" && env.mapboxToken) {
    attempts.push(() => geocodeWithMapbox(address));
  }
  if (env.geocodeProvider === "photon") {
    attempts.push(() => geocodeWithPhoton(address));
  }
  attempts.push(() => geocodeWithNominatim(address));
  attempts.push(() => geocodeWithPhoton(address));
  attempts.push(() => geocodeWithPlacesApi(address));

  for (const attempt of attempts) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const result = await attempt();
      if (result) return result;
    } catch (error) {
      // Continue fallback chain when provider is unreachable or rejects the request.
    }
  }

  return null;
};

export const reverseGeocode = async (lat, lng) => {
  if (lat == null || lng == null) return null;

  const attempts = [];

  if (env.geocodeProvider === "mapbox" && env.mapboxToken) {
    attempts.push(() => reverseGeocodeWithMapbox(lat, lng));
  }
  if (env.geocodeProvider === "photon") {
    attempts.push(() => reverseGeocodeWithPhoton(lat, lng));
  }
  attempts.push(() => reverseGeocodeWithNominatim(lat, lng));
  attempts.push(() => reverseGeocodeWithPhoton(lat, lng));
  attempts.push(() => reverseGeocodeWithPlacesApi(lat, lng));

  for (const attempt of attempts) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const result = await attempt();
      if (result) return result;
    } catch (error) {
      // Continue fallback chain when provider is unreachable or rejects the request.
    }
  }

  return null;
};
