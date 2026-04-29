// backend/src/routes/statsRoutes.js
import express from "express";
import { Candidate } from "../models/Candidate.js";
import { Vote } from "../models/Vote.js";
import { Voter } from "../models/Voter.js";

const router = express.Router();

// 📊 Overall Election Summary
router.get("/election/summary", async (req, res) => {
  try {
    const totalVoters = await Voter.countDocuments({ status: "approved" });
    const totalPolled = await Voter.countDocuments({ hasVoted: true });
    const turnout = totalVoters ? Math.round((totalPolled / totalVoters) * 100) : 0;

    // Party-wise aggregated votes
    const partyStats = await Vote.aggregate([
      { $lookup: { from: "candidates", localField: "candidate", foreignField: "_id", as: "candidate" } },
      { $unwind: "$candidate" },
      { $group: { 
          _id: "$candidate.party", 
          votes: { $sum: 1 },
          candidates: { $addToSet: "$candidate.name" }
        }
      },
      { $sort: { votes: -1 } }
    ]);

    // Leading party
    const leading = partyStats[0]?._id || "N/A";
    const leadingVotes = partyStats[0]?.votes || 0;

    res.json({
      summary: {
        totalVoters,
        totalPolled,
        turnout,
        remaining: totalVoters - totalPolled
      },
      partyStats: partyStats.map(p => ({
        party: p._id,
        votes: p.votes,
        percentage: totalPolled ? Math.round((p.votes / totalPolled) * 100) : 0
      })),
      leading: { party: leading, votes: leadingVotes }
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Failed to fetch election summary" });
  }
});

// 🔍 Search Candidates by Party or Constituency
router.get("/election/search", async (req, res) => {
  try {
    const { party, constituency, query } = req.query;
    let filter = {};

    if (party && party !== "All") filter.party = party;
    if (constituency && constituency !== "All") filter.constituency = constituency;
    if (query) filter.name = { $regex: query, $options: "i" };

    const candidates = await Candidate.find(filter)
      .select("name party constituency symbol votes")
      .sort({ votes: -1 })
      .limit(50);

    res.json(candidates);
  } catch {
    res.status(500).json({ message: "Search failed" });
  }
});

// 📍 Constituency-wise Detailed Stats
router.get("/election/constituency/:name", async (req, res) => {
  try {
    const { name } = req.params;
    
    const candidates = await Candidate.find({ constituency: name }).sort({ votes: -1 });
    const totalApproved = await Voter.countDocuments({ constituency: name, status: "approved" });
    const polled = await Voter.countDocuments({ constituency: name, hasVoted: true });
    const turnout = totalApproved ? Math.round((polled / totalApproved) * 100) : 0;

    // Party-wise breakdown for this constituency
    const partyBreakdown = await Vote.aggregate([
      { $match: { constituency: name } },
      { $lookup: { from: "candidates", localField: "candidate", foreignField: "_id", as: "c" } },
      { $unwind: "$c" },
      { $group: { _id: "$c.party", votes: { $sum: 1 } } },
      { $sort: { votes: -1 } }
    ]);

    res.json({
      constituency: name,
      candidates,
      turnout: { totalApproved, polled, percentage: turnout },
      partyBreakdown
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch constituency stats" });
  }
});

export default router;