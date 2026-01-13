import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    status: { type: String, default: "PENDING" }
  },
  { timestamps: true }
);

export const Lead = mongoose.model("Lead", LeadSchema);
