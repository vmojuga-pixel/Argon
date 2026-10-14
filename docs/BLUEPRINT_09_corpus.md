# ARGON — BLUEPRINT (Part 9: Training Corpus)

## Purpose
Reference materials untuk agentic auto-coding. Bukan dependency — rujukan.

## Sources

### anthropic/billing/ — 5 modules, 33 tests
| Module | Tests | Pattern |
|:---|:---|:---|
| 001-signature | 8 | HMAC-SHA256 + tolerance + rotation |
| 002-idempotency | 4 | Atomic claim/release webhook |
| 003-entitlement | 6 | Subscription state machine + grace |
| 004-ordering | 7 | CAS + out-of-order monotonic |
| 005-pricing | 8 | Tiered pricing integer cents + tax |

### qwen/stack/ — full-stack boilerplate
- `backend/src/schema.ts` — Drizzle + Postgres (users, api_keys, usage_logs)
- `backend/src/index.ts` — Hono + Bearer auth + credit deduction
- `frontend/app/page.tsx` — Next.js + Tailwind dashboard

## Integration
- Swarm/Overlord baca `corpus/index.json` → lookup tag → inject reference ke prompt
- Recon output format align dengan convention corpus
- Setiap file ada `[CORPUS: <source>]` header

## Rule
- Reference only (no import, no dependency)
- Update bila ada pattern baru
- Test count tracked untuk detect regression
