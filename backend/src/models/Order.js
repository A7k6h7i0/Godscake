import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    cakeId: { type: mongoose.Schema.Types.ObjectId, ref: "Cake", default: null },
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", default: null },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderStatusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Placed", "Accepted", "Preparing", "Arrived", "Out for Delivery", "Delivered"],
      required: true,
    },
    at: { type: Date, required: true, default: Date.now },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bakeryId: { type: mongoose.Schema.Types.ObjectId, ref: "Bakery", required: true, index: true },
    recipientName: { type: String, default: "" },
    recipientPhone: { type: String, default: "" },
    deliveryAddress: { type: String, required: true },
    deliveryLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    items: { type: [orderItemSchema], required: true, validate: [(v) => v.length > 0, "Items required"] },
    orderItemIds: { type: [mongoose.Schema.Types.ObjectId], ref: "OrderItem", default: [] },
    status: {
      type: String,
      enum: ["Placed", "Accepted", "Preparing", "Arrived", "Out for Delivery", "Delivered"],
      default: "Placed",
      index: true,
    },
    statusHistory: { type: [orderStatusHistorySchema], default: [] },
    deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    deliveryAcceptedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    deliveryDistanceKm: { type: Number, default: 0 },
    deliveryPayout: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

orderSchema.index({ deliveryLocation: "2dsphere" });

export default mongoose.model("Order", orderSchema);
