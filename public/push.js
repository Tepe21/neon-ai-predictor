const VAPID_PUBLIC_KEY =
  "BH0I8IqO8zfTxP6kVP1TJuGTR6APnBAjyIK58kAC0yLIdwPdqXyfAA8sSHNv25j7YmvjumvrvRMK9gwq6ljcX6s";

const btn = document.getElementById("enablePushBtn");
const statusEl = document.getElementById("status");

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

async function enablePush() {
  try {
    btn.disabled = true;
    statusEl.textContent = "Requesting permission...";

    if (!("serviceWorker" in navigator)) {
      statusEl.textContent = "Service Worker not supported";
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      statusEl.textContent = "Permission denied";
      btn.disabled = false;
      return;
    }

    const reg = await navigator.serviceWorker.register("/sw.js");
    console.log("Service Worker registered");

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });

    const data = await res.json();

    if (data.success) {
      statusEl.textContent = "✅ Notifications enabled!";
    } else {
      statusEl.textContent = "❌ Backend error";
      btn.disabled = false;
    }
  } catch (err) {
    console.error(err);
    statusEl.textContent = "❌ Error enabling notifications";
    btn.disabled = false;
  }
}

btn.addEventListener("click", enablePush);
