import mongoose from "mongoose";

const bakerySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    contactEmail: { type: String, default: "", trim: true, lowercase: true },
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
    imageUrl: { type: String, default: "" },
    images: { type: [String], default: [] },
    timings: {
      opensAt: { type: String, default: "" },
      closesAt: { type: String, default: "" },
      daysOpen: { type: [String], default: [] },
    },
    isActive: { type: Boolean, default: true },
    sourceRef: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    ownerAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "BakeryOwner", default: null },
  },
  { timestamps: true }
);

bakerySchema.index({ location: "2dsphere" });
bakerySchema.index({ name: "text", address: "text" });
bakerySchema.index(
  { sourceRef: 1 },
  {
    unique: true,
    partialFilterExpression: {
      sourceRef: { $exists: true, $type: "string", $ne: "" },
    },
  }
);

export default mongoose.model("Bakery", bakerySchema);
