import express from "express";
import webpush from "../push.js";

const router = express.Router();

// 👇 ΠΡΟΣΟΧΗ: export ΚΑΝΟΝΙΚΑ, ΟΧΙ inline
const subscribers = [];

console.log("✅ subscribe.js loaded");

router.post("/", (req, res) => {
  const { subscription, premium } = req.body;

  if (premium && subscription) {
    subscribers.push(subscription);
  }

  res.json({ ok: true });
});

router.get("/test", async (req, res) => {
  const payload = JSON.stringify({
    title: "🔥 NEON AI ALERT",
    body: "Test notification successful!"
  });

  let sent = 0;

  for (const sub of subscribers) {
    try {
      await webpush.sendNotification(sub, payload);
      sent++;
    } catch (e) {
      console.error("Push error:", e);
    }
  }

  res.json({ sent });
});

// ⬇️ ΣΩΣΤΟ export
export { subscribers };
export default router;
