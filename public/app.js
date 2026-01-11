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
// Category Dropdown
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
// Language System
// =====================

const langBtn = document.getElementById("langBtn");
const langMenu = document.getElementById("langMenu");

const translations = {
  EN: {
    manualTab: "🔍 Manual Search",
    alertsTab: "🔔 Live Alerts",
    title: "⚽ AI Football Picks",
    subtitle: "Live Match Intelligence Engine",
    liveLabel: "⏱ Live ▾",
    analyze: "🤖 Analyze",
    inputPlaceholder: "Enter match",
    comingSoon: "🔔 Live Alerts Engine Connected"
  },
  EL: {
    manualTab: "🔍 Χειροκίνητη Αναζήτηση",
    alertsTab: "🔔 Live Ειδοποιήσεις",
    title: "⚽ AI Football Picks",
    subtitle: "Μηχανή Live Ποδοσφαιρικής Ανάλυσης",
    liveLabel: "⏱ Ζωντανά ▾",
    analyze: "🤖 Ανάλυση",
    inputPlaceholder: "Εισαγωγή αγώνα",
    comingSoon: "🔔 Μηχανή Live Alerts Συνδεδεμένη"
  }
};

let currentLang = "EN";

function applyLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];

  tabManual.innerText = t.manualTab;
  tabAlerts.innerText = t.alertsTab;
  document.querySelector("h1").innerText = t.title;
  document.querySelector("h2").innerText = t.subtitle;
  document.querySelector(".drop-btn").innerText = t.liveLabel;
  document.getElementById("analyzeBtn").innerText = t.analyze;
  document.getElementById("matchInput").placeholder = t.inputPlaceholder;
  document.querySelector(".coming-soon").innerText = t.comingSoon;

  langBtn.innerHTML = (lang === "EN" ? "🇬🇧 EN ▾" : "🇬🇷 EL ▾");
}

// Language dropdown open
langBtn.onclick = () => {
  langMenu.style.display = langMenu.style.display === "block" ? "none" : "block";
};

// Language selection
langMenu.querySelectorAll("div").forEach(item => {
  item.onclick = () => {
    const lang = item.getAttribute("data-lang");
    applyLanguage(lang);
    langMenu.style.display = "none";
  };
});

// Close dropdowns
document.addEventListener("click", (e) => {
  if (!catBtn.contains(e.target) && !catMenu.contains(e.target)) {
    catMenu.style.display = "none";
  }
  if (!langBtn.contains(e.target) && !langMenu.contains(e.target)) {
    langMenu.style.display = "none";
  }
});

// =====================
// Analyze placeholder
// =====================
document.getElementById("analyzeBtn").onclick = () => {
  const box = document.getElementById("resultsBox");
  box.innerHTML = "<p style='color:#7b8cff'>⚙️ Backend engine will plug here next.</p>";
};

// Init default language
applyLanguage("EN");
