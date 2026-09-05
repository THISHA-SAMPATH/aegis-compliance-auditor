# Aegis — Independent Mandate Compliance Auditor

**Track:** AI Growth & Agentic Commerce

> Payment protocols verify that an AI shopping agent was *authorized* to
> spend your money. None of them verify that it actually *honored* what
> you asked for. Aegis is that missing layer.

---

## The gap

As of 2026, four major protocols — Google's **AP2**, Visa's **Trusted
Agent Protocol**, Mastercard's **Agent Pay**, and **ACP** — all solve the
same problem: proving a purchase was authorized within a signed spending
mandate. That solves fraud. It does not solve **fidelity**.

An agent can stay technically inside your budget and delivery window
while quietly picking the sponsored listing, the higher-margin option,
or a manipulated "discount" over the product that actually matched what
you asked for. Today, nothing checks for that. You only see the receipt.

Aegis sits independently of the purchasing agent and audits every
transaction against the mandate you actually set — using only public
product data, the same way a financial auditor doesn't trust the books,
they re-derive the numbers.

## How it works

**1. Mandate** — you state your real intent: a shopping query, category,
budget, delivery deadline, and hard constraints ("never let sponsored
listings win," "reject price-manipulated products"). This is shaped as
an **AP2-style Intent Mandate** — the same primitive Google's protocol
already standardizes — so Aegis plugs into existing infrastructure
rather than inventing its own format.

**2. Agent purchase** — a simulated shopping agent picks a product,
blending genuine intent-fit against a commercial score (sponsorship +
merchant margin) via an adjustable **platform incentive dial**. Toggle
**Live Agent Mode** to route the decision through a real Claude API call
instead — that agent is deliberately instructed the way a commercial
platform agent actually is, so any bias it shows is genuine emergent
model behavior, not a scripted dial.

**3. Independent audit** — Aegis never sees the agent's internal
reasoning, only the mandate and what was purchased. It independently
re-ranks the same catalog using only the stated mandate — no
sponsorship or margin signal — and checks:

| Check | What it catches |
|---|---|
| Budget compliance | Purchase exceeds the stated price cap |
| Delivery compliance | Item won't arrive by the stated deadline |
| Intent-fit match | A better-fitting option existed and wasn't chosen (3-point tie tolerance to avoid flagging noise-level differences) |
| Sponsored-listing check | A sponsored item won despite being excluded by mandate |
| Price-manipulation detection | Inflate-then-discount pricing pattern in recent price history |
| Disclosure check | Agent picked a sponsored item but didn't disclose that in its explanation to the user |

Any failure → **FLAGGED**, with a plain-language evidence trail and,
when flagged, the exact product Aegis would have picked instead.

## Trust and verifiability

Every audit produces a **deterministic verification hash** of its own
evidence and verdict — the result isn't just a UI claim, it's
independently re-computable from the same inputs.

## Feature set

- **Intent-aware ranking** — free-text query terms (e.g. "waterproof,"
  "noise-cancelling") actually shift which product wins, on both the
  agent and audit sides, so neither has an information edge the other
  lacks
- **5 product categories** (trail-running shoes, wireless earbuds,
  standing desks, smart home speakers, travel backpacks) — the category
  list is generated directly from the catalog data, so adding a new
  category never requires a separate UI change
- **Mandate presets** for fast scenario switching, including a
  dedicated demo preset that reliably reproduces a sponsored +
  price-manipulated + non-disclosed FLAGGED result
- **Agent Integrity Score** — an aggregate trust rating computed once
  3+ audits exist in history
- **Rolling compliance trend** — an inline sparkline of the rolling
  COMPLIANT rate across recent audits
- **Persistent, clickable audit trail** — history survives a refresh
  via `localStorage`; click any past entry to reload it into the ledger
  view; clear history with a confirmation step
- **Live Agent Mode** — optional real Claude-backed purchase decisions
  via a Vercel serverless function, with automatic fallback to the
  simulated agent if unavailable

## Why this, and not another agent-payments wrapper

The infrastructure layer — can an agent be trusted to move money — is
already being solved by companies with far more resources than a
hackathon team: Visa, Mastercard, Google, and Stripe all shipped
competing protocols in the last twelve months. Aegis doesn't compete
with that layer, it sits on top of it: it consumes the same Intent
Mandate primitive AP2 already standardizes and adds the accountability
check none of those protocols perform.

## Tech

- **React + Vite**, no backend required for the core demo
- `src/lib/intentMatch.js` — turns free-text intent into a ranking
  signal shared by both the agent and the auditor
- `src/lib/agentEngine.js` — simulates a shopping agent whose ranking
  blends genuine fit against sponsorship/margin, controlled by a bias
  dial
- `src/lib/auditEngine.js` — Aegis's independent audit: budget check,
  delivery check, intent-fit check (with tie tolerance), sponsored-
  listing check, price-manipulation detection, disclosure check, and
  Integrity Score computation
- `src/data/marketplace.js` — mock product catalog with hidden signals
  (sponsorship, margin, true fit score, price history) a real agent has
  access to and a user does not, plus derived categories and mandate
  presets
- `api/agent-decide.js` — Vercel serverless function calling Claude
  directly for Live Agent Mode

## Live Agent Mode

Toggling "Live Agent Mode" routes the purchase decision through
`api/agent-decide.js`, which calls Claude with a system prompt
instructing it to behave like a real commercial shopping agent —
favoring sponsored/partner listings when reasonably competitive — so
any bias Aegis catches is genuine model behavior, not a dial. If the
call fails (no key configured, offline dev), it falls back to the
local simulated agent automatically so the demo never breaks.

To enable it after deploying to Vercel: add an `ANTHROPIC_API_KEY`
environment variable in the project's Vercel settings, redeploy.

## AP2-shaped mandate

`src/lib/ap2.js` shapes the user's stated intent as an AP2-style Intent
Mandate (issuer, `credentialSubject` with constraints, a mock
signature) — the same envelope shape AP2 already standardizes.
Swapping the mock signature for a real AP2 client/wallet integration is
additive, not a rewrite.

## Roadmap beyond the hackathon build

- [ ] Move audit history from `localStorage` to a real per-user backend
      store
- [ ] Real AP2 wallet/key integration in place of the mock signature
- [ ] Publish an aggregate "Agent Integrity Score" per *platform*, not
      just per user, from accumulated audit data
- [ ] Real-world data sourcing strategy: regulatory disclosure
      requirements, receipt-level data partnerships, or a compliance
      mandate that requires platform API access

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
