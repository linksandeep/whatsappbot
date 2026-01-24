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
    // The unique ID Meta provides for every form submission
    leadId: { 
      type: String, 
      unique: true, 
      sparse: true 
    },
    // Tracks the flow: NEW -> SENT -> REPLIED
    status: { 
      type: String, 
      enum: ["NEW", "SENT", "FAILED", "REPLIED"], 
      default: "NEW" 
    }, 

    // Useful if you have multiple lead forms
    formName: { 
      type: String 
    }
  },
  { timestamps: true }
);

export const Lead = mongoose.model("Lead", LeadSchema);