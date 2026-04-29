import express from "express";
import { Candidate } from "../models/Candidate.js";
import { Vote } from "../models/Vote.js";
import { Voter } from "../models/Voter.js";

const router = express.Router();

// 🌱 Flexible Seed Endpoint (Accepts JSON array)
router.post("/election/seed", async (req, res) => {
  try {
    const { candidates, clearFirst = true } = req.body;

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ message: "Please provide an array of candidates" });
    }

    // Optional: Clear existing first
    if (clearFirst) {
      await Candidate.deleteMany({});
      await Vote.deleteMany({});
    }

    // Validate & insert
    const validCandidates = candidates.map(c => ({
      name: c.name?.trim(),
      party: c.party?.toUpperCase(),
      constituency: c.constituency?.trim(),
      symbol: c.symbol || "🗳️",
      votes: 0
    })).filter(c => c.name && c.party && c.constituency);

    if (validCandidates.length === 0) {
      return res.status(400).json({ message: "No valid candidates to insert" });
    }

    const result = await Candidate.insertMany(validCandidates);
    res.json({ 
      message: `✅ Seeded ${result.length} candidates`, 
      inserted: result.map(r => ({ name: r.name, party: r.party, constituency: r.constituency }))
    });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ message: "Seeding failed" });
  }
});

// Get candidates for a constituency
router.get("/election/candidates/:constituency", async (req, res) => {
  try {
    const candidates = await Candidate.find({ constituency: req.params.constituency }).sort({ votes: -1 });
    res.json(candidates);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// Cast a vote
router.post("/election/vote", async (req, res) => {
  try {
    const { voterId, candidateId, constituency } = req.body;
    const voter = await Voter.findById(voterId);
    if (!voter) return res.status(404).json({ message: "Voter not found" });
    if (voter.status !== "approved") return res.status(403).json({ message: "Voter not approved" });
    if (voter.hasVoted) return res.status(400).json({ message: "You have already voted" });

    const candidate = await Candidate.findById(candidateId);
    if (!candidate || candidate.constituency !== constituency) {
      return res.status(400).json({ message: "Invalid candidate or constituency mismatch" });
    }

    await Vote.create({ voter: voter._id, candidate: candidate._id, constituency });
    await Candidate.findByIdAndUpdate(candidate._id, { $inc: { votes: 1 } });
    await Voter.findByIdAndUpdate(voter._id, { hasVoted: true });

    res.json({ message: "✅ Vote recorded successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Voting failed" });
  }
});

// Live Results
router.get("/election/results/:constituency", async (req, res) => {
  try {
    const { constituency } = req.params;
    const candidates = await Candidate.find({ constituency }).sort({ votes: -1 });
    const totalApproved = await Voter.countDocuments({ constituency, status: "approved" });
    const votedCount = await Voter.countDocuments({ constituency, hasVoted: true });

    res.json({
      constituency,
      candidates,
      turnout: {
        totalApproved,
        voted: votedCount,
        percentage: totalApproved ? Math.round((votedCount / totalApproved) * 100) : 0
      }
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch results" });
  }
});

export default router;