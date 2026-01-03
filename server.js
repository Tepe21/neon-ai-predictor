import express from "express";
import webpush from "web-push";
import path from "path";
import { fileURLToPath } from "url";

// ROUTES
import liveRoutes from "./routes/live.js";

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
   VAPID KEYS (PUSH)
================================ */
const VAPID_PUBLIC_KEY =
  "BH0I8IqO8zfTxP6kVP1TJuGTR6APnBAjyIK58kAC0yLIdwPdqXyfAA8sSHNv25j7YmvjumvrvRMK9gwq6ljcX6s";

const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY; // 👈 από Render ENV

if (VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:admin@aifootballpicks.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

/* ===============================
   PUSH SUBSCRIPTIONS (TEMP STORAGE)
================================ */
const subscriptions = [];

/* ===============================
   ROUTES
================================ */

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    subscriptions: subscriptions.length,
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

  // 🔔 TEST PUSH ON SUBSCRIBE (για επιβεβαίωση)
  try {
    const payload = JSON.stringify({
      title: "✅ Push Enabled",
      body: "AI Football Picks – Alerts are now active!",
    });

    await webpush.sendNotification(sub, payload);
  } catch (err) {
    console.error("Push test failed:", err.message);
  }

  console.log("🔔 Subscriptions:", subscriptions.length);
  res.json({ success: true });
});

// ===============================
// ⚽ LIVE MATCHES ROUTE (API-FOOTBALL)
// ===============================
app.use("/api/live", liveRoutes);

// ===============================
// 🔔 TEST PUSH ENDPOINT
// ===============================
app.get("/api/push/test", async (req, res) => {
  if (subscriptions.length === 0) {
    return res.json({ sent: 0 });
  }

  const payload = JSON.stringify({
    title: "🚨 TEST ALERT",
    body: "This is a manual test push notification.",
  });

  let sent = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
      sent++;
    } catch (err) {
      console.error("Push error:", err.message);
    }
  }

  res.json({ sent });
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
