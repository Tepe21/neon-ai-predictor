import express from "express";
import webpush from "web-push";
import path from "path";
import { fileURLToPath } from "url";

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
   VAPID KEYS
   ⚠️ ΑΛΛΑΖΕΙΣ ΜΟΝΟ ΑΝ ΧΡΕΙΑΖΕΤΑΙ
================================ */
const VAPID_PUBLIC_KEY =
  "BH0I8IqO8zfTxP6kVP1TJuGTR6APnBAjyIK58kAC0yLIdwPdqXyfAA8sSHNv25j7YmvjumvrvRMK9gwq6ljcX6s";

const VAPID_PRIVATE_KEY =
  "Kmx4XDTOJ4RGmIWa8w-5f__0qUqduUxNMquF5wbwX5E"; // 👈 αν δεν το έχεις ήδη βάλει σωστά

webpush.setVapidDetails(
  "mailto:admin@aifootballpicks.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

/* ===============================
   SHARED SUBSCRIPTIONS STORE
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
app.post("/api/subscribe", (req, res) => {
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

  console.log("🔔 Subscriptions count:", subscriptions.length);

  res.json({ success: true });
});

// TEST PUSH (GET)
app.get("/api/push/test", async (req, res) => {
  if (subscriptions.length === 0) {
    return res.json({ sent: 0, error: "No subscriptions" });
  }

  const payload = JSON.stringify({
    title: "🚨 TEST ALERT",
    body: "AI Football Picks – Push notifications are LIVE!",
  });

  let sent = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
      sent++;
    } catch (err) {
      console.error("❌ Push error:", err.message);
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
