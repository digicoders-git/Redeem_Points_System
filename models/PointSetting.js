import mongoose from "mongoose";

const pointSettingSchema = new mongoose.Schema(
  {
    amountPerPoint: {
      type: Number,
      required: true,
      default: 100, // 100 rupees = 1 point
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PointSetting", pointSettingSchema);
