/* ========= CONFIG ========= */

// 🔴 ΒΑΛΕ ΕΔΩ ΤΟ ΔΙΚΟ ΣΟΥ VAPID PUBLIC KEY
const VAPID_PUBLIC_KEY =
  "BGI6hcqOvNTtAth3gopsUuQnaqXb_bHBNnUwDhVE-FblyV8a0wX6mGhiu-xVWvWwfK04ZiGqxzGZiZshMdYYI78";

/* ========= HELPERS ========= */

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/* ========= MAIN ========= */

async function enablePush() {
  console.log("enablePush() called");

  if (!("serviceWorker" in navigator)) {
    alert("Service workers not supported");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    alert("Notifications denied");
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  console.log("Service Worker ready");

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  console.log("Push subscription:", subscription);

  const res = await fetch("/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });

  const data = await res.json();
  console.log("Backend response:", data);

  if (data.success) {
    document.getElementById("push-status").innerText =
      "✅ Notifications enabled!";
  } else {
    document.getElementById("push-status").innerText =
      "❌ Subscription failed";
  }
}

/* ========= UI ========= */

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("enable-push-btn");
  if (btn) {
    btn.addEventListener("click", enablePush);
  }
});
