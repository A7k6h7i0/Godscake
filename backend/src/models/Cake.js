import mongoose from "mongoose";

const cakeSchema = new mongoose.Schema(
  {
    bakeryId: { type: mongoose.Schema.Types.ObjectId, ref: "Bakery", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Cake", cakeSchema);
