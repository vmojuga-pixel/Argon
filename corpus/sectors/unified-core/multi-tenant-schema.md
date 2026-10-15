# Multi-Tenant Schema
## Problem
4 bisnes 1 platform, risk data leak.
## Solution
tenant_id FK + PostgreSQL RLS + GIN index JSONB.
## Real Source
PostgreSQL RLS, AWS SaaS patterns.
## Metrics
3% overhead, 100% isolation
