self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};

  self.registration.showNotification(
    data.title || "AI Football Alert",
    {
      body: data.body || "High probability goal detected ⚽",
      icon: "/icon-192.png",
    }
  );
});
