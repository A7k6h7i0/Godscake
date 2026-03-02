import Bakery from "../models/Bakery.js";
import { env } from "../config/env.js";
import { geocodeAddress } from "../utils/geocoding.js";
import { ApiError } from "../middlewares/errorMiddleware.js";
import axios from "axios";

const placesClient = axios.create({
  baseURL: env.placesApiBaseUrl,
  timeout: env.placesApiTimeoutMs,
});

const toNumber = (value, fallback = null) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const placeIdFromRaw = (raw) =>
  raw?._id || raw?.id || raw?.place_id || raw?.google_place_id || raw?.uuid || "";

const mapPlaceToBakeryDoc = (raw) => {
  const lat = toNumber(raw?.latitude ?? raw?.lat ?? raw?.location?.coordinates?.[1]);
  const lng = toNumber(raw?.longitude ?? raw?.lng ?? raw?.lon ?? raw?.location?.coordinates?.[0]);
  if (lat == null || lng == null) return null;

  const name = String(raw?.name || "Unnamed Bakery").trim();
  const address = String(raw?.address || raw?.formatted_address || "Address unavailable").trim();
  const rating = toNumber(raw?.rating, 4) ?? 4;
  const sourceId = placeIdFromRaw(raw);

  if (!sourceId) return null;

  return {
    name,
    address,
    location: { type: "Point", coordinates: [lng, lat] },
    rating,
    sourceRef: `dlp:${sourceId}`,
  };
};

const requestWithRetry = async (requestFn, retries = env.placesApiRetries) => {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await requestFn();
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      const retryable = !status || status >= 500 || status === 429;
      if (!retryable || attempt === retries) break;
    }
  }
  throw lastError;
};

const upsertExternalPlacesIntoBakeries = async (places = []) => {
  if (!Array.isArray(places) || places.length === 0) return [];

  const operations = [];
  for (const place of places) {
    const mapped = mapPlaceToBakeryDoc(place);
    if (!mapped) continue;
    operations.push({
      updateOne: {
        filter: { sourceRef: mapped.sourceRef },
        update: { $set: mapped },
        upsert: true,
      },
    });
  }

  if (!operations.length) return [];
  await Bakery.bulkWrite(operations);

  const sourceRefs = operations.map((op) => op.updateOne.filter.sourceRef);
  return Bakery.find({ sourceRef: { $in: sourceRefs } }).lean();
};

const toUnifiedBakeryPayload = (localBakery, rawPlace) => ({
  _id: localBakery._id,
  name: localBakery.name,
  address: localBakery.address,
  rating: localBakery.rating,
  distance: toNumber(rawPlace?.distance, null),
  sourceRef: localBakery.sourceRef,
  location: localBakery.location,
});

export const geocodeAddressInput = async (address) => {
  const geo = await geocodeAddress(address);
  if (!geo) throw new ApiError(404, "Unable to geocode address");
  return geo;
};

export const listPlacesFromProvider = async ({ page = 1, limit = 20, search = "", min_rating, category }) => {
  const response = await requestWithRetry(() =>
    placesClient.get("/api/places", {
      params: {
        page,
        limit,
        search,
        min_rating,
        category: category || env.placesApiCategory,
      },
    })
  );

  const places = response.data?.data || [];
  const pagination = response.data?.pagination || null;

  const localBakeries = await upsertExternalPlacesIntoBakeries(places);
  const localBySource = new Map(localBakeries.map((b) => [b.sourceRef, b]));

  const unified = places
    .map((place) => {
      const sourceRef = `dlp:${placeIdFromRaw(place)}`;
      const local = localBySource.get(sourceRef);
      if (!local) return null;
      return toUnifiedBakeryPayload(local, place);
    })
    .filter(Boolean);

  return { data: unified, pagination, searchParams: response.data?.searchParams || null };
};

export const findNearbyBakeries = async ({ lat, lng, latitude, longitude, radiusKm, radius, page = 1, limit = 20, category }) => {
  const effectiveLat = toNumber(latitude ?? lat);
  const effectiveLng = toNumber(longitude ?? lng);
  if (effectiveLat == null || effectiveLng == null) {
    throw new ApiError(422, "Valid latitude and longitude are required");
  }

  const radiusKmValue = toNumber(radiusKm, null);
  const radiusMeters = toNumber(radius, null);
  const resolvedRadiusMeters = radiusMeters ?? (radiusKmValue ?? env.bakerySearchRadiusKm) * 1000;

  const response = await requestWithRetry(() =>
    placesClient.get("/api/places/nearby", {
      params: {
        latitude: effectiveLat,
        longitude: effectiveLng,
        radius: resolvedRadiusMeters,
        category: category || env.placesApiCategory,
        page,
        limit,
      },
    })
  );

  const places = response.data?.data || [];
  const pagination = response.data?.pagination || null;
  const localBakeries = await upsertExternalPlacesIntoBakeries(places);
  const localBySource = new Map(localBakeries.map((b) => [b.sourceRef, b]));

  const unified = places
    .map((place) => {
      const sourceRef = `dlp:${placeIdFromRaw(place)}`;
      const local = localBySource.get(sourceRef);
      if (!local) return null;
      return toUnifiedBakeryPayload(local, place);
    })
    .filter(Boolean);

  return { data: unified, pagination };
};

export const findNearbyBakeriesLocal = async ({ lat, lng, radiusKm }) => {
  const radius = Number(radiusKm) || env.bakerySearchRadiusKm;
  const distanceInMeters = radius * 1000;

  return Bakery.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [Number(lng), Number(lat)],
        },
        $maxDistance: distanceInMeters,
      },
    },
  });
};

export const getBakeryById = async (id) => {
  const bakery = await Bakery.findById(id);
  if (!bakery) throw new ApiError(404, "Bakery not found");
  return bakery;
};
