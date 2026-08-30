# Aegis — Independent Mandate Compliance Auditor

**Track:** AI Growth & Agentic Commerce

> Payment protocols like Google's AP2, Visa's Trusted Agent Protocol, and
> Mastercard Agent Pay verify that an AI shopping agent was *authorized* to
> spend your money. None of them verify that the agent actually *honored*
> what you asked for. Aegis is that missing layer.

## The gap

As of 2026, four major protocols (AP2, TAP, Agent Pay, ACP) all solve the
same problem: proving a purchase was authorized within a signed spending
mandate. That solves fraud. It does not solve **fidelity** — nothing checks
whether the agent, while staying technically inside your budget, quietly
picked the sponsored listing or the higher-margin option over the one that
actually matched what you asked for.

Aegis sits independently of the agent and audits every purchase against the
mandate you actually set, using only public product data — the same way a
financial auditor doesn't trust the books, they re-derive the numbers.

## How it works

1. **Mandate** — you state your real intent (budget, delivery deadline,
   hard preferences like "never let sponsored listings win").
2. **Agent purchase** — a simulated shopping agent picks a product. The demo
   exposes a "platform incentive strength" dial so you can see how a
   commercially-motivated agent's picks drift from a neutral one — in
   production this is invisible; you only see the receipt.
3. **Independent audit** — Aegis re-ranks the same catalog using only the
   stated mandate (no sponsorship/margin signal), and issues a verdict:
   **COMPLIANT** or **FLAGGED**, with a plain-language evidence trail and,
   when flagged, the pick Aegis would have made instead.

## Why this, and not another agent-payments wrapper

The infrastructure layer (can an agent be trusted to move money) is already
being solved by companies with far more resources than a hackathon team —
Visa, Mastercard, Google, and Stripe all shipped competing protocols in the
last twelve months. Aegis doesn't compete with that layer, it sits on top of
it: it consumes the same Intent Mandate primitive AP2 already standardizes,
and adds the accountability check none of those protocols perform.

## Tech

- React + Vite, no backend required for the demo
- `src/lib/agentEngine.js` — simulates a shopping agent whose ranking blends
  genuine fit against sponsorship/margin, controlled by a bias dial
- `src/lib/auditEngine.js` — Aegis's independent audit: budget check,
  delivery check, intent-fit check, sponsored-listing check, and a
  price-manipulation check (inflate-then-discount pattern detection)
- `src/data/marketplace.js` — mock product catalog with the hidden signals
  (sponsorship, margin, true fit score, price history) a real agent has
  access to and a user does not

## Live Agent Mode

Toggling "Live Agent Mode" in the header routes the purchase decision
through `api/agent-decide.js`, a Vercel serverless function that calls
Claude directly. The agent is instructed the way a real commercial shopping
agent is — encouraged to favor sponsored/partner listings when reasonably
competitive — so any bias Aegis catches is genuine model behavior, not a
dial. If the backend call fails (no key configured, offline dev), it falls
back to the local simulated agent automatically so the demo never breaks.

To enable it after deploying to Vercel: add an `ANTHROPIC_API_KEY`
environment variable in the project's Vercel settings, redeploy.

## AP2-shaped mandate

`src/lib/ap2.js` shapes the user's stated intent as an AP2-style Intent
Mandate (issuer, `credentialSubject` with constraints, a mock signature) —
the same envelope shape AP2 already standardizes. Swapping the mock
signature for a real AP2 client/wallet integration is additive, not a
rewrite.

## Audit history

Every audit is persisted to `localStorage` (`aegis-audit-history-v1`) so
the trail survives a refresh — the seed of a real per-user trust ledger.

## Roadmap beyond the hackathon build

- [ ] Move audit history from localStorage to a real per-user backend store
- [ ] Real AP2 wallet/key integration in place of the mock signature
- [ ] Publish an aggregate "Agent Integrity Score" per platform from accumulated
      audit data

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
