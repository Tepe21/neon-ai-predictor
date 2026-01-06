export async function resolveMatch(matchName) {
  if (!matchName || matchName.length < 3) {
    return null;
  }

  return {
    id: "mock-match-123",
    name: matchName
  };
}
