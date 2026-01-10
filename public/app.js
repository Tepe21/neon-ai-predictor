// ================================
// AI Football Picks - Frontend Logic
// Manual Search UI Wiring
// ================================

document.addEventListener("DOMContentLoaded", () => {

  // ----------------------------
  // Dropdown click toggle system
  // ----------------------------
  function setupDropdown(buttonId, menuId) {
    const btn = document.getElementById(buttonId);
    const menu = document.getElementById(menuId);

    if (!btn || !menu) return;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeAllDropdowns();
      menu.classList.toggle("open");
    });
  }

  function closeAllDropdowns() {
    document.querySelectorAll(".dropdown-menu").forEach((m) => {
      m.classList.remove("open");
    });
  }

  document.addEventListener("click", () => {
    closeAllDropdowns();
  });

  // Connect dropdowns
  setupDropdown("btn-live-upcoming", "menu-live-upcoming");
  setupDropdown("btn-goals-corners", "menu-goals-corners");
  setupDropdown("btn-language", "menu-language");


  // ----------------------------
  // Store selected filter values
  // ----------------------------
  let selectedMode = "live";
  let selectedMarket = "goals";
  let selectedLanguage = "en";


  // Mode dropdown
  document.querySelectorAll("#menu-live-upcoming div").forEach((item) => {
    item.addEventListener("click", () => {
      selectedMode = item.dataset.value;
      document.getElementById("btn-live-upcoming").innerText = item.innerText;
      closeAllDropdowns();
    });
  });

  // Market dropdown
  document.querySelectorAll("#menu-goals-corners div").forEach((item) => {
    item.addEventListener("click", () => {
      selectedMarket = item.dataset.value;
      document.getElementById("btn-goals-corners").innerText = item.innerText;
      closeAllDropdowns();
    });
  });

  // Language dropdown
  document.querySelectorAll("#menu-language div").forEach((item) => {
    item.addEventListener("click", () => {
      selectedLanguage = item.dataset.value;
      document.getElementById("btn-language").innerText = item.innerText;
      closeAllDropdowns();
      applyLanguage();
    });
  });


  // ----------------------------
  // Apply language switch
  // ----------------------------
  function applyLanguage() {
    const input = document.getElementById("input-fixture");
    const analyzeBtn = document.getElementById("analyze-btn");

    if (!input || !analyzeBtn) return;

    if (selectedLanguage === "el") {
      input.placeholder = "Εισαγωγή αγώνα";
      analyzeBtn.innerText = "Ανάλυση";
    } else {
      input.placeholder = "Enter match";
      analyzeBtn.innerText = "Analyze";
    }
  }


  // ----------------------------
  // Analyze button → Backend call
  // ----------------------------
  const analyzeBtn = document.getElementById("analyze-btn");

  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", async () => {

      const fixtureInput = document.getElementById("input-fixture").value.trim();

      if (!fixtureInput) {
        alert("Insert match ID or name");
        return;
      }

      const payload = {
        mode: selectedMode,
        market: selectedMarket,
        query: fixtureInput
      };

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log("Analyze response:", data);

        alert("Analyze OK → Check console");
      } catch (err) {
        console.error("Analyze error:", err);
        alert("Backend error");
      }
    });
  }

});
