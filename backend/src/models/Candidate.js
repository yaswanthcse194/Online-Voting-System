import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  party: { 
    type: String, 
    required: true,
    // Allow all parties from your TN election data
    enum: [
      "DMK", "AIADMK", "BJP", "INC", "TVK", "NTK", 
      "PMK", "AMMK", "DMDK", "VCK", "KMDK", "AIPTMMK",
      "CPI", "CPI(M)", "IUML", "NOTA", "Others"
    ]
  },
  constituency: { type: String, required: true },
  symbol: { type: String, default: "🗳️" },
  votes: { type: Number, default: 0 }
}, { timestamps: true });

export const Candidate = mongoose.model("Candidate", candidateSchema);