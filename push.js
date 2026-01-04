// 🔑 ΑΛΛΑΞΕ ΜΟΝΟ ΑΥΤΟ
const VAPID_PUBLIC_KEY = "BGI6hcqOvNTtAth3gopsUuQnaqXb_bHBNnUwDhVE-FblyV8a0wX6mGhiu-xVWvWwfK04ZiGqxzGZiZshMdYYI78";

/* ==================================================
   Helpers
================================================== */

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

/* ==================================================
   Push Enable Flow
================================================== */

const btn = document.getElementById("enablePushBtn");
const statusEl = document.getElementById("status");

async function enablePush() {
  try {
    btn.disabled = true;
    statusEl.textContent = "Requesting permission...";

    if (!("serviceWorker" in navigator)) {
      statusEl.textContent = "Service Worker not supported";
      return;
    }

    // Ζήτα permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      statusEl.textContent = "❌ Notifications denied";
      btn.disabled = false;
      return;
    }

    // Register Service Worker
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("✅ Service Worker registered");

    // Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    console.log("📬 Push subscription:", subscription);

    // Send to backend
    const response = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });

    const result = await response.json();

    if (result.success) {
      statusEl.textContent = "✅ Notifications enabled!";
    } else {
      statusEl.textContent = "❌ Backend error";
      btn.disabled = false;
    }
  } catch (err) {
    console.error("Push enable error:", err);
    statusEl.textContent = "❌ Error enabling notifications";
    btn.disabled = false;
  }
}

/* ==================================================
   Button Hook
================================================== */

if (btn) {
  btn.addEventListener("click", enablePush);
}
