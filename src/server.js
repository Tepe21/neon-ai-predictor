import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import webPush from "web-push";

// ROUTES
import searchRoutes from "./routes/search.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* ------------------ MIDDLEWARE ------------------ */
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ------------------ VAPID SETUP ------------------ */
if (!process.env.VAPID_PUBLIC || !process.env.VAPID_PRIVATE) {
  console.error("❌ Missing VAPID keys in environment variables");
} else {
  webPush.setVapidDetails(
    "mailto:admin@aifootballpicks.com",
    process.env.VAPID_PUBLIC,
    process.env.VAPID_PRIVATE
  );
}

/* ------------------ MEMORY STORE ------------------ */
const subscriptions = [];

/* ------------------ HEALTH CHECK ------------------ */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    subscriptions: subscriptions.length,
  });
});

/* ------------------ PUSH SUBSCRIBE ------------------ */
app.post("/api/subscribe", (req, res) => {
  const sub = req.body;

  if (!sub || !sub.endpoint) {
    return res.status(400).json({ success: false });
  }

  const exists = subscriptions.find((s) => s.endpoint === sub.endpoint);
  if (!exists) {
    subscriptions.push(sub);
  }

  res.json({ success: true });
});

/* ------------------ PUSH TEST ------------------ */
app.post("/api/push/test", async (req, res) => {
  let sent = 0;
  const errors = [];

  for (const sub of subscriptions) {
    try {
      await webPush.sendNotification(
        sub,
        JSON.stringify({
          title: "⚽ AI Football Picks",
          body: "Live Goal Alert test notification",
        })
      );
      sent++;
    } catch (err) {
      errors.push(err.message);
    }
  }

  res.json({
    sent,
    subscriptions: subscriptions.length,
    errors,
  });
});

/* ------------------ REAL MANUAL SEARCH ------------------ */
app.use("/api/search", searchRoutes);

/* ------------------ ROOT ------------------ */
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

/* ------------------ START SERVER ------------------ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
