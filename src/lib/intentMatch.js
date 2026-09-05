// Turns the free-text shopping intent into something that actually
// changes ranking, instead of being a cosmetic label. Kept as a small
// explicit keyword map rather than real NLP — good enough for a demo
// catalog. Both the simulated agent and Aegis's independent audit call
// this same function, so neither side has an information edge the other
// lacks.

const FEATURE_KEYWORDS = [
  { pattern: /waterproof/i, tag: "waterproof", bonus: 0.06 },
  {
    pattern: /wide[\s-]?fit|wide feet|wide shoe/i,
    tag: "wide-fit",
    bonus: 0.06,
  },
];

export function computeIntentFit(product, intent) {
  let fit = product.matchScore;
  const query = intent.query || "";

  for (const { pattern, tag, bonus } of FEATURE_KEYWORDS) {
    if (pattern.test(query)) {
      fit += product.tags.includes(tag) ? bonus : -bonus;
    }
  }

  return Math.max(0, Math.min(1, fit));
}
