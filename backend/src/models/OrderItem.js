import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    bakeryId: { type: mongoose.Schema.Types.ObjectId, ref: "Bakery", required: true, index: true },
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", default: null },
    cakeId: { type: mongoose.Schema.Types.ObjectId, ref: "Cake", default: null },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("OrderItem", orderItemSchema);
