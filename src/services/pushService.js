import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const subscriptions = [];

export function addSubscription(sub) {
  subscriptions.push(sub);
}

export async function sendPush(alert) {
  const payload = JSON.stringify({
    title: "🚨 AI Football Pick",
    body: `${alert.match}\n${alert.market} @ ${alert.odd}\nConfidence: ${alert.confidence}%`,
    level: alert.level
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
    } catch (err) {
      console.error("Push error:", err.message);
    }
  }
}
