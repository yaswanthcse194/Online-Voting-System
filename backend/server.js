import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import voterRoutes from "./src/routes/voterRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import electionRoutes from "./src/routes/electionRoutes.js";
import statsRoutes from "./src/routes/statsRoutes.js";

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(voterRoutes);
app.use(adminRoutes);
app.use("/api", electionRoutes);
app.use("/api", statsRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("🇮🇳 TN Election 2026 Voting API is Running");
});

// Test Route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend Connected Successfully" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});