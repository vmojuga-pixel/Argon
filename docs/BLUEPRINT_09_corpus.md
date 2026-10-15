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

## Update 2026-10-15 (part 2)

### anthropic/auth/ — 5 modules, 49 tests
| Module | Tests | Pattern |
|:---|:---|:---|
| 001-password | 9 | Scrypt + NFKC + DoS bounds + rehash |
| 002-jwt | 11 | HS256 pinned + skew + iss/aud + nbf |
| 003-throttle | 10 | Login lockout sliding window |
| 004-reset | 10 | Single-use reset + atomic claim |
| 005-rbac | 9 | Owner/admin/member/viewer fail-closed |

**Total anthropic**: 10 modules, 82 tests (billing 33 + auth 49)

### qwen/stack/ extension
- `drizzle.config.ts`, `src/db.ts` — Postgres pool
- `src/utils/generateKey.ts` — secure API key gen
- `src/routes/stripe.ts` — checkout + webhook (**corpus-fixed** Drizzle syntax)
- `frontend/.../topup/page.tsx` — Stripe redirect UI

**Corpus fix noted**: Original Qwen boilerplate had invalid `db.$with()` chain for atomic increment. Corpus uses `sql\`col + val\`` — correct pattern.

## Enterprise AI/ML Sectors — 2026-10-15
Source: 10 job ad screenshots (Malaysia, RM8k-12k/month)

### Sectors
| Sector | Class | Job |
|:---|:---|:---|
| sector-1-ai-engineer | EnterpriseRAGAndGuardrailEngine | AI Engineer (PJ, RM10k) |
| sector-2-forward-deployed | ForwardDeployedIVABridge | FDE - IVA (KL, RM8-12k) |
| sector-3-ml-engineer | AutomatedMLPipelineEngine | ML Engineer (Bangsar South, RM8-11k) |

### Files
- `tools/sectors/enterprise_ai_sectors_grimoire.py` — runnable module
- `corpus/sectors/enterprise_ai_sectors_grimoire.py` — corpus mirror
- `corpus/sectors/_metadata/manifest.json` — 3 sectors + 6 topics

### Wired
- Overlord DO storage `focus_topics` updated via POST /overlord/topics
- Swarm will next reference these topics for auto-code generation
