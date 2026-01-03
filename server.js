import express from "express";
import webpush from "web-push";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());

// ====== VAPID ======
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error("❌ Missing VAPID keys");
  process.exit(1);
}

webpush.setVapidDetails(
  "mailto:test@example.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// ====== STORAGE (simple JSON file) ======
const SUBS_FILE = "./subscriptions.json";
let subscriptions = [];

if (fs.existsSync(SUBS_FILE)) {
  subscriptions = JSON.parse(fs.readFileSync(SUBS_FILE));
}

// ====== STATIC FILES ======
app.use(express.static("public"));

// ====== HEALTH CHECK ======
app.get("/health", (req, res) => {
  res.json({ status: "ok", subscriptions: subscriptions.length });
});

// ====== SUBSCRIBE ======
app.post("/api/subscribe", (req, res) => {
  const sub = req.body;

  const exists = subscriptions.find(s => s.endpoint === sub.endpoint);
  if (!exists) {
    subscriptions.push(sub);
    fs.writeFileSync(SUBS_FILE, JSON.stringify(subscriptions, null, 2));
  }

  res.json({ success: true });
});

// ====== PUSH TEST ======
app.get("/api/push/test", async (req, res) => {
  let sent = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        sub,
        JSON.stringify({
          title: "🔥 AI Football Picks",
          body: "Test push notification",
        })
      );
      sent++;
    } catch (err) {
      console.error("Push error:", err.message);
    }
  }

  res.json({ sent });
});

// ====== START ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
