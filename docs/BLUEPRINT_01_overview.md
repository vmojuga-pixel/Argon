# ARGON — BLUEPRINT (Part 1: Overview)

## Platform
- **Cloudflare Workers** (edge runtime)
- **Workers AI** — model: @cf/meta/llama-4-scout-17b-16e-instruct
- **Durable Objects** (SQLite state untuk swarm)
- **D1** (SQLite global) — tenants, usage, webhooks, audit
- **KV** (rate limiting, cache)
- **R2** (audit logs, webhook payloads)
- **Cron** — */15 * * * * (auto-evolve swarm)

## URLs
- Worker: https://argon.vmojuga.workers.dev
- Repo: https://github.com/vmojuga-pixel/Argon
- Grimoire: https://github.com/vmojuga-pixel/buku-koding-agentic

## Fail struktur
    /root/Argon/
    ├── wrangler.toml
    ├── migrations/
    │   ├── 0001_init.sql
    │   ├── 0002_saas.sql
    │   └── 0003_top_tier.sql
    ├── src/
    │   ├── index.js            (entry: routing, auth, CORS)
    │   ├── swarm.js            (SwarmBrain DO)
    │   ├── api/{chat,agent}.js
    │   ├── auth/apikey.js
    │   ├── saas/{tenant,signup,ratelimit,webhooks}.js
    │   ├── admin/{stats,recover}.js
    │   └── web/{landing,swarm-ui,dashboard,docs}.js
    ├── scripts/creds.sh        (central credential loader)
    └── docs/BLUEPRINT_*.md
