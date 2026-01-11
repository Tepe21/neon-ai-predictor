// Tabs
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

// Category dropdown
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

// Language dropdown
const langBtn = document.getElementById("langBtn");
const langMenu = document.getElementById("langMenu");

langBtn.onclick = () => {
  langMenu.style.display = langMenu.style.display === "block" ? "none" : "block";
};

langMenu.querySelectorAll("div").forEach(item => {
  item.onclick = () => {
    langBtn.innerHTML = item.innerHTML + " ▾";
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

// Analyze button placeholder action
document.getElementById("analyzeBtn").onclick = () => {
  const box = document.getElementById("resultsBox");
  box.innerHTML = "<p style='color:#7b8cff'>⚙️ Backend engine will plug here next.</p>";
};
