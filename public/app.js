document.getElementById("analyzeBtn").addEventListener("click", () => {
  const match = document.getElementById("matchInput").value.trim();
  if (!match) return alert("Enter a match name");

  // Fake demo result (backend hook later)
  document.getElementById("matchTitle").innerText =
    "Guarani Campinas vs Primavera SP";

  document.getElementById("minute").innerText =
    "Minute: 82'";

  document.getElementById("suggestion").innerText =
    "Suggestion: Over 10.5 Total Corners";

  document.getElementById("confidence").innerText =
    "Confidence: 69%";

  document.getElementById("resultBox").classList.remove("hidden");
});
