import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { getLiveAlerts } from "./services/liveEngine.js";
import authRoutes from "./routes/auth.js";

const app = express();
app.use(cors());
app.use(express.json());

// DB
mongoose.connect(process.env.MONGO_URL);

// AUTH
app.use("/api/auth", authRoutes);

// HEALTH
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// LIVE ALERTS
app.get("/api/live-alerts", async (req, res) => {
  try {
    const alerts = await getLiveAlerts();
    res.json(alerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Live engine failed" });
  }
});

// SERVER
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
