import express from "express";
import webpush from "../push.js";
import { subscribers } from "./subscribe.js";

const router = express.Router();

router.post("/", async (req, res) => {
  // --- MOCK LIVE DATA (μετά API) ---
  const result = {
    pick: "Over 9.5 Corners",
    confidence: Math.random()
  };

  let tag = "NORMAL";
  if (result.confidence > 0.75) tag = "HIGH";
  if (result.confidence > 0.9) tag = "BOMB";

  // --- AUTO PUSH ONLY IF VALUE ---
  if (tag !== "NORMAL") {
    const payload = JSON.stringify({
      title: tag === "BOMB" ? "💣 VALUE BOMB" : "🔥 VALUE ALERT",
      body: result.pick
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
    result: { pick: result.pick },
    value: { tag }
  });
});

export default router;
