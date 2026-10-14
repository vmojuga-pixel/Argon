# ARGON — BLUEPRINT (Part 3: Billing)

## Tier matrix
| Tier | Harga | Chat/bln | Agent/bln | Swarm/bln | RPM | Burst |
|:---|:---|:---|:---|:---|:---|:---|
| Free | $0 | 100 | - | - | 10 | 20 |
| Starter | $29 | 10,000 | 1,000 | 100 | 60 | 120 |
| Pro | $149 | 100,000 | 20,000 | 5,000 | 300 | 600 |
| Enterprise | Custom | unlimited | unlimited | unlimited | 1,000 | 2,000 |

## Enforcement flow
    Request → authenticate(X-API-Key) → checkRateLimit(KV) → checkQuota(D1) → handler

## 3 jenis had
1. **Quota bulanan** — checkQuota() sebelum handler, 429 bila exceeded
2. **Rate limit (RPM)** — KV sliding window per menit, 429 bila spam
3. **Burst** — buffer untuk spike pendek

## Webhook trigger
- quota.warning @ 80% usage
- quota.exceeded @ 100%

## Unit economics
| Tier | Kos SIR | Harga | Margin |
|:---|:---|:---|:---|
| Free | ~$0.02 | $0 | Loss leader |
| Starter | ~$4 | $29 | 86% |
| Pro | ~$45 | $149 | 70% |
| Enterprise | Variable | Custom | 60-80% |

Break-even: 3 pelanggan Starter cover Workers Paid ($5/bln).

## Overage (optional)
- Chat: $0.002/req
- Agent: $0.01/req
- Swarm: $0.05/cycle

## Manual upgrade
    export CLOUDFLARE_API_TOKEN=$(cat /root/.cf-key) && cd /root/Argon
    npx wrangler d1 execute argon-db --remote --command="UPDATE tenants SET plan='starter' WHERE id='tn_xxx';"
