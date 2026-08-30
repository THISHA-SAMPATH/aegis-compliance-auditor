// Calls the real agent (api/agent-decide.js). Used when "Live Agent"
// mode is on. Throws on failure so the caller can fall back to the local
// simulated agent — keeps the demo working even without a deployed
// backend or API key configured.
export async function fetchLiveAgentPick(mandate, eligibleCatalog) {
  const res = await fetch('/api/agent-decide', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mandate, catalog: eligibleCatalog }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Live agent call failed (${res.status})`);
  }

  return res.json(); // { pickedId, reasoning }
}
