import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import webpush from "web-push";

import liveRoutes from "./routes/live.js";
import { processAlerts } from "./services/alertEngine.js";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// 🔔 VAPID SETUP
// ===============================
const VAPID_PUBLIC_KEY =
  "BH0I8IqO8zfTxP6kVP1TJuGTR6APnBAjyIK58kAC0yLIdwPdqXyfAA8sSHNv25j7YmvjumvrvRMK9gwq6ljcX6s";

const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails(
  "mailto:admin@aifootballpicks.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// ===============================
// 🔐 SUBSCRIPTIONS STORE
// ===============================
const subscriptions = [];

// ===============================
// 🔐 SUBSCRIBE (PREMIUM FLAG)
// ===============================
app.post("/api/subscribe", (req, res) => {
  const { subscription, isPremium } = req.body;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Invalid subscription" });
  }

  const exists = subscriptions.find(
    (s) => s.endpoint === subscription.endpoint
  );

  if (!exists) {
    subscriptions.push({
      ...subscription,
      isPremium: Boolean(isPremium)
    });
  }

  res.json({ success: true });
});

// ===============================
// ⚽ LIVE ROUTES
// ===============================
app.use("/api", liveRoutes);

// ===============================
// 🔔 AUTO ALERT SCANNER (60")
// ===============================
setInterval(async () => {
  try {
    const res = await fetch("http://localhost:3000/api/live/matches");
    const matches = await res.json();

    await processAlerts(matches, subscriptions);
  } catch (err) {
    console.error("Alert scanner error:", err.message);
  }
}, 60 * 1000);

// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
