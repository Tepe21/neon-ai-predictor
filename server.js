import express from "express";
import webpush from "web-push";

const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(express.json());
app.use(express.static("public"));

/* =======================
   PUSH STORAGE (TEMP)
   (αργότερα DB)
======================= */
const subscriptions = [];

/* =======================
   VAPID CONFIG
======================= */
const VAPID_PUBLIC = process.env.VAPID_PUBLIC;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE;

if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
  console.error("❌ Missing VAPID keys in environment variables");
  process.exit(1);
}

webpush.setVapidDetails(
  "mailto:admin@aifootballpicks.com",
  VAPID_PUBLIC,
  VAPID_PRIVATE
);

/* =======================
   ROUTES
======================= */

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    subscriptions: subscriptions.length,
  });
});

// SUBSCRIBE
app.post("/api/subscribe", (req, res) => {
  const sub = req.body;

  // αποφυγή διπλότυπων
  const exists = subscriptions.find(
    (s) => s.endpoint === sub.endpoint
  );

  if (!exists) {
    subscriptions.push(sub);
    console.log("✅ New subscription added");
  }

  res.json({ success: true });
});

// TEST PUSH
app.get("/api/push/test", async (req, res) => {
  let sent = 0;
  const errors = [];

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        sub,
        JSON.stringify({
          title: "⚽ AI Football Alert",
          body: "High probability GOAL opportunity detected!",
        })
      );
      sent++;
    } catch (err) {
      console.error("❌ Push error:", err.body || err.message);
      errors.push(err.body || err.message);
    }
  }

  res.json({
    sent,
    subscriptions: subscriptions.length,
    errors,
  });
});

/* =======================
   START SERVER
======================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
