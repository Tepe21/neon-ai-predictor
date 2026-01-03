import express from "express";
import webpush from "web-push";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

/* ---------------- PATH SETUP ---------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------- MIDDLEWARE ---------------- */
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ---------------- VAPID KEYS ---------------- */
/*
⚠️ ΕΔΩ ΘΑ ΑΛΛΑΞΕΙΣ ΜΟΝΟ ΑΥΤΕΣ ΤΙΣ 2 ΓΡΑΜΜΕΣ
ΒΑΖΕΙΣ ΤΑ ΠΡΑΓΜΑΤΙΚΑ VAPID KEYS ΠΟΥ ΕΧΕΙΣ
*/

const VAPID_PUBLIC_KEY = "BJfVfAdIgz1Z_6fvwxaMptZpAi6AH6H_AZwzowXNUy3bPBE8rPlkj6ERrym3mFBP1jqLevxISzX7m65BieoFj8E
";
const VAPID_PRIVATE_KEY = "zWMkQSBKV7Khsno1a6whAv0lIu4R9oVy6tf9H8dRAtA";

/* -------------------------------------------- */

webpush.setVapidDetails(
  "mailto:admin@aifootballpicks.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

/* ---------------- TEMP STORAGE ---------------- */
/*
Για test κρατάμε subscriptions στη μνήμη.
Αργότερα θα μπουν DB + paid users.
*/
let subscriptions = [];

/* ---------------- ROUTES ---------------- */

/* Subscribe user to push */
app.post("/api/subscribe", (req, res) => {
  const subscription = req.body;

  // απλό guard
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Invalid subscription" });
  }

  subscriptions.push(subscription);
  console.log("🔔 New subscription. Total:", subscriptions.length);

  res.json({ success: true });
});

/* Test push notification */
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
    } catch (err) {
      console.error("❌ Push error:", err.message);
    }
  }

  res.json({ sent });
});

/* Health check */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    subscriptions: subscriptions.length
  });
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
