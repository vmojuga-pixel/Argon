# DECISION LOG — Argon

> Setiap keputusan penting. Format: [Tarikh] Decision | Reason | Alternatives

---

## Tech Stack
| Tarikh | Keputusan | Sebab | Alternatif |
|:---|:---|:---|:---|
| 2026-10-14 | Cloudflare Workers | Edge global, D1/KV/R2 managed, zero ops | VPS, Vercel, Deno Deploy |
| 2026-10-14 | Workers AI (llama-4-scout) | Murah, edge, no external API key | OpenAI, Anthropic, Gemini |
| 2026-10-14 | Durable Objects untuk swarm | Stateful persistent across cron | D1 polling, KV |
| 2026-10-15 | llama-4-scout-17b (bukan 3.1-8b) | 3.1-8b deprecated | Guna variant lain |
| 2026-10-15 | D1 untuk tenant + usage | SQLite global, edge queries | Postgres, Supabase |

## Architecture
| Tarikh | Keputusan | Sebab |
|:---|:---|:---|
| 2026-10-15 | Dual auth (Basic Auth + X-API-Key) | UI pakai Basic, API pakai Key |
| 2026-10-15 | Prefix routing (`arg_*` tenant, `argon_*` admin) | Prevent collision (Bug #003) |
| 2026-10-15 | Revoke by key_id (bukan prefix) | Safety (Bug #004) |
| 2026-10-15 | Overlord commit ke Argon repo, Swarm ke grimoire | Separation of concerns |
| 2026-10-15 | Slug prefix `argon-app-*` wajib | Prevent overwrite production |
| 2026-10-15 | Watchdog skip HTTP 530 | Propagasi bukan gagal (Bug #010) |

## Business
| Tarikh | Keputusan | Sebab |
|:---|:---|:---|
| 2026-10-15 | 4 tier: Free/$29/$149/Enterprise | Standard SaaS pricing |
| 2026-10-15 | RPM: 10/60/300/1000 per tier | Protect backend |
| 2026-10-15 | Overage pricing: $0.002/0.01/0.05 | Monetize lepas quota |
| TBD | Stripe (bukan Paddle) | More mature ecosystem |

## Ops
| Tarikh | Keputusan | Sebab |
|:---|:---|:---|
| 2026-10-15 | Cron 15min (swarm) | Content generation lebih banyak |
| 2026-10-15 | Cron 6-jam (Overlord) | Jimat Neurons |
| 2026-10-15 | Credential di `/root/.argon-secrets/` | Central location, chmod 600 |
| 2026-10-15 | Zero-loss documentation SOP | Rekod semua, tak boleh tinggal |

---

## Pending Decisions
- [ ] Stripe vs Paddle (kalau Fasa 2)
- [ ] Overage: auto-charge atau hard cut?
- [ ] SLA tier commitment?
- [ ] Data residency (EU restriction)?
- [ ] ToS/Privacy lawyer atau template?
- [ ] Entity: SSM atau Enterprise?
