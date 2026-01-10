// public/app.js

document.addEventListener("DOMContentLoaded", () => {

  // --- Mode dropdown (Live / Upcoming)
  const modeBtn = document.querySelector("#mode-btn");
  const modeDropdown = document.querySelector("#mode-dropdown");
  const modeLabel = document.querySelector("#mode-label");

  // --- Market dropdown (Goals / Corners)
  const marketBtn = document.querySelector("#market-btn");
  const marketDropdown = document.querySelector("#market-dropdown");
  const marketLabel = document.querySelector("#market-label");

  // --- Language dropdown
  const langBtn = document.querySelector("#lang-btn");
  const langDropdown = document.querySelector("#lang-dropdown");
  const langLabel = document.querySelector("#lang-label");

  // --- Analyze button
  const analyzeBtn = document.querySelector("#analyze-btn");
  const matchInput = document.querySelector("#match-input");

  let selectedMode = "live";
  let selectedMarket = "goals";
  let selectedLang = "EN";

  // ----------- SAFETY CHECK
  if (!modeBtn || !marketBtn || !langBtn || !analyzeBtn) {
    console.error("UI elements not found in DOM");
    return;
  }

  // ----------- MODE DROPDOWN
  modeBtn.addEventListener("click", () => {
    modeDropdown.classList.toggle("show");
  });

  modeDropdown.querySelectorAll("[data-mode]").forEach(item => {
    item.addEventListener("click", () => {
      selectedMode = item.dataset.mode;
      modeLabel.innerText = selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1);
      modeDropdown.classList.remove("show");
    });
  });

  // ----------- MARKET DROPDOWN
  marketBtn.addEventListener("click", () => {
    marketDropdown.classList.toggle("show");
  });

  marketDropdown.querySelectorAll("[data-market]").forEach(item => {
    item.addEventListener("click", () => {
      selectedMarket = item.dataset.market;
      marketLabel.innerText = selectedMarket.charAt(0).toUpperCase() + selectedMarket.slice(1);
      marketDropdown.classList.remove("show");
    });
  });

  // ----------- LANGUAGE DROPDOWN
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

  // ----------- ANALYZE BUTTON
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
          query: query
        })
      });

      const data = await res.json();
      console.log("Analysis result:", data);

      alert("Analysis completed. Check console for result.");

    } catch (err) {
      console.error("Analyze error:", err);
      alert("Error contacting backend");
    }

    analyzeBtn.innerText = "Analyze";
  });

});
