import express from "express";
import { Voter } from "../models/Voter.js";

const router = express.Router();

// Register a new voter
router.post("/api/voters/register", async (req, res) => {
  try {
    const { epicId, aadhaar, name, mobile, constituency, password } = req.body;

    // Password strength check
    const passRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passRegex.test(password)) {
      return res.status(400).json({ 
        message: "Password must be 8+ chars with 1 uppercase, 1 number, and 1 special character" 
      });
    }

    const existing = await Voter.findOne({ $or: [{ epicId }, { aadhaar }, { mobile }] });
    if (existing) return res.status(400).json({ message: "Voter already registered" });

    await Voter.create({ epicId, aadhaar, name, mobile, constituency, password });
    res.status(201).json({ message: "✅ Registration submitted! Wait for admin approval." });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// Add to voterRoutes.js
router.get("/api/voters/check", async (req, res) => {
  try {
    const { epicId } = req.query;
    const voter = await Voter.findOne({ epicId: epicId.toUpperCase() }).select("-aadhaar -mobile");
    
    if (!voter) return res.status(404).json({ message: "Voter not found" });
    res.json(voter);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});
// Voter Login
router.post("/api/voters/login", async (req, res) => {
  try {
    const { epicId, password } = req.body;
    const voter = await Voter.findOne({ 
      epicId: epicId.toUpperCase(),
      password 
    }).select("-aadhaar -mobile");
    
    if (!voter) {
      return res.status(401).json({ message: "Invalid EPIC ID or password" });
    }
    
    if (voter.status !== "approved") {
      return res.status(403).json({ message: "Account not approved yet" });
    }
    
    res.json(voter);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;