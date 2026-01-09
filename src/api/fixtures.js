import { fetchUpcomingBatch } from "../utils/apiFootball.js";

export async function getUpcomingFixtures(limit = 200) {
  let fixtures = [];
  let remaining = limit;

  while (remaining > 0) {
    const batchSize = Math.min(50, remaining);
    const batch = await fetchUpcomingBatch(batchSize);

    if (!batch.length) break;

    fixtures.push(...batch);
    remaining -= batchSize;
  }

  return fixtures;
}
