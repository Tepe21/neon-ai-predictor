import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import webpush from "web-push";

// ROUTES & SERVICES
import liveRoutes from "./routes/live.js";
import { processAlerts } from "./services/alertEngine.js";

/* ===============================
   BASIC SETUP
================================ */
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===============================
   MIDDLEWARE
================================ */
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ===============================
   VAPID (PUSH)
================================ */
const VAPID_PUBLIC_KEY =
  "BH0I8IqO8zfTxP6kVP1TJuGTR6APnBAjyIK58kAC0yLIdwPdqXyfAA8sSHNv25j7YmvjumvrvRMK9gwq6ljcX6s";

const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PRIVATE_KEY) {
  console.warn("⚠️ VAPID_PRIVATE_KEY is missing");
} else {
  webpush.setVapidDetails(
    "mailto:admin@aifootballpicks.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

/* ===============================
   PUSH SUBSCRIPTIONS (TEMP)
   ⚠️ In-memory (OK for now)
================================ */
const subscriptions = [];

/* ===============================
   ROUTES
================================ */

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    subscriptions: subscriptions.length
  });
});

// Subscribe to push notifications
app.post("/api/subscribe", async (req, res) => {
  const sub = req.body;

  if (!sub || !sub.endpoint) {
    return res.status(400).json({ error: "Invalid subscription" });
  }

  const exists = subscriptions.find(
    (s) => s.endpoint === sub.endpoint
  );

  if (!exists) {
    subscriptions.push(sub);
  }

  // 🔔 Test push on subscribe (επιβεβαίωση)
  try {
    const payload = JSON.stringify({
      title: "✅ Alerts Enabled",
      body: "AI Football Picks – You will receive live alerts."
    });

    await webpush.sendNotification(sub, payload);
  } catch (err) {
    console.error("Test push failed:", err.message);
  }

  console.log("🔔 Subscriptions:", subscriptions.length);
  res.json({ success: true });
});

// Live matches + probability
app.use("/api", liveRoutes);

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ===============================
   🔔 AUTO ALERT SCANNER
   Runs every 60 seconds
================================ */
setInterval(async () => {
  try {
    const res = await fetch("http://localhost:3000/api/live/matches");
    const matches = await res.json();

    if (Array.isArray(matches) && matches.length > 0) {
      await processAlerts(matches, subscriptions);
    }
  } catch (err) {
    console.error("Alert scanner error:", err.message);
  }
}, 60 * 1000);

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
