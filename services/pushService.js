import webpush from "web-push";

// ΡΥΘΜΙΣΗ VAPID (βάλε τα δικά σου από ENV)
webpush.setVapidDetails(
  "mailto:admin@aifootballpicks.app",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// In-memory store (v1) – αργότερα DB
const subscriptions = [];
const sentCache = new Set(); // για να μην στείλουμε διπλό push

export function addSubscription(sub) {
  subscriptions.push(sub);
}

export async function sendAlertOnce(alert) {
  // Μοναδικό key ανά αγώνα + market
  const cacheKey = `${alert.match}-${alert.market}`;

  // Στέλνουμε push ΜΟΝΟ για High / Bomb
  if (alert.level === "normal") return;
  if (sentCache.has(cacheKey)) return;

  const payload = JSON.stringify({
    title:
      alert.level === "bomb"
        ? "💣 GOAL BOMB | ΒΟΜΒΑ ΓΚΟΛ"
        : "🔥 HIGH VALUE GOAL | ΔΥΝΑΤΟ ΓΚΟΛ",
    body: `${alert.match} · ${alert.minute}’
${alert.market}
Confidence: ${alert.confidence}%`,
    url: "/"
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
    } catch (err) {
      console.error("Push error:", err?.message);
    }
  }

  sentCache.add(cacheKey);
}
