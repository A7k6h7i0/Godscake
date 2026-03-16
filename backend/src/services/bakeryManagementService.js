import Bakery from "../models/Bakery.js";
import { ApiError } from "../middlewares/errorMiddleware.js";

const normalizeImages = (images) => {
  if (!Array.isArray(images)) return [];
  return images.map((img) => String(img).trim()).filter(Boolean);
};

const normalizeDays = (days) => {
  if (!Array.isArray(days)) return [];
  return days.map((d) => String(d).trim()).filter(Boolean);
};

const buildLocation = ({ lat, lng }) => {
  const latitude = typeof lat === "number" ? lat : Number(lat);
  const longitude = typeof lng === "number" ? lng : Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { type: "Point", coordinates: [0, 0] };
  }
  return { type: "Point", coordinates: [longitude, latitude] };
};

export const getBakeryForOwner = async (owner) => {
  if (owner.bakeryId) {
    return Bakery.findById(owner.bakeryId);
  }
  return Bakery.findOne({ ownerAccountId: owner._id });
};

export const createBakeryProfile = async (owner, payload) => {
  const existing = await getBakeryForOwner(owner);
  if (existing) throw new ApiError(409, "Bakery profile already exists");

  const bakery = await Bakery.create({
    name: payload.name,
    address: payload.address,
    contactEmail: payload.contactEmail || "",
    phone: payload.contactPhone || payload.phone || "",
    images: normalizeImages(payload.images),
    imageUrl: payload.coverImage || "",
    timings: {
      opensAt: payload.opensAt || "",
      closesAt: payload.closesAt || "",
      daysOpen: normalizeDays(payload.daysOpen),
    },
    location: buildLocation({ lat: payload.lat, lng: payload.lng }),
    ownerAccountId: owner._id,
  });

  owner.bakeryId = bakery._id;
  await owner.save();

  return bakery;
};

export const updateBakeryProfile = async (owner, payload) => {
  const bakery = await getBakeryForOwner(owner);
  if (!bakery) throw new ApiError(404, "Bakery profile not found");

  if (payload.name) bakery.name = payload.name;
  if (payload.address) bakery.address = payload.address;
  if (payload.contactEmail !== undefined) bakery.contactEmail = payload.contactEmail || "";
  if (payload.contactPhone !== undefined) bakery.phone = payload.contactPhone || payload.phone || "";
  if (payload.coverImage !== undefined) bakery.imageUrl = payload.coverImage || "";
  if (payload.images !== undefined) bakery.images = normalizeImages(payload.images);
  if (payload.opensAt !== undefined || payload.closesAt !== undefined || payload.daysOpen !== undefined) {
    bakery.timings = {
      opensAt: payload.opensAt ?? bakery.timings?.opensAt ?? "",
      closesAt: payload.closesAt ?? bakery.timings?.closesAt ?? "",
      daysOpen: payload.daysOpen ? normalizeDays(payload.daysOpen) : bakery.timings?.daysOpen ?? [],
    };
  }
  if (payload.lat !== undefined || payload.lng !== undefined) {
    bakery.location = buildLocation({ lat: payload.lat, lng: payload.lng });
  }

  await bakery.save();
  return bakery;
};

export const claimExistingBakery = async (owner, bakeryId, { force = false } = {}) => {
  if (owner.bakeryId && owner.bakeryId.toString() !== bakeryId) {
    if (!force) {
      throw new ApiError(409, "This owner already has a bakery assigned");
    }

    const currentBakery = await Bakery.findById(owner.bakeryId);
    if (currentBakery && currentBakery.ownerAccountId?.toString() === owner._id.toString()) {
      currentBakery.ownerAccountId = null;
      await currentBakery.save();
    }
  }

  const bakery = await Bakery.findById(bakeryId);
  if (!bakery) throw new ApiError(404, "Bakery not found");

  if (bakery.ownerId && bakery.ownerId.toString() !== owner._id.toString()) {
    throw new ApiError(409, "Bakery is already claimed by another account");
  }

  if (bakery.ownerAccountId && bakery.ownerAccountId.toString() !== owner._id.toString()) {
    throw new ApiError(409, "Bakery is already claimed by another owner");
  }

  bakery.ownerAccountId = owner._id;
  owner.bakeryId = bakery._id;

  await Promise.all([bakery.save(), owner.save()]);
  return bakery;
};
