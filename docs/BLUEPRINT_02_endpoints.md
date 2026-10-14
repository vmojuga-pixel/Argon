# ARGON — BLUEPRINT (Part 2: Endpoints)

## Public (no auth)
| Method | Path | Fungsi |
|:---|:---|:---|
| GET | /api/health | Health + feature list |
| POST | /signup | Create tenant + return API key |
| GET | /docs | Public API documentation |
| GET | /dashboard | Customer self-service UI |

## Basic Auth (admin/landing)
| Method | Path | Fungsi |
|:---|:---|:---|
| GET | / | Landing + chat UI |
| GET | /swarm | Swarm SSE dashboard |
| GET | /admin/stats | Global observability |
| GET | /admin/tenants | List semua tenant |
| GET | /admin/usage | Usage per tenant |
| POST | /admin/rotate-tenant-key | Recover tenant key |

## Tenant (X-API-Key: arg_tn_*)
| Method | Path | Fungsi |
|:---|:---|:---|
| GET | /api/me | Tenant info + usage + quota + keys |
| POST | /api/chat | LLM chat |
| POST | /api/agent | Agentic tool-calling |
| GET | /api/sessions | List sessions |
| POST | /api/keys/rotate | New key |
| POST | /api/keys/revoke | Revoke by key_id (safe) atau prefix |
| GET | /api/webhooks | List webhook |
| POST | /api/webhooks | Register webhook |
| DELETE | /api/webhooks/:id | Delete webhook |
| POST | /swarm/evolve | Trigger swarm cycle |
| GET | /swarm/state | Epoch + history |
| GET | /swarm/stream | SSE live stream |

## Admin key (X-API-Key: argon_*)
| Method | Path | Fungsi |
|:---|:---|:---|
| GET | /api/sessions | Legacy admin sessions |

## Cron
- */15 * * * * — auto-evolve swarm (rotate 3 swarm ID)
