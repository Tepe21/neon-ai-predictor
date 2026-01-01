self.addEventListener("push", event => {
  const data = event.data.json();

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/icon.png",
    badge: "/badge.png",
    vibrate: [100, 50, 100],
    tag: "ai-football-picks",
    renotify: true
  });
});
