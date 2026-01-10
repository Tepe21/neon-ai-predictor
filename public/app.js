// public/app.js

document.addEventListener("DOMContentLoaded", () => {

  // ===== Tabs (Manual Search / Live Alerts) =====
  const tabs = document.querySelectorAll(".tab");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
    });
  });


  // ===== Dropdowns (Live/Upcoming & Goals/Corners) =====
  const dropdowns = document.querySelectorAll(".dropdown");

  dropdowns.forEach(dropdown => {
    const button = dropdown.querySelector(".drop-btn");
    const menu = dropdown.querySelector(".drop-menu");

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      closeAllDropdowns();
      menu.classList.toggle("show");
    });

    // επιλογή item
    menu.querySelectorAll("div").forEach(item => {
      item.addEventListener("click", () => {
        button.innerHTML = item.innerHTML;
        menu.classList.remove("show");
      });
    });
  });

  function closeAllDropdowns() {
    document.querySelectorAll(".drop-menu").forEach(m => {
      m.classList.remove("show");
    });
  }

  document.addEventListener("click", closeAllDropdowns);


  // ===== Language switch =====
  const langBox = document.querySelector(".lang");
  const langMenu = document.querySelector(".lang-menu");

  langBox.addEventListener("click", (e) => {
    e.stopPropagation();
    langMenu.classList.toggle("show");
  });

  langMenu.querySelectorAll("div").forEach(item => {
    item.addEventListener("click", () => {
      langBox.innerHTML = `🌐 ${item.innerText} ▼`;
      langMenu.classList.remove("show");
    });
  });

  document.addEventListener("click", () => {
    langMenu.classList.remove("show");
  });


  // ===== Analyze button =====
  const analyzeBtn = document.querySelector(".analyze-btn");
  const matchInput = document.querySelector(".match-input");

  analyzeBtn.addEventListener("click", async () => {

    const match = matchInput.value.trim();
    if (!match) {
      alert("Εισάγετε όνομα αγώνα");
      return;
    }

    // πάρε mode από Live/Upcoming
    const mode = document.querySelectorAll(".drop-btn")[0].innerText.toLowerCase().includes("upcoming")
      ? "upcoming"
      : "live";

    // πάρε market από Goals/Corners
    const market = document.querySelectorAll(".drop-btn")[1].innerText.toLowerCase().includes("corners")
      ? "corners"
      : "goals";

    analyzeBtn.innerText = "Loading...";

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, market, query: match })
      });

      const data = await res.json();
      console.log("Analyze result:", data);
      alert("Check console for result ✔");

    } catch (err) {
      console.error(err);
      alert("API error");
    }

    analyzeBtn.innerText = "🔎 Analyze";
  });

});
