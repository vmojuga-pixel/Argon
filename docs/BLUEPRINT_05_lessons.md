# ARGON — BLUEPRINT (Part 5: Lessons & Credentials)

## Pelajaran teknikal
1. Workers AI deprecated cepat — selalu ada fallback model
2. Durable Objects paid — new_sqlite_classes perlu Workers Paid $5/bln
3. Sequential AI calls lambat — parallelize atau ringkas output
4. Multi-auth guna prefix route, bukan try-both
5. Revoke op guna ID bukan prefix
6. KV TTL — rate limit sliding window TTL 120s
7. D1 batch() untuk multi-insert
8. ctx.waitUntil() untuk fire-and-forget (audit, webhook, usage)
9. HMAC signing guna crypto.subtle.importKey + HMAC-SHA256
10. CORS + credentials konflik — whitelist origin untuk production

## Credentials — lokasi /root/.argon-secrets/ (chmod 600)
| File | Isi | Guna |
|:---|:---|:---|
| admin.key | argon_xxx | Legacy /api/sessions |
| tenant.key | arg_tn_xxx | Chat/Agent/Swarm |
| tenant.id | tn_xxx | Tenant ID |
| tenant.email | owner@vmojuga.dev | Login email |
| basic.full | argon:PASS | curl -u dashboard/admin |
| basic.user | argon | Username |
| basic.pass | PASS | Password |

## Cloudflare secrets (live di Worker)
| Secret | Purpose |
|:---|:---|
| GITHUB_TOKEN | Commit Grimoire |
| BASIC_AUTH_USER | Basic Auth user |
| BASIC_AUTH_PASS | Basic Auth pass |

## External
| Secret | Lokasi | Purpose |
|:---|:---|:---|
| CLOUDFLARE_API_TOKEN | /root/.cf-key | Wrangler deploy |

## Central helper — scripts/creds.sh
    source /root/Argon/scripts/creds.sh
    argon_whoami
    argon_health
    argon_me
    argon_chat "Hello"
    argon_agent "run date"
    argon_swarm_evolve "topic"
    argon_admin_stats

## Matrix akses
| Endpoint | Auth | Credential |
|:---|:---|:---|
| /api/health, /signup, /docs | Public | - |
| /dashboard | Public UI | tenant.key (field) |
| /, /swarm, /admin/* | Basic Auth | basic.full |
| /api/sessions | X-API-Key | admin.key |
| /api/me, /api/chat, /api/agent | X-API-Key | tenant.key |
| /swarm/evolve, /swarm/state, /swarm/stream | X-API-Key | tenant.key |

## Rotation
    # Admin
    export CLOUDFLARE_API_TOKEN=$(cat /root/.cf-key) && cd /root/Argon
    npx wrangler d1 execute argon-db --remote --command="UPDATE api_keys SET active=0;"
    NEWKEY="argon_$(openssl rand -hex 32)"
    npx wrangler d1 execute argon-db --remote --command="INSERT INTO api_keys (key,label,active) VALUES ('$NEWKEY','admin-root',1);"
    echo "$NEWKEY" > /root/.argon-secrets/admin.key

    # Basic
    NEWPASS=$(openssl rand -base64 24 | tr -d '/+=' | head -c 28)
    echo "$NEWPASS" | npx wrangler secret put BASIC_AUTH_PASS
    printf "argon:%s\n" "$NEWPASS" > /root/.argon-secrets/basic.full

    # Tenant
    source /root/Argon/scripts/creds.sh
    curl -X POST "$ARGON_URL/api/keys/rotate" -H "X-API-Key: $ARGON_TENANT_KEY"

## Production checklist
- [ ] Semua secret dalam Cloudflare
- [ ] Backup D1 weekly
- [ ] Monitor Workers AI Neurons
- [ ] Slack/Discord alerts
- [ ] Whitelist CORS
- [ ] Rotate admin key quarterly
- [ ] /root/.argon-secrets/ chmod 600
