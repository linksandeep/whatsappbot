import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    phone: { 
      type: String, 
      required: true,
      trim: true 
    },
    leadId: { 
      type: String, 
      unique: true, 
      sparse: true 
    },
    status: { 
      type: String, 
      // UPDATED: Added "AUTO_SENT" to match your webhook code logic
      enum: ["NEW", "SENT", "FAILED", "REPLIED", "AUTO_SENT"], 
      default: "NEW" 
    }, 
    formName: { 
      type: String 
    }
  },
  { timestamps: true }
);

export const Lead = mongoose.model("Lead", LeadSchema);