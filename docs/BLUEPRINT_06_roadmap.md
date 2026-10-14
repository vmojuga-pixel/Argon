# ARGON — BLUEPRINT (Part 6: Roadmap)

## Selesai
- [x] Chat + Agent + Swarm
- [x] Durable Objects stateful
- [x] Multi-tenant SaaS
- [x] Rate limit per-tier
- [x] Webhooks + HMAC
- [x] Dashboard + Docs
- [x] Admin observability
- [x] Audit log
- [x] Auto Git commit (Grimoire)
- [x] Recover tenant key
- [x] Central creds.sh

## Sedang berjalan
- [ ] OpenAPI 3.1 spec + Postman
- [ ] SDK npm + PyPI
- [ ] Slack/Discord admin alerts
- [ ] Usage chart 30 hari
- [ ] Custom domain per tenant

## Backlog
- [ ] Stripe billing
- [ ] SSO Google/GitHub OAuth
- [ ] Billing history + invoice PDF
- [ ] Bulk email onboarding
- [ ] Team management (multi-user per tenant)
- [ ] SLA monitoring + status page
- [ ] ToS + Privacy Policy

## Commands cheatsheet
    # Deploy
    export CLOUDFLARE_API_TOKEN=$(cat /root/.cf-key) && cd /root/Argon && npx wrangler deploy

    # Live tail
    npx wrangler tail --format=pretty

    # D1 query
    npx wrangler d1 execute argon-db --remote --command="SELECT * FROM tenants;"

    # Apply migration
    npx wrangler d1 execute argon-db --remote --file=./migrations/XXXX.sql

    # Set secret
    echo "value" | npx wrangler secret put SECRET_NAME

    # Trigger swarm
    source /root/Argon/scripts/creds.sh
    argon_swarm_evolve "topic"

## Glossary
- **Swarm**: 7-agent loop (Visionary→Architect→Synthesizer→Breaker→Optimizer→Judge→Scribe)
- **Epoch**: 1 kitaran penuh swarm
- **Grimoire**: Fail markdown di GitHub yang swarm tulis
- **Durable Object**: Serverless stateful class
- **Tenant**: Pelanggan SaaS
- **RPM**: Rate per minute
- **Quota**: Had bulanan
- **Burst**: Had sementara untuk spike
- **HMAC**: Hash-based Message Authentication Code
