import mongoose from "mongoose";
import Cake from "../models/Cake.js";
import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";
import Bakery from "../models/Bakery.js";
import OrderItem from "../models/OrderItem.js";
import { geocodeAddress } from "../utils/geocoding.js";
import { ApiError } from "../middlewares/errorMiddleware.js";

const toObjectId = (value) => new mongoose.Types.ObjectId(value);
const ORDER_STATUSES = ["Placed", "Accepted", "Preparing", "Out for Delivery", "Delivered"];
const DELIVERY_PARTNER_STATUSES = ["Out for Delivery", "Delivered"];

const assertValidStatusTransition = (currentStatus, nextStatus) => {
  const currentIndex = ORDER_STATUSES.indexOf(currentStatus);
  const nextIndex = ORDER_STATUSES.indexOf(nextStatus);
  if (nextIndex === -1) throw new ApiError(422, "Invalid order status");
  if (nextIndex < currentIndex) throw new ApiError(400, "Order status cannot move backwards");
  if (nextIndex > currentIndex + 1) {
    throw new ApiError(400, "Order status can only move one step at a time");
  }
};

const toRadians = (deg) => (deg * Math.PI) / 180;
const distanceKmBetween = ([lng1, lat1], [lng2, lat2]) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const calculatePartnerPayout = (distanceKm) => {
  const payout = Math.round(30 + distanceKm * 8);
  return Math.max(30, Math.min(100, payout));
};

export const createOrder = async ({
  userId,
  bakeryId,
  items,
  deliveryAddress,
  deliveryLat,
  deliveryLng,
  recipientName = "",
  recipientPhone = "",
}) => {
  const bakery = await Bakery.findById(bakeryId);
  if (!bakery) throw new ApiError(404, "Bakery not found");
  if (!items?.length) throw new ApiError(400, "Order items are required");

  const cakeIds = items.filter((item) => item.cakeId).map((item) => toObjectId(item.cakeId));
  const menuItemIds = items.filter((item) => item.menuItemId).map((item) => toObjectId(item.menuItemId));

  const [cakes, menuItems] = await Promise.all([
    cakeIds.length ? Cake.find({ _id: { $in: cakeIds }, bakeryId, isAvailable: true }) : [],
    menuItemIds.length ? MenuItem.find({ _id: { $in: menuItemIds }, bakeryId, isAvailable: true }) : [],
  ]);

  if (cakes.length !== cakeIds.length || menuItems.length !== menuItemIds.length) {
    throw new ApiError(400, "Some items are invalid for this bakery");
  }

  const cakeMap = new Map(cakes.map((cake) => [cake._id.toString(), cake]));
  const menuMap = new Map(menuItems.map((item) => [item._id.toString(), item]));
  let totalPrice = 0;
  const normalizedItems = items.map((item) => {
    const quantity = Number(item.quantity) || 1;
    if (quantity <= 0) throw new ApiError(400, "Invalid item in order");

    if (item.menuItemId) {
      const menuItem = menuMap.get(String(item.menuItemId));
      if (!menuItem) throw new ApiError(400, "Invalid menu item in order");
      const lineTotal = menuItem.price * quantity;
      totalPrice += lineTotal;
      return {
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        lineTotal,
      };
    }

    const cake = cakeMap.get(String(item.cakeId));
    if (!cake) throw new ApiError(400, "Invalid cake in order");
    const lineTotal = cake.price * quantity;
    totalPrice += lineTotal;
    return {
      cakeId: cake._id,
      name: cake.name,
      price: cake.price,
      quantity,
      lineTotal,
    };
  });

  let lat = deliveryLat;
  let lng = deliveryLng;
  if (lat == null || lng == null) {
    const geocoded = await geocodeAddress(deliveryAddress);
    if (!geocoded) {
      throw new ApiError(422, "Unable to locate delivery address. Please include area, city and country.");
    }
    lat = geocoded.lat;
    lng = geocoded.lng;
  }

  const order = await Order.create({
    userId,
    bakeryId,
    recipientName,
    recipientPhone,
    deliveryAddress,
    deliveryLocation: { type: "Point", coordinates: [Number(lng), Number(lat)] },
    items: normalizedItems,
    status: "Placed",
    statusHistory: [{ status: "Placed", at: new Date(), note: "Order placed by customer" }],
    totalPrice,
  });

  if (normalizedItems.length) {
    const createdItems = await OrderItem.insertMany(
      normalizedItems.map((item) => ({
        orderId: order._id,
        bakeryId,
        menuItemId: item.menuItemId || null,
        cakeId: item.cakeId || null,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      }))
    );
    order.orderItemIds = createdItems.map((item) => item._id);
    await order.save();
  }

  return order;
};

export const getOrderByIdForUser = async ({ orderId, userId }) => {
  const order = await Order.findOne({ _id: orderId, userId })
    .populate("bakeryId", "name address location")
    .populate("userId", "name email");
  if (!order) throw new ApiError(404, "Order not found");
  return order;
};

export const getOrderByIdForRequester = async ({ orderId, requesterId, requesterRole }) => {
  let filter = { _id: orderId, userId: requesterId };
  if (requesterRole === "admin") filter = { _id: orderId };

  // Delivery partner can view:
  // 1) orders already assigned to them, OR
  // 2) open placed orders that are still unassigned (to inspect before accepting).
  if (requesterRole === "partner") {
    filter = {
      _id: orderId,
      $or: [
        { deliveryPartnerId: requesterId },
        { status: "Placed", deliveryPartnerId: null },
      ],
    };
  }

  const order = await Order.findOne(filter)
    .populate("bakeryId", "name address location")
    .populate("userId", "name email")
    .populate("deliveryPartnerId", "name email");
  if (!order) throw new ApiError(404, "Order not found");
  return order;
};

export const listOrdersForRequester = async ({ requesterId, requesterRole, page = 1, limit = 20, status }) => {
  if (!["user", "partner", "admin"].includes(requesterRole)) {
    throw new ApiError(403, "You are not allowed to view orders");
  }
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const query = {};
  if (requesterRole === "user") query.userId = requesterId;
  if (requesterRole === "partner") query.deliveryPartnerId = requesterId;
  if (status) query.status = status;

  const [orders, totalItems] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .populate("bakeryId", "name address location")
      .populate("userId", "name email")
      .populate("deliveryPartnerId", "name email")
      .lean(),
    Order.countDocuments(query),
  ]);

  const totalPages = Math.max(Math.ceil(totalItems / perPage), 1);
  return {
    data: orders,
    pagination: {
      totalItems,
      totalPages,
      currentPage,
      limit: perPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
};

export const updateOrderStatusForAdmin = async ({ orderId, status, note = "" }) => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  assertValidStatusTransition(order.status, status);

  if (order.status === status) return order;

  order.status = status;
  order.statusHistory.push({ status, at: new Date(), note });
  await order.save();

  return order;
};

export const listAvailableOrdersForPartner = async ({ page = 1, limit = 20 }) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const query = { status: { $in: ["Placed", "Accepted", "Preparing"] }, deliveryPartnerId: null };

  const [orders, totalItems] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: 1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .populate("bakeryId", "name address location")
      .populate("userId", "name email")
      .lean(),
    Order.countDocuments(query),
  ]);

  const totalPages = Math.max(Math.ceil(totalItems / perPage), 1);
  return {
    data: orders,
    pagination: {
      totalItems,
      totalPages,
      currentPage,
      limit: perPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
};

export const acceptOrderForPartner = async ({ orderId, partnerId }) => {
  const order = await Order.findById(orderId).populate("bakeryId", "location name address");
  if (!order) throw new ApiError(404, "Order not found");
  if (!["Placed", "Accepted", "Preparing"].includes(order.status) || order.deliveryPartnerId) {
    throw new ApiError(409, "Order already accepted by another delivery partner");
  }

  const bakeryCoords = order.bakeryId?.location?.coordinates;
  const deliveryCoords = order.deliveryLocation?.coordinates;
  const distanceKm =
    bakeryCoords?.length === 2 && deliveryCoords?.length === 2
      ? distanceKmBetween(bakeryCoords, deliveryCoords)
      : 0;

  const now = new Date();
  const shouldAdvanceStatus = order.status === "Placed";
  const updated = await Order.findOneAndUpdate(
    { _id: orderId, status: { $in: ["Placed", "Accepted", "Preparing"] }, deliveryPartnerId: null },
    {
      $set: {
        deliveryPartnerId: partnerId,
        deliveryAcceptedAt: now,
        deliveryDistanceKm: Number(distanceKm.toFixed(2)),
        deliveryPayout: calculatePartnerPayout(distanceKm),
        ...(shouldAdvanceStatus ? { status: "Accepted" } : {}),
      },
      $push: {
        statusHistory: {
          status: shouldAdvanceStatus ? "Accepted" : order.status,
          at: now,
          note: "Accepted by delivery partner",
        },
      },
    },
    { new: true }
  );

  if (!updated) throw new ApiError(409, "Order already accepted by another delivery partner");

  return Order.findById(updated._id)
    .populate("bakeryId", "name address location")
    .populate("userId", "name email")
    .populate("deliveryPartnerId", "name email");
};

export const updateDeliveryStatusForPartner = async ({ orderId, partnerId, status, note = "" }) => {
  if (!DELIVERY_PARTNER_STATUSES.includes(status)) {
    throw new ApiError(422, "Invalid delivery status");
  }

  const order = await Order.findOne({ _id: orderId, deliveryPartnerId: partnerId });
  if (!order) throw new ApiError(404, "Order not found for this delivery partner");

  const canMoveToOutForDelivery = status === "Out for Delivery" && ["Accepted", "Preparing"].includes(order.status);
  const canMoveToDelivered = status === "Delivered" && order.status === "Out for Delivery";
  if (!canMoveToOutForDelivery && !canMoveToDelivered) {
    throw new ApiError(400, `Cannot move order from ${order.status} to ${status}`);
  }

  order.status = status;
  if (status === "Delivered") {
    order.deliveredAt = new Date();
  }
  order.statusHistory.push({ status, at: new Date(), note });
  await order.save();

  return order;
};

// ===== Bakery Owner Functions =====

export const listOrdersForBakeryOwner = async ({ bakeryId, page = 1, limit = 20, status }) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const query = { bakeryId };
  if (status) query.status = status;

  const [orders, totalItems] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .populate("bakeryId", "name address location")
      .populate("userId", "name email phone")
      .populate("deliveryPartnerId", "name email")
      .lean(),
    Order.countDocuments(query),
  ]);

  const totalPages = Math.max(Math.ceil(totalItems / perPage), 1);
  return {
    data: orders,
    pagination: {
      totalItems,
      totalPages,
      currentPage,
      limit: perPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
};

export const getBakeryByOwnerId = async (ownerId) => {
  const bakery = await Bakery.findOne({ ownerId });
  if (!bakery) throw new ApiError(404, "Bakery not found for this owner");
  return bakery;
};

export const updateOrderStatusForBakeryOwner = async ({ orderId, bakeryOwnerId, status, note = "" }) => {
  // First get the bakery owner to find their bakery
  const bakery = await Bakery.findOne({ ownerId: bakeryOwnerId });
  if (!bakery) throw new ApiError(403, "You don't own a bakery");

  const order = await Order.findOne({ _id: orderId, bakeryId: bakery._id });
  if (!order) throw new ApiError(404, "Order not found for your bakery");

  assertValidStatusTransition(order.status, status);

  if (order.status === status) return order;

  // Bakery owners can only move to: Accepted or Preparing
  if (!["Accepted", "Preparing"].includes(status)) {
    throw new ApiError(403, "Bakery owners can only accept or mark orders as preparing");
  }

  order.status = status;
  order.statusHistory.push({ status, at: new Date(), note: note || `Status updated by bakery: ${status}` });
  await order.save();

  return Order.findById(order._id)
    .populate("bakeryId", "name address location")
    .populate("userId", "name email phone")
    .populate("deliveryPartnerId", "name email");
};
