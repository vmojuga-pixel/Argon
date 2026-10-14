# ENVIRONMENT INVENTORY — Argon

> Senarai lengkap semua resource, binding, dan credential. Update bila berubah.

---

## Cloudflare Account
| Item | Value |
|:---|:---|
| Account ID | 695a620ee3223aa69b69b1e48eb91962 |
| Worker name | argon |
| Production URL | https://argon.vmojuga.workers.dev |
| Subdomain | vmojuga |
| Wrangler version | 4.151.0 |

## Durable Objects
| Name | Class | Purpose | ID Pattern |
|:---|:---|:---|:---|
| SWARM_BRAIN | SwarmBrain | 7-agent autonomous loop | `GLOBAL_CORP_SWARM`, `SWARM_RESEARCH`, `SWARM_SECURITY` |
| OVERLORD_BRAIN | OverlordSeniorDev | Tier-1 Senior Dev (V2) | `GLOBAL_SENIOR_DEV_OVERLORD_V2` |

## D1 Databases
| Binding | Name | ID (lihat wrangler.toml) | Tables |
|:---|:---|:---|:---|
| DB | argon-db | (dari wrangler.toml) | api_keys, sessions, messages, audit_log, tenants, tenant_api_keys, usage_counters, billing_events, plans, webhooks, webhook_deliveries, idempotency, tenant_audit |

## KV Namespaces
| Binding | Name | ID | Purpose |
|:---|:---|:---|:---|
| KV | argon-kv | (dari wrangler.toml) | Rate limiting, cache |

## R2 Buckets
| Binding | Name | Purpose |
|:---|:---|:---|
| AUDIT | argon-audit | Audit logs JSON, webhook payloads |

## Workers AI
| Binding | Model | Purpose |
|:---|:---|:---|
| AI | @cf/meta/llama-4-scout-17b-16e-instruct | Chat, agent, swarm, overlord |

## Cron Triggers
| Schedule | Purpose |
|:---|:---|
| `*/15 * * * *` | Swarm evolve + Overlord maintain (parallel) |

## Secrets (Cloudflare)
| Secret | Purpose |
|:---|:---|
| GITHUB_TOKEN | Commit ke GitHub (grimoire + Argon) |
| BASIC_AUTH_USER | Basic Auth username (default: argon) |
| BASIC_AUTH_PASS | Basic Auth password |
| CF_ACCOUNT_ID | Deploy target account |
| CF_API_TOKEN | Workers Scripts:Edit |
| CF_SUBDOMAIN | vmojuga |

## Local Credentials (`/root/.argon-secrets/`)
| File | Isi |
|:---|:---|
| admin.key | Legacy admin API key |
| tenant.key | Tenant API key |
| tenant.id | Tenant ID |
| tenant.email | Tenant email |
| basic.full | argon:password |
| basic.user | argon |
| basic.pass | password |
| README.txt | Panduan |

## Vars (wrangler.toml)
| Var | Value |
|:---|:---|
| APP_NAME | Argon |
| DEFAULT_MODEL | @cf/meta/llama-4-scout-17b-16e-instruct |
| GITHUB_REPO | vmojuga-pixel/buku-koding-agentic |
| GITHUB_REPO_OVERLORD | vmojuga-pixel/Argon |

## External Services
| Service | Value | Purpose |
|:---|:---|:---|
| GitHub account | vmojuga-pixel | Repos: Argon, buku-koding-agentic |
| gh CLI | authenticated | Local GitHub ops |
| CF API token | /root/.cf-key | Wrangler deploy |

## GitHub Repos
| Repo | Purpose | Visibility |
|:---|:---|:---|
| vmojuga-pixel/Argon | Main project + docs/swarm-output | Public |
| vmojuga-pixel/buku-koding-agentic | Grimoire (auto-committed) | Public |
