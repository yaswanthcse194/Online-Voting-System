import express from "express";
import { Voter } from "../models/Voter.js";
import { Candidate } from "../models/Candidate.js";

const router = express.Router();

// Admin Login
router.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    res.json({ success: true, message: "Admin authenticated" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Get Pending Voters
router.get("/api/admin/voters/pending", async (req, res) => {
  try {
    const voters = await Voter.find({ status: "pending" }).select("-__v");
    res.json(voters);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// Update Voter Status (with password for approval)
router.patch("/api/admin/voters/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const voter = await Voter.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!voter) return res.status(404).json({ message: "Voter not found" });
    res.json({ message: `Voter ${status}` });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// Get All Candidates
router.get("/api/admin/candidates", async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ constituency: 1, party: 1 });
    res.json(candidates);
  } catch {
    res.status(500).json({ message: "Failed to fetch candidates" });
  }
});

// Add Candidate
router.post("/api/admin/candidates", async (req, res) => {
  try {
    const { name, party, constituency, symbol } = req.body;
    const newCandidate = await Candidate.create({
      name,
      party,
      constituency,
      symbol: symbol || "🗳️"
    });
    res.status(201).json({ message: "✅ Candidate added successfully", candidate: newCandidate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add candidate" });
  }
});

// Delete Candidate
router.delete("/api/admin/candidates/:id", async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: "🗑️ Candidate deleted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to delete candidate" });
  }
});

export default router;