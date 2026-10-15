# Multi-Agent AI Itinerary & Booking Engine
## Problem
Single-LLM prompt tak boleh handle flight + hotel + budget reasoning. Personalization rendah.
## Solution
LangGraph multi-agent: Agent 1 cari flight, Agent 2 cari hotel, Agent 3 optimize berdasarkan bajet user. State-based reasoning.
## Real Source
- LangGraph (LangChain)
- Amadeus/Sabre GDS API
- Booking.com Partner API
## Metrics
Itinerary accuracy 89%, booking conversion ↑ 35%, latency 3s
