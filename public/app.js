document.addEventListener("DOMContentLoaded", () => {

  // --- Mode button (Live / Upcoming)
  const modeBtn = document.querySelector(".mode-selector");
  const modeDropdown = document.querySelector(".mode-dropdown");
  const modeLabel = modeBtn?.querySelector("span");

  // --- Market button (Goals / Corners)
  const marketBtn = document.querySelector(".market-selector");
  const marketDropdown = document.querySelector(".market-dropdown");
  const marketLabel = marketBtn?.querySelector("span");

  // --- Language button
  const langBtn = document.querySelector(".lang-selector");
  const langDropdown = document.querySelector(".lang-dropdown");
  const langLabel = langBtn?.querySelector("span");

  // --- Input + Analyze
  const matchInput = document.querySelector("input[type='text']");
  const analyzeBtn = document.querySelector(".analyze-btn");

  // --- Debug check
  if (!modeBtn || !marketBtn || !langBtn || !analyzeBtn) {
    console.error("UI elements not found in DOM");
    return;
  }

  let selectedMode = "live";
  let selectedMarket = "goals";
  let selectedLang = "EN";

  // ---------------- Mode dropdown
  modeBtn.addEventListener("click", () => {
    modeDropdown.classList.toggle("show");
  });

  modeDropdown.querySelectorAll("[data-mode]").forEach(item => {
    item.addEventListener("click", () => {
      selectedMode = item.dataset.mode;
      modeLabel.innerText = item.innerText;
      modeDropdown.classList.remove("show");
    });
  });

  // ---------------- Market dropdown
  marketBtn.addEventListener("click", () => {
    marketDropdown.classList.toggle("show");
  });

  marketDropdown.querySelectorAll("[data-market]").forEach(item => {
    item.addEventListener("click", () => {
      selectedMarket = item.dataset.market;
      marketLabel.innerText = item.innerText;
      marketDropdown.classList.remove("show");
    });
  });

  // ---------------- Language dropdown
  langBtn.addEventListener("click", () => {
    langDropdown.classList.toggle("show");
  });

  langDropdown.querySelectorAll("[data-lang]").forEach(item => {
    item.addEventListener("click", () => {
      selectedLang = item.dataset.lang;
      langLabel.innerText = selectedLang;
      langDropdown.classList.remove("show");
    });
  });

  // ---------------- Analyze
  analyzeBtn.addEventListener("click", async () => {
    const query = matchInput.value.trim();
    if (!query) return;

    analyzeBtn.innerText = "Analyzing...";

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: selectedMode,
          market: selectedMarket,
          query
        })
      });

      const data = await res.json();
      console.log("Analysis:", data);
      alert("Analysis completed. Check console.");
    } catch (err) {
      console.error("Analyze error:", err);
      alert("Backend error");
    }

    analyzeBtn.innerText = "Analyze";
  });

});
