import express from "express";
import cors from "cors";
import { generateMockAlerts } from "./services/mockLiveEngine.js";

const app = express();
app.use(cors());
app.use(express.json());

let currentAlerts = [];

// health
app.get("/health", (req, res) => {
  res.json({ status: "ok", mode: "mock-beta" });
});

// mock live alerts
app.get("/api/live-alerts", (req, res) => {
  const newAlerts = generateMockAlerts();

  if (newAlerts.length) {
    currentAlerts = [...newAlerts, ...currentAlerts].slice(0, 5);
  }

  res.json(currentAlerts);
});

app.listen(3000, () => {
  console.log("🚀 Mock Live Engine running on port 3000");
});
