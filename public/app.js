// ===============================
// AI Football Picks - UI Wiring
// Manual Search -> Backend Analyze
// ===============================

let currentMode = "live";      // live | upcoming
let currentMarket = "goals";   // goals | corners
let currentTime = "full";      // full | half (future use)

// Elements (IDs already exist in your locked UI)
const btnMode = document.getElementById("btn-mode");
const btnMarket = document.getElementById("btn-market");
const btnAnalyze = document.getElementById("btn-analyze");
const matchInput = document.getElementById("match-input");
const resultsBox = document.getElementById("results-box");

// Dropdown options
document.querySelectorAll("[data-mode]").forEach(el => {
  el.addEventListener("click", () => {
    currentMode = el.dataset.mode;
    btnMode.innerText = currentMode === "live" ? "Live" : "Upcoming";
  });
});

document.querySelectorAll("[data-market]").forEach(el => {
  el.addEventListener("click", () => {
    currentMarket = el.dataset.market;
    btnMarket.innerText = currentMarket === "goals" ? "Goals" : "Corners";
  });
});

// Analyze button
btnAnalyze.addEventListener("click", async () => {
  const matchQuery = matchInput.value.trim();

  resultsBox.innerHTML = `<div class="loading">Analyzing...</div>`;

  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: currentMode,
        market: currentMarket,
        query: matchQuery
      })
    });

    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      resultsBox.innerHTML = `<div class="no-results">No results found</div>`;
      return;
    }

    renderResults(data.results);

  } catch (err) {
    resultsBox.innerHTML = `<div class="error">Backend error</div>`;
    console.error(err);
  }
});

// Render results into existing UI box
function renderResults(list) {
  resultsBox.innerHTML = "";

  list.forEach(item => {
    const div = document.createElement("div");
    div.className = "result-card";

    div.innerHTML = `
      <div class="match-name">${item.match}</div>
      <div class="tag ${item.tag.toLowerCase()}">${item.tag}</div>
      <div class="confidence">${item.confidence}%</div>
    `;

    resultsBox.appendChild(div);
  });
}
