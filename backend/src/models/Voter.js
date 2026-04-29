import mongoose from "mongoose";

const voterSchema = new mongoose.Schema({
  epicId: {
    type: String,
    required: [true, "EPIC ID is required"],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{3}\d{7}$/, "Invalid EPIC ID. Format: 3 letters + 7 numbers"]
  },
  aadhaar: {
    type: String,
    required: [true, "Aadhaar number is required"],
    unique: true,
    trim: true,
    match: [/^\d{12}$/, "Invalid Aadhaar. Must be exactly 12 digits"]
  },
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  mobile: {
    type: String,
    required: [true, "Mobile number is required"],
    trim: true,
    match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"]
  },
  constituency: {
    type: String,
    required: [true, "Constituency is required"],
    trim: true
  },
  password: {
    type: String,
    default: "" // Will be set by admin during approval
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  hasVoted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export const Voter = mongoose.model("Voter", voterSchema);