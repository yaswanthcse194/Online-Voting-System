// backend/scripts/seedCandidates.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Candidate } from "../src/models/Candidate.js";
import { Vote } from "../src/models/Vote.js";

dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Read JSON file using fs (compatible with Node v24+)
    const jsonPath = path.join(__dirname, "../candidates.json");
    const rawData = fs.readFileSync(jsonPath, "utf8");
    const candidates = JSON.parse(rawData);

    console.log(`📦 Loaded ${candidates.length} candidates from JSON`);

    // Clear existing data
    await Candidate.deleteMany({});
    await Vote.deleteMany({});
    console.log("🗑️ Cleared old candidates and votes");

    // Insert new candidates
    const result = await Candidate.insertMany(candidates);
    console.log(`✅ Successfully seeded ${result.length} candidates!`);
    
    // Show sample
    console.log("\n📋 Sample candidates added:");
    result.slice(0, 8).forEach(c => {
      console.log(`  ${c.symbol} ${c.name} (${c.party}) - ${c.constituency}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seedDB();