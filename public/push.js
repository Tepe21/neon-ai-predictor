// ===============================
// Base64URL → Uint8Array (FIXED)
// ===============================
window.urlBase64ToUint8Array = function (base64String) {
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

// ===============================
// Enable Push Notifications
// ===============================
async function enablePush() {
  console.log("🔔 enablePush() called");

  if (!("serviceWorker" in navigator)) {
    alert("Service Workers not supported");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    alert("Permission denied");
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      window.VAPID_PUBLIC_KEY
    ),
  });

  console.log("📩 Push subscription:", subscription);

  // Send subscription to backend
  const res = await fetch("/api/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscription),
  });

  const data = await res.json();
  console.log("✅ Backend response:", data);

  return true;
}
