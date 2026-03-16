import Order from "../models/Order.js";
import { getBakeryForOwner } from "./bakeryManagementService.js";
import { ApiError } from "../middlewares/errorMiddleware.js";

const STATUS_FLOW = ["Placed", "Accepted", "Preparing", "Out for Delivery", "Delivered"];

const canTransition = (current, next) => {
  const currentIndex = STATUS_FLOW.indexOf(current);
  const nextIndex = STATUS_FLOW.indexOf(next);
  if (currentIndex === -1 || nextIndex === -1) return false;
  return nextIndex === currentIndex + 1;
};

export const listOwnerOrders = async (owner, { status }) => {
  const bakery = await getBakeryForOwner(owner);
  if (!bakery) throw new ApiError(404, "Bakery profile not found");

  const filter = { bakeryId: bakery._id };
  if (status) filter.status = status;

  return Order.find(filter)
    .sort({ createdAt: -1 })
    .populate("userId", "name email")
    .lean();
};

export const updateOwnerOrderStatus = async (owner, orderId, { status, note }) => {
  const bakery = await getBakeryForOwner(owner);
  if (!bakery) throw new ApiError(404, "Bakery profile not found");

  if (!["Accepted", "Preparing"].includes(status)) {
    throw new ApiError(403, "Bakery owners can only accept or mark orders as preparing");
  }

  const order = await Order.findOne({ _id: orderId, bakeryId: bakery._id });
  if (!order) throw new ApiError(404, "Order not found");

  if (!canTransition(order.status, status)) {
    throw new ApiError(400, `Invalid status transition from ${order.status} to ${status}`);
  }

  order.status = status;
  order.statusHistory.push({ status, note: note || "" });

  if (status === "Delivered") {
    order.deliveredAt = new Date();
  }

  await order.save();
  return order;
};
