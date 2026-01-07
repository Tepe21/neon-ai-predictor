self.addEventListener("push", event => {
  const data = event.data?.json() || {};

  event.waitUntil(
    self.registration.showNotification(
      data.title || "Live Alert",
      {
        body: data.body || "New live opportunity detected",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        vibrate: [100, 50, 100]
      }
    )
  );
});
