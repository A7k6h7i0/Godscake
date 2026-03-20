import Bakery from "../models/Bakery.js";
import { env } from "../config/env.js";
import { geocodeAddress, reverseGeocode } from "../utils/geocoding.js";
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

const imageUrlFromRaw = (raw) => {
  const direct =
    raw?.featured_image ||
    raw?.image_url ||
    raw?.imageUrl ||
    raw?.photo_url ||
    raw?.photoUrl ||
    raw?.thumbnail ||
    raw?.cover;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  if (Array.isArray(raw?.images) && raw.images.length) {
    const first = raw.images[0];
    if (typeof first === "string" && first.trim()) return first.trim();
    if (typeof first?.url === "string" && first.url.trim()) return first.url.trim();
  }

  if (Array.isArray(raw?.photos) && raw.photos.length) {
    const first = raw.photos[0];
    if (typeof first === "string" && first.trim()) return first.trim();
    if (typeof first?.url === "string" && first.url.trim()) return first.url.trim();
  }

  return "";
};

const mapPlaceToBakeryDoc = (raw) => {
  const lat = toNumber(raw?.latitude ?? raw?.lat ?? raw?.location?.coordinates?.[1]);
  const lng = toNumber(raw?.longitude ?? raw?.lng ?? raw?.lon ?? raw?.location?.coordinates?.[0]);
  if (lat == null || lng == null) return null;

  const name = String(raw?.name || "").trim();
  const address = String(raw?.address || raw?.formatted_address || "").trim();
  if (!name || !address) return null;

  const rating = toNumber(raw?.rating, 4) ?? 4;
  const sourceId = placeIdFromRaw(raw);

  if (!sourceId) return null;

  return {
    name,
    address,
    location: { type: "Point", coordinates: [lng, lat] },
    rating,
    imageUrl: imageUrlFromRaw(raw),
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
  imageUrl: imageUrlFromRaw(rawPlace) || localBakery.imageUrl || "",
  sourceRef: localBakery.sourceRef,
  location: localBakery.location,
});

export const geocodeAddressInput = async (address) => {
  const geo = await geocodeAddress(address);
  if (!geo) throw new ApiError(404, "Unable to geocode address");
  return geo;
};

export const reverseGeocodeInput = async (lat, lng) => {
  const address = await reverseGeocode(lat, lng);
  if (!address) throw new ApiError(404, "Unable to reverse geocode coordinates");
  return { address };
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

export const findNearbyBakeries = async ({
  lat,
  lng,
  latitude,
  longitude,
  radiusKm,
  radius,
  page = 1,
  limit = 20,
  category,
  searchLocation,
}) => {
  const effectiveLat = toNumber(latitude ?? lat);
  const effectiveLng = toNumber(longitude ?? lng);
  if (effectiveLat == null || effectiveLng == null) {
    throw new ApiError(422, "Valid latitude and longitude are required");
  }

  const radiusKmValue = toNumber(radiusKm, null);
  const radiusMeters = toNumber(radius, null);
  const resolvedRadiusMeters = radiusMeters ?? (radiusKmValue ?? env.bakerySearchRadiusKm) * 1000;

  const nearbyResponse = await requestWithRetry(() =>
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

  const nearbyPlaces = nearbyResponse.data?.data || [];
  const nearbyPagination = nearbyResponse.data?.pagination || null;
  const localNearbyBakeries = await upsertExternalPlacesIntoBakeries(nearbyPlaces);
  const localNearbyBySource = new Map(localNearbyBakeries.map((b) => [b.sourceRef, b]));

  const nearbyUnified = nearbyPlaces
    .map((place) => {
      const sourceRef = `dlp:${placeIdFromRaw(place)}`;
      const local = localNearbyBySource.get(sourceRef);
      if (!local) return null;
      return toUnifiedBakeryPayload(local, place);
    })
    .filter(Boolean);

  if (nearbyUnified.length > 0) {
    return { data: nearbyUnified, pagination: nearbyPagination };
  }

  // Real-provider fallback only: broader search by location text, still from the same API.
  if (searchLocation?.trim()) {
    const searchResponse = await requestWithRetry(() =>
      placesClient.get("/api/places", {
        params: {
          page,
          limit,
          search: searchLocation,
          category: category || env.placesApiCategory,
        },
      })
    );

    const searchPlaces = searchResponse.data?.data || [];
    const searchPagination = searchResponse.data?.pagination || null;
    const localSearchBakeries = await upsertExternalPlacesIntoBakeries(searchPlaces);
    const localSearchBySource = new Map(localSearchBakeries.map((b) => [b.sourceRef, b]));

    const searchUnified = searchPlaces
      .map((place) => {
        const sourceRef = `dlp:${placeIdFromRaw(place)}`;
        const local = localSearchBySource.get(sourceRef);
        if (!local) return null;
        return toUnifiedBakeryPayload(local, place);
      })
      .filter(Boolean);

    return { data: searchUnified, pagination: searchPagination };
  }

  return {
    data: [],
    pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: Number(page),
      limit: Number(limit),
      hasNextPage: false,
      hasPrevPage: Number(page) > 1,
    },
  };
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
