// ---------- LANGUAGE SYSTEM ----------
const translations = {
  en: {
    title: "AI Football Picks",
    subtitle: "Live Match Intelligence Engine",
    manual: "Manual Search",
    alerts: "Live Alerts",
    live: "Live",
    corners: "Corners",
    goals: "Goals",
    nextgoal: "Next Goal",
    halftime: "Half Time",
    fulltime: "Full Time",
    analyze: "Analyze",
    inputPlaceholder: "Enter match name..."
  },
  el: {
    title: "AI Football Picks",
    subtitle: "Μηχανή Ανάλυσης Ζωντανών Αγώνων",
    manual: "Χειροκίνητη Αναζήτηση",
    alerts: "Live Alerts",
    live: "Live",
    corners: "Κόρνερ",
    goals: "Γκολ",
    nextgoal: "Επόμενο Γκολ",
    halftime: "Ημίχρονο",
    fulltime: "Κανονικός Αγώνας",
    analyze: "Ανάλυση",
    inputPlaceholder: "Εισαγωγή αγώνα..."
  }
};

let currentLang = "en";

function applyLanguage() {
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    el.innerText = translations[currentLang][key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
    const key = el.getAttribute("data-i18n-placeholder");
    el.placeholder = translations[currentLang][key];
  });

  document.getElementById("langSwitch").childNodes[0].textContent =
    currentLang === "en" ? "🇬🇧 EN ▾" : "🇬🇷 EL ▾";
}

document.querySelectorAll("#langMenu div").forEach(opt=>{
  opt.addEventListener("click", ()=>{
    currentLang = opt.dataset.lang;
    applyLanguage();
  });
});

applyLanguage();

// ---------- CATEGORY DROPDOWN ----------
const categoryBtn = document.getElementById("categoryBtn");
document.querySelectorAll("#categoryMenu div").forEach(item=>{
  item.addEventListener("click", ()=>{
    categoryBtn.innerHTML = item.innerHTML + " ▾";
  });
});

// ---------- TIME DROPDOWN ----------
const timeBtn = document.getElementById("timeBtn");
document.querySelectorAll("#timeMenu div").forEach(item=>{
  item.addEventListener("click", ()=>{
    timeBtn.innerHTML = item.innerHTML + " ▾";
  });
});

// ---------- DEMO RESULT (backend remains same) ----------
document.getElementById("analyzeBtn").addEventListener("click", ()=>{
  const resultBox = document.getElementById("resultBox");
  resultBox.classList.remove("hidden");

  document.getElementById("matchTitle").innerText =
    "Guarani Campinas vs Primavera SP";
  document.getElementById("minute").innerText = "Minute: 82'";
  document.getElementById("suggestion").innerText =
    "Suggestion: Over 9.5 Total Corners";
  document.getElementById("confidence").innerText =
    "Confidence: 69%";
});
