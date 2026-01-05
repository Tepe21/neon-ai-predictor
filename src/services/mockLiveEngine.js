let lastAlertId = 0;

const MOCK_MATCHES = [
  "Flamengo – Palmeiras",
  "Corinthians – Sao Paulo",
  "River Plate – Boca Juniors",
  "Inter – Milan",
  "Chelsea – Arsenal"
];

export function generateMockAlerts() {
  const now = new Date();

  // κάθε ~3 λεπτά νέο alert
  if (now.getSeconds() % 180 !== 0) return [];

  lastAlertId++;

  const minute = 65 + Math.floor(Math.random() * 20);
  const confidence = 70 + Math.floor(Math.random() * 25);

  let level = "normal";
  if (confidence >= 85) level = "bomb";
  else if (confidence >= 78) level = "high";

  return [{
    id: lastAlertId,
    match: MOCK_MATCHES[Math.floor(Math.random() * MOCK_MATCHES.length)],
    minute,
    market: "Over 0.5 Goals",
    odd: (1.6 + Math.random()).toFixed(2),
    confidence,
    level,
    simulated: true
  }];
}
