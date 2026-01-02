import express from "express";
import webpush from "web-push";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* -------- VAPID KEYS (TEST MODE) -------- */
// ⚠️ ΓΙΑ TEST: ΜΗΝ τα αλλάξεις
const VAPID_PUBLIC = "BM2J6h2cYb0EXAMPLE_REPLACE_ME";
const VAPID_PRIVATE = "qPpEXAMPLE_REPLACE_ME";

webpush.setVapidDetails(
  "mailto:test@example.com",
  VAPID_PUBLIC,
  VAPID_PRIVATE
);

/* -------- TEMP STORAGE -------- */
let subscriptions = [];

/* -------- ROUTES -------- */
app.post("/api/subscribe", (req, res) => {
  const sub = req.body;
  subscriptions.push(sub);
  console.log("Subscribed:", subscriptions.length);
  res.json({ success: true });
});

app.post("/api/push/test", async (req, res) => {
  const payload = JSON.stringify({
    title: "AI Football Alert",
    body: "High Value detected · 78% probability",
  });

  let sent = 0;
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
      sent++;
    } catch (e) {
      console.error("Push error", e);
    }
  }
  res.json({ sent });
});

/* -------- START -------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
