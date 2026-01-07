const VAPID_PUBLIC_KEY = "BGI6hcqOvNTtAth3gopsUuQnaqXb_bHBNnUwDhVE-FblyV8a0wX6mGhiu-xVWvWwfK04ZiGqxzGZiZshMdYYI78";

async function enablePush() {
  if (!("serviceWorker" in navigator)) {
    alert("Service workers not supported");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    alert("Notifications blocked");
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY
  });

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription)
  });

  console.log("✅ Push subscription sent to backend");
}
