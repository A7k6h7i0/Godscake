import mongoose from "mongoose";

const bakerySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
        validate: {
          validator: (arr) => Array.isArray(arr) && arr.length === 2,
          message: "Location coordinates must be [lng, lat]",
        },
      },
    },
    rating: { type: Number, default: 4, min: 0, max: 5 },
    phone: { type: String, default: "" },
    sourceRef: { type: String, default: "" },
  },
  { timestamps: true }
);

bakerySchema.index({ location: "2dsphere" });
bakerySchema.index({ name: "text", address: "text" });
bakerySchema.index({ sourceRef: 1 }, { unique: true, sparse: true });

export default mongoose.model("Bakery", bakerySchema);
