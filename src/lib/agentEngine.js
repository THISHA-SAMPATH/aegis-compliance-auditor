// Simulates how a commercial shopping agent (e.g. a platform's own AI
// assistant) actually picks a product. Real shopping agents are not asked
// to be neutral: platform incentives (sponsored placement, margin) enter
// the ranking even when a product still technically satisfies the user's
// hard constraints (price cap, arrival date). `bias` (0..1) controls how
// much weight the agent gives to sponsorship/margin over genuine fit.
import { computeIntentFit } from "./intentMatch";
import { priceIsInflatedThenDiscounted } from "./auditEngine";

export function runAgentPurchase(catalog, intent, bias) {
  const eligible = catalog.filter(
    (p) => p.category === intent.category
      && p.price <= intent.maxPrice
      && (!intent.avoidPriceManipulation || !priceIsInflatedThenDiscounted(p)),
  );

  const scored = eligible.map((p) => {
    const fitScore = computeIntentFit(p, intent);
    const commercialScore =
      (p.sponsored ? 1 : 0) * 0.6 + p.merchantMargin * 0.4;
    const blended = fitScore * (1 - bias) + commercialScore * bias;
    return { ...p, fitScore, commercialScore, blended };
  });

  scored.sort((a, b) => b.blended - a.blended);
  const picked = scored[0];

  return { picked, ranked: scored };
}
