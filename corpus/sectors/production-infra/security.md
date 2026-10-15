# Production Infra — Part 3: Security Hardening

## 1. JWT Authentication (python-jose)
- HTTPBearer dari fastapi.security
- jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
- Extract: sub (user_id), tenant_id, role
- Raise 401 + WWW-Authenticate: Bearer kalau invalid
- TokenData Pydantic model returned to dependency

## 2. Advanced Rate Limiter (Redis + Lua)
Sliding window counter — lebih adil dari fixed window.
Lua script (atomic, no race condition):
  redis.call('zremrangebyscore', KEYS[1], 0, ARGV[1])   -- prune old
  local count = redis.call('zcard', KEYS[1])
  if count < tonumber(ARGV[2]) then
    redis.call('zadd', KEYS[1], ARGV[3], ARGV[3])        -- add now
    return 1
  else
    return 0
  end

## Usage
key = f"rate_limit:{tenant_id}:{client_ip}"
redis.eval(lua_script, 1, key, str(window_start), str(limit), str(now))
If not allowed: raise 429 "Rate limit exceeded. Max {limit} per {window}s"

## Why Lua + Redis
- Atomic: EVAL runs Lua single-threaded in Redis
- Even 1000 req same ms => correct counting, no race
- Same technique used by Uber/Grab/Cloudflare scale systems
- Sliding window = fair vs fixed window burst exploit

## Endpoint Example
@app.get("/v1/ai-war/chat/completions")
async def chat(user = Depends(get_current_user), _ = Depends(lambda: rate_limit_dependency(limit=20, window=60))):
    return {"message": "Secure + rate-limited"}

## Layer Stack
- Layer 1: JWT auth (who)
- Layer 2: Rate limit per tenant + IP (how often)
- Layer 3: WAF (what payload) — from fintech-ai corpus
- Layer 4: TLS termination (edge / ingress)
