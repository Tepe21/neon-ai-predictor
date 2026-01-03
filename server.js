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

const VAPID_PUBLIC_KEY = "BIMzPAE_dr2geB-QXq4v4gJYsDekCTki-_5QRFxbk_VpWfWl5YeJny_ISvJFH8M-nUibeGrurqkCww0VnuyOntQ";
const VAPID_PRIVATE_KEY = "Kmx4XDTOJ4RGmIWa8w-5f__0qUqduUxNMquF5wbwX5E";

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
// ===============================
// 🔔 TEST PUSH ENDPOINT
// ===============================
app.get("/api/push/test", async (req, res) => {
  if (!global.subscriptions || global.subscriptions.length === 0) {
    return res.json({ sent: 0, error: "No subscriptions" });
  }

  const payload = JSON.stringify({
    title: "🚨 TEST ALERT",
    body: "AI Football Picks – Push notifications are LIVE!",
  });

  let sent = 0;

  for (const sub of global.subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
      sent++;
    } catch (err) {
      console.error("Push error:", err.message);
    }
  }

  res.json({ sent });
});
