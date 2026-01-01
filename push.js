import webpush from "web-push";

if (!process.env.VAPID_PUBLIC || !process.env.VAPID_PRIVATE) {
  console.error("❌ VAPID keys missing");
}

webpush.setVapidDetails(
  "mailto:admin@neon-ai.app",
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
);

export default webpush;
