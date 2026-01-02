let currentStep = 0;
let lang = localStorage.getItem("lang") || "en";

const screens = document.querySelectorAll(".onboarding-screen");
const onboarding = document.getElementById("onboarding");
const app = document.getElementById("app");
const alertsBox = document.getElementById("alerts");
const scannerText = document.getElementById("scannerText");

/* TRANSLATIONS */
const translations = {
  en: {
    title1:"AI Football Intelligence",
    text1:"Our AI continuously scans live matches and detects moments with statistically increased goal probability.",
    continue:"Continue",
    title2:"Real-Time AI Alerts",
    text2:"Alerts are generated only when multiple indicators align. No random picks.",
    bullet1:"📊 Live match pressure analysis",
    bullet2:"🧠 Probability & momentum modeling",
    bullet3:"⏱️ Optimal minute windows",
    next:"Next",
    title3:"Activate AI Engine",
    text3:"Let the AI monitor matches and alert you only when value is detected.",
    activate:"Activate AI",
    skip:"Skip for now",
    status:"AI Engine active · Monitoring live matches",
    testmode:"Live Goal Scanner (TEST MODE)",
    scan:[
      "Scanning global leagues…",
      "Evaluating attacking momentum…",
      "Tracking pressure & shot frequency…",
      "Filtering matches by probability threshold…"
    ],
    reasons:[
      "Sustained attacking pressure detected",
      "Shot frequency above match average",
      "Defensive drop observed",
      "Momentum shift confirmed"
    ],
    labels:{
      normal:"Normal signal",
      high:"High value signal",
      bomb:"Value bomb"
    }
  },
  gr: {
    title1:"Τεχνητή Νοημοσύνη Ποδοσφαίρου",
    text1:"Η AI σαρώνει συνεχώς live αγώνες και εντοπίζει στιγμές με αυξημένη στατιστική πιθανότητα γκολ.",
    continue:"Συνέχεια",
    title2:"Ζωντανές AI Ειδοποιήσεις",
    text2:"Τα σήματα παράγονται μόνο όταν ευθυγραμμίζονται πολλαπλοί δείκτες. Όχι τυχαίες επιλογές.",
    bullet1:"📊 Ανάλυση επιθετικής πίεσης",
    bullet2:"🧠 Μοντέλα πιθανοτήτων & ρυθμού",
    bullet3:"⏱️ Βέλτιστα χρονικά παράθυρα",
    next:"Επόμενο",
    title3:"Ενεργοποίηση AI",
    text3:"Άφησε την AI να παρακολουθεί τους αγώνες και να ειδοποιεί μόνο όταν υπάρχει αξία.",
    activate:"Ενεργοποίηση AI",
    skip:"Παράλειψη",
    status:"Η AI είναι ενεργή · Παρακολούθηση live αγώνων",
    testmode:"Live Goal Scanner (ΔΟΚΙΜΑΣΤΙΚΟ)",
    scan:[
      "Σάρωση παγκόσμιων πρωταθλημάτων…",
      "Αξιολόγηση επιθετικού ρυθμού…",
      "Έλεγχος πίεσης & τελικών…",
      "Φιλτράρισμα βάσει ορίου πιθανότητας…"
    ],
    reasons:[
      "Συνεχόμενη επιθετική πίεση",
      "Αυξημένες τελικές προσπάθειες",
      "Αμυντική πτώση από τον αντίπαλο",
      "Επιβεβαιωμένη αλλαγή ρυθμού"
    ],
    labels:{
      normal:"Κανονικό σήμα",
      high:"Σήμα υψηλής αξίας",
      bomb:"Value bomb"
    }
  }
};

function applyLanguage(){
  document.querySelectorAll("[data-key]").forEach(el=>{
    el.innerText = translations[lang][el.dataset.key];
  });
}
function setLanguage(l){
  lang = l;
  localStorage.setItem("lang",l);
  applyLanguage();
}

function showStep(step){
  screens.forEach((s,i)=>s.classList.toggle("active",i===step));
  document.querySelectorAll(".dot").forEach((d,i)=>d.classList.toggle("active",i===step));
}
function nextOnboarding(){
  if(currentStep < screens.length-1){
    currentStep++;
    showStep(currentStep);
  }
}
function finishOnboarding(){
  localStorage.setItem("onboardingDone","true");
  onboarding.classList.add("hidden");
  app.style.display="block";
  startScanner();
}

if(localStorage.getItem("onboardingDone")){
  onboarding.classList.add("hidden");
  app.style.display="block";
  startScanner();
}else{
  showStep(0);
}

applyLanguage();

/* LIVE SCANNER UX */
let scanIndex = 0;
function startScanner(){
  scannerText.innerText = translations[lang].scan[0];
  setInterval(()=>{
    scanIndex = (scanIndex+1)%translations[lang].scan.length;
    scannerText.innerText = translations[lang].scan[scanIndex];
  },2500);
}

/* DEMO ALERTS */
function spawnDemoAlert(){
  const conf = Math.floor(70 + Math.random()*25);
  let level = "normal";
  if(conf >= 78) level = "high";
  if(conf >= 85) level = "bomb";

  const minute = Math.floor(60 + Math.random()*25);
  const reason = translations[lang].reasons[
    Math.floor(Math.random()*translations[lang].reasons.length)
  ];

  const el = document.createElement("div");
  el.className = `alert ${level}`;
  el.innerHTML = `
    <div class="top">
      <div class="type">${translations[lang].labels[level]}</div>
      <div class="conf">${conf}%</div>
    </div>
    <div class="body">Over 0.5 goals recommended</div>
    <div class="meta">⏱ ${minute}' · ${reason}</div>
  `;
  alertsBox.prepend(el);
}
