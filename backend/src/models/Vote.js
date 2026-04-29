import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  voter: { type: mongoose.Schema.Types.ObjectId, ref: "Voter", required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
  constituency: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export const Vote = mongoose.model("Vote", voteSchema);