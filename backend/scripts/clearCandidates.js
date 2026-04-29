// backend/scripts/clearCandidates.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Candidate } from "../src/models/Candidate.js";
import { Vote } from "../src/models/Vote.js";

dotenv.config();

const clearData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Delete all candidates and votes
    await Candidate.deleteMany({});
    await Vote.deleteMany({});
    
    console.log("🗑️ All candidates and votes cleared successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

clearData();