# Security Hardening
## Problem
API exposed DDoS, SQLi, bot.
## Solution
Rate limit token bucket + WAF + IP blocklist.
## Real Source
OWASP API Top 10, Cloudflare WAF.
## Metrics
99.8% blocked
