import express from "express";
import { subscriptions } from "../services/subscriptionsStore.js";

const router = express.Router();

router.post("/", (req, res) => {
  const sub = req.body;

  // avoid duplicates
  const exists = subscriptions.find(
    s => s.endpoint === sub.endpoint
  );

  if (!exists) {
    subscriptions.push(sub);
  }

  console.log("🔔 Subscriptions count:", subscriptions.length);

  res.json({ success: true });
});

export default router;
