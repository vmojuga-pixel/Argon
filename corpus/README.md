# ARGON — TRAINING CORPUS

> Reference materials for agentic auto-coding. Not for production import — for AGENT REFERENCE.

## Purpose
Setiap pattern kod di bawah = **bahan pembelajaran** untuk:
1. **Swarm** — Architect/Breaker/Optimizer rujuk pattern semasa generate
2. **Overlord** — prompt enrichment bila bina Worker
3. **Recon** — template untuk reconstructed code
4. **Manual** — SIR rujuk bila nak code sesuatu

## Sources

### anthropic/billing/
5 production-grade billing modules (dari review Anthropic Claude):
- `001-signature` — Stripe HMAC-SHA256 verify
- `002-idempotency` — Webhook claim/release pattern
- `003-entitlement` — Subscription → entitlement mapping
- `004-ordering` — Out-of-order event handling
- `005-pricing` — Tiered usage + integer-cents tax

Pattern tags: `crypto`, `idempotency`, `state-machine`, `cas`, `billing`, `typescript`

### qwen/stack/
Full-stack boilerplate (dari Qwen):
- `backend/` — Hono + Drizzle + PostgreSQL
- `frontend/` — Next.js + Tailwind dashboard

Pattern tags: `hono`, `drizzle`, `next.js`, `api-key-auth`, `usage-tracking`

## How agents use this
Overlord + Swarm reference `corpus/<source>/_metadata/tags.json` untuk enrich prompt.
Corpus tidak di-import sebagai dependency — reference only.
