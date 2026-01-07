import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const subscriptions = new Set();

export function addSubscription(sub) {
  subscriptions.add(JSON.stringify(sub));
}

export async function sendPushToAll(payload) {
  const results = [];

  for (const raw of subscriptions) {
    const sub = JSON.parse(raw);
    try {
      await webpush.sendNotification(
        sub,
        JSON.stringify(payload)
      );
      results.push({ ok: true });
    } catch (err) {
      results.push({ ok: false, error: err.message });
    }
  }

  return results;
}
