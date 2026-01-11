// =====================
// Tabs
// =====================
const tabManual = document.getElementById("tabManual");
const tabAlerts = document.getElementById("tabAlerts");
const panelManual = document.getElementById("panelManual");
const panelAlerts = document.getElementById("panelAlerts");

tabManual.onclick = () => {
  tabManual.classList.add("active");
  tabAlerts.classList.remove("active");
  panelManual.classList.add("active");
  panelAlerts.classList.remove("active");
};

tabAlerts.onclick = () => {
  tabAlerts.classList.add("active");
  tabManual.classList.remove("active");
  panelAlerts.classList.add("active");
  panelManual.classList.remove("active");
};

// =====================
// CATEGORY DROPDOWN
// =====================
const catBtn = document.getElementById("catBtn");
const catMenu = document.getElementById("catMenu");

catBtn.onclick = () => {
  catMenu.style.display = catMenu.style.display === "block" ? "none" : "block";
};

catMenu.querySelectorAll("div").forEach(item => {
  item.onclick = () => {
    catBtn.innerHTML = item.innerHTML + " ▾";
    catMenu.style.display = "none";
  };
});

// =====================
// TIME DROPDOWN
// =====================
const timeBtn = document.getElementById("timeBtn");
const timeMenu = document.getElementById("timeMenu");

timeBtn.onclick = () => {
  timeMenu.style.display = timeMenu.style.display === "block" ? "none" : "block";
};

timeMenu.querySelectorAll("div").forEach(item => {
  item.onclick = () => {
    timeBtn.innerHTML = item.innerHTML + " ▾";
    timeMenu.style.display = "none";
  };
});

// =====================
// LANGUAGE SWITCH
// =====================
const langBtn = document.getElementById("langBtn");
const langMenu = document.getElementById("langMenu");

const translations = {
  EN: {
    manualTab: "🔍 Manual Search",
    alertsTab: "🔔 Live Alerts",
    subtitle: "Live Match Intelligence Engine",
    liveLabel: "⏱ Live ▾",
    analyze: "🤖 Analyze",
    inputPlaceholder: "Enter match",
    comingSoon: "🔔 Live Alerts Engine Connected",
    half: "🕐 Half Time ▾",
    full: "🕘 Full Time ▾"
  },
  EL: {
    manualTab: "🔍 Χειροκίνητη Αναζήτηση",
    alertsTab: "🔔 Live Ειδοποιήσεις",
    subtitle: "Μηχανή Live Ποδοσφαιρικής Ανάλυσης",
    liveLabel: "⏱ Ζωντανά ▾",
    analyze: "🤖 Ανάλυση",
    inputPlaceholder: "Εισαγωγή αγώνα",
    comingSoon: "🔔 Μηχανή Live Alerts Συνδεδεμένη",
    half: "🕐 Ημίχρονο ▾",
    full: "🕘 Τελικό ▾"
  }
};

function applyLanguage(lang) {
  const t = translations[lang];
  tabManual.innerText = t.manualTab;
  tabAlerts.innerText = t.alertsTab;
  document.querySelector("h2").innerText = t.subtitle;
  document.querySelector(".drop-btn.live").innerText = t.liveLabel;
  document.getElementById("analyzeBtn").innerText = t.analyze;
  document.getElementById("matchInput").placeholder = t.inputPlaceholder;
  document.querySelector(".coming-soon").innerText = t.comingSoon;

  const timeText = timeBtn.innerText.toLowerCase();
  timeBtn.innerText = timeText.includes("half") ? t.half : t.full;

  langBtn.innerHTML = lang === "EN" ? "🇬🇧 EN ▾" : "🇬🇷 EL ▾";
}

langBtn.onclick = () => {
  langMenu.style.display = langMenu.style.display === "block" ? "none" : "block";
};

langMenu.querySelectorAll("div").forEach(item => {
  item.onclick = () => {
    applyLanguage(item.getAttribute("data-lang"));
    langMenu.style.display = "none";
  };
});

// =====================
// CLOSE DROPDOWNS
// =====================
document.addEventListener("click", (e) => {
  if (!catBtn.contains(e.target) && !catMenu.contains(e.target)) catMenu.style.display = "none";
  if (!timeBtn.contains(e.target) && !timeMenu.contains(e.target)) timeMenu.style.display = "none";
  if (!langBtn.contains(e.target) && !langMenu.contains(e.target)) langMenu.style.display = "none";
});

// =====================
// ANALYZE
// =====================
document.getElementById("analyzeBtn").onclick = async () => {
  const match = document.getElementById("matchInput").value.trim();
  const categoryText = catBtn.innerText.toLowerCase();
  const timeText = timeBtn.innerText.toLowerCase();

  let category = "goals";
  if (categoryText.includes("corner")) category = "corners";
  if (categoryText.includes("next")) category = "nextgoal";

  const halftime = timeText.includes("half") || timeText.includes("ημί");

  const box = document.getElementById("resultsBox");
  box.innerHTML = "<p style='color:#7b8cff'>Analyzing live match...</p>";

  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ match, category, halftime })
  });

  const data = await res.json();

  if (data.error) {
    box.innerHTML = `<p style="color:#ff6b6b;">❌ ${data.error}</p>`;
    return;
  }

  box.innerHTML = `
    <div style="
      margin-top:15px;
      padding:18px;
      border:2px solid #00f0ff;
      border-radius:14px;
      box-shadow:0 0 18px #00f0ff55;">
      <h3>${data.match}</h3>
      <p>Minute: <strong>${data.minute}'</strong></p>
      <p>Suggestion: <strong>${data.suggestion}</strong></p>
      <p>Confidence: <strong>${data.confidence}%</strong></p>
    </div>
  `;
};

applyLanguage("EN");
