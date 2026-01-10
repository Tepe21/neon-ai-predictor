// ================================
// AI Football Picks - UI Wiring
// ================================

// ---- STATE ----
let mode = "live";        // live | upcoming
let market = "goals";     // goals | corners
let time = "full";        // full | half
let language = "en";      // en | gr

// ---- ELEMENTS ----
const liveUpcomingBtn = document.getElementById("btn-live-upcoming");
const goalsCornersBtn = document.getElementById("btn-goals-corners");
const timeBtn = document.getElementById("btn-time"); // if exists
const analyzeBtn = document.getElementById("btn-analyze");
const matchInput = document.getElementById("match-input");
const resultsBox = document.getElementById("results-box");
const langBtn = document.getElementById("btn-language");

// dropdown items
const liveOption = document.getElementById("opt-live");
const upcomingOption = document.getElementById("opt-upcoming");
const goalsOption = document.getElementById("opt-goals");
const cornersOption = document.getElementById("opt-corners");
const fullOption = document.getElementById("opt-full");
const halfOption = document.getElementById("opt-half");
const langEN = document.getElementById("lang-en");
const langGR = document.getElementById("lang-gr");

// ================================
// ---- TOGGLES ----
// ================================

liveOption?.addEventListener("click", () => {
  mode = "live";
  liveUpcomingBtn.innerText = text("Live");
});

upcomingOption?.addEventListener("click", () => {
  mode = "upcoming";
  liveUpcomingBtn.innerText = text("Upcoming");
});

goalsOption?.addEventListener("click", () => {
  market = "goals";
  goalsCornersBtn.innerText = text("Goals");
});

cornersOption?.addEventListener("click", () => {
  market = "corners";
  goalsCornersBtn.innerText = text("Corners");
});

fullOption?.addEventListener("click", () => {
  time = "full";
  timeBtn.innerText = text("Full Time");
});

halfOption?.addEventListener("click", () => {
  time = "half";
  timeBtn.innerText = text("Half Time");
});

// ================================
// ---- LANGUAGE SWITCH ----
// ================================

langEN?.addEventListener("click", () => {
  language = "en";
  refreshTexts();
});

langGR?.addEventListener("click", () => {
  language = "gr";
  refreshTexts();
});

function text(key) {
  const dict = {
    en: {
      Live: "Live",
      Upcoming: "Upcoming",
      Goals: "Goals",
      Corners: "Corners",
      "Full Time": "Full Time",
      "Half Time": "Half Time",
      Analyze: "Analyze",
      "Insert Match": "Insert match"
    },
    gr: {
      Live: "Live",
      Upcoming: "Επερχόμενα",
      Goals: "Γκολ",
      Corners: "Κόρνερ",
      "Full Time": "Τελικό",
      "Half Time": "Ημίχρονο",
      Analyze: "Ανάλυση",
      "Insert Match": "Εισαγωγή αγώνα"
    }
  };
  return dict[language][key] || key;
}

function refreshTexts() {
  liveUpcomingBtn.innerText = text(liveUpcomingBtn.innerText);
  goalsCornersBtn.innerText = text(goalsCornersBtn.innerText);
  if (timeBtn) timeBtn.innerText = text(timeBtn.innerText);
  analyzeBtn.innerText = text("Analyze");
  matchInput.placeholder = text("Insert Match");
}

// ================================
// ---- ANALYZE BUTTON ----
// ================================

analyzeBtn?.addEventListener("click", async () => {
  resultsBox.innerHTML = text("Analyze") + "...";

  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        market,
        time,
        match: matchInput.value || ""
      })
    });

    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      resultsBox.innerHTML = "No results";
      return;
    }

    const r = data.results[0];

    resultsBox.innerHTML = `
      <div class="result-card">
        <div class="result-suggestion">${r.suggestion}</div>
        <div class="result-confidence">${r.confidence}%</div>
        <div class="result-tag">${r.tag}</div>
      </div>
    `;

  } catch (e) {
    resultsBox.innerHTML = "Error";
  }
});

// ================================
// ---- INIT ----
// ================================
refreshTexts();
