async function manualSearch() {
  const input = document.getElementById("searchInput").value;
  const resultsBox = document.getElementById("searchResults");

  resultsBox.innerHTML = "";

  if (!input || input.length < 3) return;

  const res = await fetch(`/api/search?q=${encodeURIComponent(input)}`);
  const data = await res.json();

  if (data.length === 0) {
    resultsBox.innerHTML = "<p>No matches found</p>";
    return;
  }

  // Αν βρεθεί 1 → απευθείας
  if (data.length === 1) {
    showMatch(data[0]);
    return;
  }

  // Αν βρεθούν πολλοί → dropdown
  const select = document.createElement("select");
  select.innerHTML = `<option>Select match</option>`;

  data.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = JSON.stringify(m);
    opt.textContent = `${m.match} (${m.league})`;
    select.appendChild(opt);
  });

  select.onchange = () => {
    const match = JSON.parse(select.value);
    showMatch(match);
  };

  resultsBox.appendChild(select);
}

function showMatch(match) {
  const resultsBox = document.getElementById("searchResults");
  resultsBox.innerHTML = `
    <div class="match-card">
      <h3>${match.match}</h3>
      <p>${match.league} – ${match.country}</p>
      <p>${new Date(match.date).toLocaleString()}</p>
    </div>
  `;
}
