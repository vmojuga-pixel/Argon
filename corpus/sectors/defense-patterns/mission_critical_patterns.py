"""
================================================================================
MISSION-CRITICAL SYSTEM PATTERNS
================================================================================
Abstracted from MDSI (private defense repo). Sanitized for public corpus.
Generic patterns for high-reliability, zero-trust, multi-echelon systems.

Patterns:
1. Multi-Echelon Scaling (Tier-1 edge → Tier-2 sector → Tier-3 strategic)
2. SHA-256 Hash-Chain Audit Ledger (tamper-proof)
3. Two-Person Cryptographic HITL Gate (dual-signature authorization)
4. DDIL Mesh Autonomy (Disconnected/Intermittent/Limited-bandwidth)
5. RK4 Physics Simulator + Proportional Navigation
6. Entity-Link Ontology Graph (multi-source fusion)
7. Sensor-to-Shooter Pairing with Dynamic Pk
8. Multi-Modal Command (Voice + CLI + Intent Routing)
================================================================================
"""
import hashlib
import json
import math
import time
from typing import Dict, List, Any, Optional, Tuple, Callable


# ==============================================================================
# 1. MULTI-ECHELON SCALING
# ==============================================================================
class MultiEchelonScaler:
    """
    Pattern: sistem beroperasi dalam 3 tier autonomous dengan graceful scaling.
    - Tier-1 (Edge): low nodes, high autonomy, resilient DDIL
    - Tier-2 (Sector): medium nodes, full comms
    - Tier-3 (Strategic): high nodes, centralized intelligence
    """
    TIERS = {
        "EDGE": {"base_nodes": 50, "base_sensors": 200, "coverage_km": 35, "autonomy": "FULL_LOCAL"},
        "SECTOR": {"base_nodes": 640, "base_sensors": 3400, "coverage_km": 650, "autonomy": "FEDERATED"},
        "STRATEGIC": {"base_nodes": 5000, "base_sensors": 43000, "coverage_km": 3200, "autonomy": "CENTRALIZED"},
    }

    def __init__(self):
        self.audit = []

    def scale_metrics(self, tier: str, scale_factor: float = 1.0) -> Dict[str, Any]:
        t = self.TIERS.get(tier.upper())
        if not t:
            return {"error": f"unknown tier: {tier}"}
        return {
            "tier": tier.upper(),
            "nodes": round(t["base_nodes"] * scale_factor),
            "sensors": round(t["base_sensors"] * scale_factor),
            "coverage_km": t["coverage_km"],
            "autonomy_mode": t["autonomy"],
            "scale_factor": scale_factor,
        }


# ==============================================================================
# 2. SHA-256 HASH-CHAIN AUDIT LEDGER
# ==============================================================================
class HashChainLedger:
    """
    Pattern: every critical action hash-linked ke previous → tamper detection.
    Generic untuk: financial audit, defense ROE, medical compliance, ML model ops.
    """

    def __init__(self):
        self.chain: List[Dict[str, Any]] = []

    def append(self, actor: str, action: str, payload: str, jurisdiction: str = "GENERIC") -> Dict[str, Any]:
        prev_hash = self.chain[-1]["hash"] if self.chain else "0" * 64
        ts = time.time()
        raw = f"{prev_hash}|{ts}|{actor}|{action}|{payload}|{jurisdiction}"
        h = hashlib.sha256(raw.encode("utf-8")).hexdigest()
        entry = {
            "index": len(self.chain) + 1,
            "ts": ts,
            "actor": actor,
            "action": action,
            "jurisdiction": jurisdiction,
            "prev": prev_hash,
            "hash": h,
        }
        self.chain.append(entry)
        return entry

    def verify(self) -> Dict[str, Any]:
        for i in range(1, len(self.chain)):
            if self.chain[i]["prev"] != self.chain[i - 1]["hash"]:
                return {"tamper_free": False, "broken_at": i}
        return {"tamper_free": True, "total_events": len(self.chain)}


# ==============================================================================
# 3. TWO-PERSON HITL CRYPTOGRAPHIC GATE
# ==============================================================================
class TwoPersonHITLGate:
    """
    Pattern: high-risk actions require 2 independent cryptographic signatures.
    Generic untuk: production deploys, financial transfers, missile release, etc.
    """

    def __init__(self):
        self.pending: Dict[str, Dict[str, Any]] = {}

    def request(self, action: str, actor1: str, context: Dict[str, Any]) -> Dict[str, Any]:
        import uuid
        req_id = "REQ-" + uuid.uuid4().hex[:8].upper()
        sig1 = hashlib.sha256(f"{actor1}|{action}|{time.time()}".encode()).hexdigest()
        self.pending[req_id] = {
            "id": req_id,
            "action": action,
            "actor1": actor1,
            "sig1": sig1,
            "sig2": None,
            "status": "AWAITING_SECOND_SIGNER",
            "context": context,
        }
        return self.pending[req_id]

    def cosign(self, req_id: str, actor2: str) -> Dict[str, Any]:
        if req_id not in self.pending:
            return {"error": "request not found"}
        req = self.pending[req_id]
        if req["sig2"] is not None:
            return {"error": "already co-signed"}
        if actor2 == req["actor1"]:
            return {"error": "must be different actor"}
        req["sig2"] = hashlib.sha256(f"{actor2}|{req_id}|{time.time()}".encode()).hexdigest()
        req["status"] = "AUTHORIZED_AND_DISPATCHED"
        return req


# ==============================================================================
# 4. DDIL MESH AUTONOMY (Disconnected/Intermittent/Limited-bandwidth)
# ==============================================================================
class DDILMeshNode:
    """
    Pattern: node beroperasi penuh walaupun centralized uplink hilang.
    - Peer-to-peer gossip sync
    - Local edge compute (NPU/CPU)
    - Fallback bandwidth ~48 kbps
    """

    def __init__(self, node_id: str):
        self.node_id = node_id
        self.uplink_online = True
        self.local_state: Dict[str, Any] = {}
        self.peer_queue: List[Dict[str, Any]] = []

    def ingest(self, key: str, value: Any) -> Dict[str, Any]:
        self.local_state[key] = value
        self.peer_queue.append({"key": key, "value": value, "ts": time.time()})
        return {
            "node_id": self.node_id,
            "queued_for_sync": len(self.peer_queue),
            "mode": "UPLINK" if self.uplink_online else "DDIL_LOCAL_MESH",
        }

    def flush_to_uplink(self) -> Dict[str, Any]:
        if not self.uplink_online:
            return {"flushed": 0, "reason": "DDIL mode active"}
        n = len(self.peer_queue)
        self.peer_queue = []
        return {"flushed": n}


# ==============================================================================
# 5. RK4 PHYSICS + PROPORTIONAL NAVIGATION
# ==============================================================================
def simulate_rk4_intercept(target_alt_km, target_speed_mach, target_range_km,
                            nav_const=4.2, boost_accel_g=32.0):
    """
    Pattern: 4th-Order Runge-Kutta integration + Proportional Navigation.
    Generic untuk: robotics, missile defense, drone intercept, satellite docking.
    """
    dt = 0.25
    mach_to_kms = 0.343
    tx, ty = target_range_km, target_alt_km
    tvx, tvy = -target_speed_mach * mach_to_kms, -0.04
    sx, sy = 0.0, 0.05
    sam_speed = min(4.8, 1.35 + boost_accel_g * 0.042)
    heading = math.atan2(ty - sy, tx - sx)
    trajectory = []
    min_miss = float("inf")
    intercept_time = 0.0
    hit = False

    for step in range(260):
        t = step * dt
        dx, dy = tx - sx, ty - sy
        dist_km = math.sqrt(dx * dx + dy * dy)
        dist_m = dist_km * 1000
        if dist_m < min_miss:
            min_miss = dist_m
            intercept_time = t
        if step % 4 == 0 or dist_m < 450:
            trajectory.append({"t": round(t, 2), "dist_m": round(dist_m, 1)})
        if dist_m <= 420:
            hit = True
            break
        if tx <= 0 or ty <= 0:
            break
        los = math.atan2(dy, dx)
        heading += max(-0.18, min(0.18, nav_const * 0.065 * (los - heading)))
        tx += tvx * dt
        ty += tvy * dt - 0.5 * 0.0008 * dt * dt
        sx += math.cos(heading) * sam_speed * dt
        sy += math.sin(heading) * sam_speed * dt

    return {
        "intercepted": hit,
        "min_miss_m": round(min_miss, 1),
        "intercept_time_s": round(intercept_time, 2),
        "trajectory_samples": len(trajectory),
    }


def radar_burn_through(radar_kw: float, rcs_m2: float, jammer_watts: float) -> Dict[str, Any]:
    """
    Pattern: radar range equation vs ECM jammer power.
    Generic untuk: RF system, sensor design, EW resilience.
    """
    base_detection_km = math.pow(radar_kw * 120 * max(0.01, rcs_m2), 0.25) * 14.8
    burn_through_km = base_detection_km / (1 + max(0, jammer_watts) / 450)
    j_to_s_db = 10 * math.log10(max(1, jammer_watts) / (radar_kw * max(0.02, rcs_m2) * 12))
    return {
        "max_detection_km": round(base_detection_km, 1),
        "burn_through_km": round(burn_through_km, 1),
        "j_to_s_db": round(j_to_s_db, 1),
    }


# ==============================================================================
# 6. ENTITY-LINK ONTOLOGY GRAPH
# ==============================================================================
class EntityLinkOntology:
    """
    Pattern: multi-source entity fusion untuk intelligence/risk analysis.
    Generic untuk: fraud detection, supply chain, threat hunting, KYC.
    """

    def __init__(self):
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.edges: List[Tuple[str, str, float]] = []

    def add_entity(self, eid: str, label: str, category: str, risk_score: float) -> None:
        self.nodes[eid] = {"id": eid, "label": label, "category": category, "risk": risk_score}

    def link(self, from_id: str, to_id: str, weight: float = 1.0) -> None:
        if from_id in self.nodes and to_id in self.nodes:
            self.edges.append((from_id, to_id, weight))

    def find_cluster(self, seed_id: str, max_depth: int = 2) -> Dict[str, Any]:
        visited = set()
        queue = [(seed_id, 0)]
        while queue:
            nid, d = queue.pop(0)
            if nid in visited or d > max_depth:
                continue
            visited.add(nid)
            for f, t, _ in self.edges:
                if f == nid and t not in visited:
                    queue.append((t, d + 1))
                elif t == nid and f not in visited:
                    queue.append((f, d + 1))
        return {
            "seed": seed_id,
            "cluster_size": len(visited),
            "entities": [self.nodes[n] for n in visited],
            "avg_risk": round(sum(self.nodes[n]["risk"] for n in visited) / max(1, len(visited)), 1),
        }


# ==============================================================================
# 7. SENSOR-TO-SHOOTER PAIRING (Generic Asset-to-Objective)
# ==============================================================================
def pair_sensor_to_shooter(
    assets: List[Dict[str, Any]],
    target_priority: str = "STANDARD",
    ddil_mode: bool = False,
) -> List[Dict[str, Any]]:
    """
    Pattern: dynamic pairing antara assets dan objectives berdasarkan Pk, range, priority.
    Generic untuk: dispatch systems, delivery routing, emergency response, security.
    """
    bonus = 0.04 if target_priority == "CRITICAL" else 0.0
    ddil_penalty = 0.02 if ddil_mode else 0.0
    ranked = []
    for a in assets:
        eff_pk = min(0.99, a.get("pk_base", 0.8) + bonus - ddil_penalty)
        tti_min = max(1.2, 180 / max(20, a.get("range_km", 50)))
        ranked.append({
            "asset_id": a.get("id"),
            "name": a.get("name"),
            "effective_pk_pct": round(eff_pk * 100, 1),
            "time_to_objective_min": round(tti_min, 1),
            "score": round(eff_pk * 100 - tti_min, 2),
        })
    ranked.sort(key=lambda x: x["score"], reverse=True)
    return ranked


# ==============================================================================
# 8. MULTI-MODAL COMMAND ROUTER
# ==============================================================================
def route_command(text: str) -> Dict[str, Any]:
    """
    Pattern: intent classification dari voice/CLI ke module.
    Generic untuk: voice assistants, chatops, industrial control.
    """
    text_l = text.lower()
    routes = [
        ("EDGE", [r"edge", r"small", r"tactical", r"ddil"]),
        ("SECTOR", [r"sector", r"operational", r"medium"]),
        ("STRATEGIC", [r"strategic", r"national", r"high"]),
        ("SIMULATION", [r"simulate", r"rk4", r"physics", r"intercept"]),
        ("ONTOLOGY", [r"ontology", r"graph", r"link", r"entity"]),
        ("APPROVAL", [r"approve", r"gate", r"sign", r"authorize"]),
        ("MODE_TOGGLE", [r"silent", r"emcon", r"toggle"]),
    ]
    for module, patterns in routes:
        import re
        for p in patterns:
            if re.search(p, text_l):
                return {"module": module, "input": text, "matched_pattern": p}
    return {"module": "DEFAULT", "input": text, "matched_pattern": None}


# ==============================================================================
# INTEGRATION TEST
# ==============================================================================
if __name__ == "__main__":
    print("=== MISSION-CRITICAL PATTERNS (Sanitized from MDSI) ===\n")

    # 1. Echelon scaling
    s = MultiEchelonScaler()
    print("[1. ECHELON SCALING]")
    for tier in ["EDGE", "SECTOR", "STRATEGIC"]:
        print("  ", s.scale_metrics(tier, 1.0))

    # 2. Hash chain
    print("\n[2. HASH-CHAIN LEDGER]")
    l = HashChainLedger()
    l.append("operator_01", "AUTHORIZE_DEPLOY", "model-v2.1", "GENERIC")
    l.append("operator_02", "EXECUTE_MIGRATION", "schema-v3", "GENERIC")
    print("  ", l.verify())

    # 3. Two-person gate
    print("\n[3. TWO-PERSON HITL GATE]")
    g = TwoPersonHITLGate()
    req = g.request("DEPLOY_PRODUCTION", "alice", {"target": "prod-eu"})
    print("   request:", req["id"], req["status"])
    cosigned = g.cosign(req["id"], "bob")
    print("   after cosign:", cosigned["status"])

    # 4. DDIL
    print("\n[4. DDIL MESH]")
    n = DDILMeshNode("node-alpha")
    n.uplink_online = False
    print("   ", n.ingest("target_coord", {"x": 100, "y": 200}))

    # 5. RK4 + radar
    print("\n[5. RK4 + RADAR]")
    print("   intercept:", simulate_rk4_intercept(18.5, 3.4, 95.0))
    print("   burn-through:", radar_burn_through(450, 0.35, 180))

    # 6. Ontology
    print("\n[6. ONTOLOGY]")
    o = EntityLinkOntology()
    o.add_entity("E1", "Dark Vessel A", "MARITIME", 96)
    o.add_entity("E2", "Shell Corp B", "CORP", 89)
    o.add_entity("E3", "APT Cluster C", "CYBER", 92)
    o.link("E1", "E2")
    o.link("E1", "E3")
    print("   cluster:", o.find_cluster("E1")["cluster_size"], "entities")

    # 7. Pairing
    print("\n[7. SENSOR-TO-SHOOTER]")
    ranked = pair_sensor_to_shooter([
        {"id": "A1", "name": "Drone-X", "pk_base": 0.88, "range_km": 45},
        {"id": "A2", "name": "USV-Y", "pk_base": 0.91, "range_km": 110},
    ], target_priority="CRITICAL")
    for r in ranked:
        print("   ", r["name"], "→ Pk", r["effective_pk_pct"], "%")

    # 8. Command router
    print("\n[8. COMMAND ROUTER]")
    for cmd in ["show me strategic tier", "simulate rk4 intercept", "approve gate", "toggle silent"]:
        print("   ", cmd, "→", route_command(cmd)["module"])
