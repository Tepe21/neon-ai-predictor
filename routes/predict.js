import express from "express";
import webpush from "../push.js";
import { subscribers } from "./subscribe.js";

const router = express.Router();

router.post("/", async (req, res) => {
  // MOCK confidence (μετά real stats)
  const confidence = Math.random();

  let tag = "NORMAL";
  if (confidence > 0.75) tag = "HIGH";
  if (confidence > 0.9) tag = "BOMB";

  const pick = "Over 9.5 Corners";

  // 🔔 PUSH ΜΟΝΟ ΑΝ ΥΠΑΡΧΕΙ VALUE
  if (tag !== "NORMAL") {
    const payload = JSON.stringify({
      title: tag === "BOMB" ? "💣 VALUE BOMB" : "🔥 VALUE ALERT",
      body: pick
    });

    for (const sub of subscribers) {
      try {
        await webpush.sendNotification(sub, payload);
      } catch (e) {
        console.error("Push error:", e);
      }
    }
  }

  res.json({
    result: { pick },
    value: { tag }
  });
});

export default router;
