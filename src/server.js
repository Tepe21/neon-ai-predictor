import express from "express";
import cors from "cors";
import { generateMockAlerts } from "./services/mockLiveEngine.js";
import { addSubscription, sendPush } from "./services/pushService.js";

const app = express();
app.use(cors());
app.use(express.json());

let currentAlerts = [];
let lastPushedId = null;

// health
app.get("/health", (req, res) => {
  res.json({ status: "ok", mode: "mock-beta-push" });
});

// subscribe endpoint
app.post("/api/subscribe", (req, res) => {
  addSubscription(req.body);
  res.json({ success: true });
});

// live alerts
app.get("/api/live-alerts", async (req, res) => {
  const newAlerts = generateMockAlerts();

  if (newAlerts.length) {
    const alert = newAlerts[0];

    currentAlerts = [alert, ...currentAlerts].slice(0, 5);

    if (
      alert.id !== lastPushedId &&
      (alert.level === "high" || alert.level === "bomb")
    ) {
      lastPushedId = alert.id;
      await sendPush(alert);
      console.log("🔔 Push sent:", alert.match);
    }
  }

  res.json(currentAlerts);
});

app.listen(3000, () => {
  console.log("🚀 Server with Push running on port 3000");
});
