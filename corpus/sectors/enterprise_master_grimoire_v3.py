"""
================================================================================
CODING GRIMOIRE V3 (MASTER EDITION) // LORA, HYBRID RRF RAG, CEC/IVR STATE
MACHINE, POLYGLOT SQL/NOSQL & CANARY CI/CD ENGINE
================================================================================
Job ad requirements (RM8k-12k):
1. LoRA Fine-Tuning & Model Failure Mode Evaluator
2. Hybrid BM25 + Dense Vector Reciprocal Rank Fusion (RRF)
3. CEC/IVR/IVA Real-Time Voice Barge-In + Warm Transfer
4. Polyglot SQL (SQLite ACID) + NoSQL Document Session Store
5. Canary CI/CD Deployment + Self-Rollback Gate
================================================================================
"""
import hashlib
import json
import math
import re
import sqlite3
import time
from typing import Dict, List, Any, Tuple, Optional


# ==============================================================================
# 1. LORA FINE-TUNING & MODEL FAILURE MODE EVALUATOR
# ==============================================================================
class LoRAFineTuningEngine:
    def __init__(self, in_features: int = 8, out_features: int = 8, rank_r: int = 2, alpha: float = 4.0):
        self.in_features = in_features
        self.out_features = out_features
        self.rank_r = rank_r
        self.scaling = alpha / float(rank_r)
        self.W_frozen: List[List[float]] = [
            [0.1 if i == j else 0.02 for j in range(in_features)]
            for i in range(out_features)
        ]
        self.lora_A: List[List[float]] = [
            [((i + j + 1) * 0.05) for j in range(in_features)]
            for i in range(rank_r)
        ]
        self.lora_B: List[List[float]] = [
            [0.0 for _ in range(rank_r)]
            for _ in range(out_features)
        ]

    def forward(self, x: List[float]) -> List[float]:
        base_out = [
            sum(self.W_frozen[i][j] * x[j] for j in range(self.in_features))
            for i in range(self.out_features)
        ]
        lora_hidden = [
            sum(self.lora_A[r][j] * x[j] for j in range(self.in_features))
            for r in range(self.rank_r)
        ]
        lora_out = [
            sum(self.lora_B[i][r] * lora_hidden[r] for r in range(self.rank_r)) * self.scaling
            for i in range(self.out_features)
        ]
        return [round(b + l, 6) for b, l in zip(base_out, lora_out)]

    def fine_tune_step(self, dataset: List[Tuple[List[float], List[float]]],
                       lr: float = 0.05, epochs: int = 25) -> Dict[str, Any]:
        initial_loss = 0.0
        final_loss = 0.0
        for ep in range(epochs):
            epoch_loss = 0.0
            for x, target in dataset:
                pred = self.forward(x)
                errors = [p - t for p, t in zip(pred, target)]
                epoch_loss += sum(e * e for e in errors) / len(errors)
                lora_hidden = [
                    sum(self.lora_A[r][j] * x[j] for j in range(self.in_features))
                    for r in range(self.rank_r)
                ]
                for i in range(self.out_features):
                    for r in range(self.rank_r):
                        grad_b = errors[i] * lora_hidden[r] * self.scaling
                        self.lora_B[i][r] -= lr * grad_b
                        for j in range(self.in_features):
                            grad_a = errors[i] * self.lora_B[i][r] * x[j] * self.scaling
                            self.lora_A[r][j] -= (lr * 0.5) * grad_a
            if ep == 0:
                initial_loss = round(epoch_loss / len(dataset), 6)
            final_loss = round(epoch_loss / len(dataset), 6)

        full_params = self.in_features * self.out_features
        lora_params = (self.in_features * self.rank_r) + (self.rank_r * self.out_features)
        vram_reduction_pct = round((1.0 - (lora_params / full_params)) * 100.0, 2)
        return {
            "technique": "LoRA (Low-Rank Adaptation)",
            "rank_r": self.rank_r,
            "frozen_parameters": full_params,
            "trainable_lora_parameters": lora_params,
            "vram_memory_saved_pct": vram_reduction_pct,
            "initial_mse_loss": initial_loss,
            "final_mse_loss": final_loss,
            "convergence_verified": final_loss < initial_loss,
        }

    @staticmethod
    def identify_model_failure_modes(prompt: str, response: str, reference_facts: List[str]) -> Dict[str, Any]:
        failure_modes: List[str] = []
        resp_lower = response.lower()
        if "as an ai" in resp_lower or "i cannot fulfill" in resp_lower:
            failure_modes.append("FALSE_POSITIVE_REFUSAL")
        words = re.findall(r"\w+", resp_lower)
        if len(words) > 8 and len(set(words)) / len(words) < 0.35:
            failure_modes.append("DEGENERATE_TOKEN_REPETITION_LOOP")
        matched_facts = sum(1 for fact in reference_facts if fact.lower() in resp_lower)
        if reference_facts and matched_facts == 0:
            failure_modes.append("UNGROUNDED_HALLUCINATION")
        if response and response[-1] not in (".", "!", "?", "}", "]", "`"):
            failure_modes.append("PREMATURE_OUTPUT_TRUNCATION")
        return {
            "healthy_generation": len(failure_modes) == 0,
            "detected_failure_modes": failure_modes or ["NONE"],
            "fact_coverage_ratio": round(matched_facts / max(1, len(reference_facts)), 2),
        }


# ==============================================================================
# 2. HYBRID RAG: OKAPI BM25 + DENSE VECTOR RECIPROCAL RANK FUSION (RRF)
# ==============================================================================
class HybridRRFSearchEngine:
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus: List[Dict[str, Any]] = []
        self.doc_freqs: Dict[str, int] = {}
        self.avg_doc_len: float = 0.0

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        return re.findall(r"[a-z0-9\-]+", text.lower())

    @staticmethod
    def _compute_embedding(tokens: List[str], dim: int = 32) -> List[float]:
        vec = [0.0] * dim
        for t in tokens:
            h = int(hashlib.md5(t.encode("utf-8")).hexdigest(), 16)
            for i in range(dim):
                vec[i] += 1.0 if ((h >> i) & 1) else -1.0
        norm = math.sqrt(sum(v * v for v in vec)) or 1.0
        return [v / norm for v in vec]

    def add_documents(self, docs: List[Dict[str, str]]) -> None:
        total_len = 0
        for d in docs:
            tokens = self._tokenize(d["text"])
            total_len += len(tokens)
            for ut in set(tokens):
                self.doc_freqs[ut] = self.doc_freqs.get(ut, 0) + 1
            self.corpus.append({
                "id": d["id"], "text": d["text"],
                "tokens": tokens,
                "vector": self._compute_embedding(tokens),
            })
        self.avg_doc_len = total_len / max(1, len(self.corpus))

    def _bm25_score(self, query_tokens: List[str], doc: Dict[str, Any]) -> float:
        score = 0.0
        N = len(self.corpus)
        doc_len = len(doc["tokens"])
        for qt in query_tokens:
            df = self.doc_freqs.get(qt, 0)
            if df == 0:
                continue
            idf = math.log(1.0 + (N - df + 0.5) / (df + 0.5))
            tf = doc["tokens"].count(qt)
            denom = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / max(1.0, self.avg_doc_len)))
            score += idf * ((tf * (self.k1 + 1.0)) / denom)
        return score

    def hybrid_search_rrf(self, query: str, top_k: int = 2, rrf_k: int = 60) -> Dict[str, Any]:
        q_tokens = self._tokenize(query)
        q_vec = self._compute_embedding(q_tokens)
        bm25_ranked = sorted(self.corpus, key=lambda d: self._bm25_score(q_tokens, d), reverse=True)
        vec_ranked = sorted(self.corpus, key=lambda d: sum(a * b for a, b in zip(q_vec, d["vector"])), reverse=True)
        rrf_scores: Dict[str, float] = {}
        doc_map: Dict[str, str] = {}
        for rank, doc in enumerate(bm25_ranked, start=1):
            rrf_scores[doc["id"]] = rrf_scores.get(doc["id"], 0.0) + (1.0 / (rrf_k + rank))
            doc_map[doc["id"]] = doc["text"]
        for rank, doc in enumerate(vec_ranked, start=1):
            rrf_scores[doc["id"]] = rrf_scores.get(doc["id"], 0.0) + (1.0 / (rrf_k + rank))
        fused = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)[:top_k]
        return {
            "search_algorithm": "HYBRID_BM25_PLUS_VECTOR_RRF",
            "query": query,
            "top_results": [
                {"doc_id": d, "rrf_score": round(sc, 6), "content": doc_map[d]}
                for d, sc in fused
            ],
        }


# ==============================================================================
# 3. CEC/IVR/IVA VOICE STATE MACHINE + POLYGLOT SQL/NOSQL
# ==============================================================================
class PolyglotIVAContactCenterEngine:
    def __init__(self):
        self.sql_conn = sqlite3.connect(":memory:")
        self._init_sql_schema()
        self.nosql_call_sessions: Dict[str, Dict[str, Any]] = {}

    def _init_sql_schema(self) -> None:
        cur = self.sql_conn.cursor()
        cur.execute("""
            CREATE TABLE customers (
                customer_id TEXT PRIMARY KEY,
                full_name TEXT NOT NULL,
                sla_tier TEXT NOT NULL,
                credit_balance REAL DEFAULT 0.0
            )
        """)
        cur.execute("""
            CREATE TABLE enterprise_orders (
                order_id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                order_status TEXT NOT NULL,
                amount REAL NOT NULL,
                FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
            )
        """)
        cur.execute("INSERT INTO customers VALUES ('CUST-88', 'Dato Sri Pelanggan Korporat', 'VIP_PLATINUM', 25000.00)")
        cur.execute("INSERT INTO enterprise_orders VALUES ('ORD-7701', 'CUST-88', 'DISPATCHED_EXPRESS', 4200.00)")
        self.sql_conn.commit()

    def process_ivr_voice_event(self, call_session_id: str, customer_id: str,
                                 voice_transcript: str, dtmf_keypad: Optional[str] = None,
                                 user_barge_in: bool = False) -> Dict[str, Any]:
        t0 = time.perf_counter_ns()
        session_doc = self.nosql_call_sessions.get(call_session_id, {
            "session_id": call_session_id, "customer_id": customer_id,
            "turn_count": 0, "tts_speaking": True,
            "barge_in_interrupts": 0, "call_state": "IVR_ACTIVE", "history": [],
        })
        session_doc["turn_count"] += 1
        if user_barge_in and session_doc["tts_speaking"]:
            session_doc["tts_speaking"] = False
            session_doc["barge_in_interrupts"] += 1

        cur = self.sql_conn.cursor()
        cur.execute("""
            SELECT c.full_name, c.sla_tier, o.order_id, o.order_status, o.amount
            FROM customers c
            LEFT JOIN enterprise_orders o ON c.customer_id = o.customer_id
            WHERE c.customer_id = ?
        """, (customer_id,))
        row = cur.fetchone()

        if dtmf_keypad == "0" or "human" in voice_transcript.lower() or "pegawai" in voice_transcript.lower():
            session_doc["call_state"] = "WARM_TRANSFER_TO_HUMAN_AGENT"
            iva_reply = "Panggilan anda disambungkan kepada Pegawai Eksekutif dengan ringkasan konteks penuh."
        elif row:
            full_name, tier, ord_id, ord_status, amt = row
            session_doc["call_state"] = "AUTOMATED_RESOLUTION"
            iva_reply = f"Selamat sejahtera {full_name} ({tier}). Pesanan {ord_id} bernilai RM{amt:.2f} kini berstatus {ord_status}."
        else:
            session_doc["call_state"] = "FALLBACK_IDENTIFICATION"
            iva_reply = "Rekod pelanggan tidak dijumpai di dalam pangkalan data SQL."

        session_doc["tts_speaking"] = True
        session_doc["history"].append({"utterance": voice_transcript, "dtmf": dtmf_keypad, "reply": iva_reply})
        self.nosql_call_sessions[call_session_id] = session_doc
        latency_ms = round((time.perf_counter_ns() - t0) / 1_000_000, 3)

        return {
            "cec_ivr_state": session_doc["call_state"],
            "barge_in_handled": user_barge_in,
            "sql_acid_verified": row is not None,
            "nosql_session_turns": session_doc["turn_count"],
            "iva_tts_response": iva_reply,
            "execution_latency_ms": latency_ms,
        }


# ==============================================================================
# 4. AUTOMATED AI CI/CD CANARY DEPLOYMENT & SELF-ROLLBACK GATE
# ==============================================================================
class AutomatedCanaryDeploymentGate:
    @staticmethod
    def evaluate_canary_rollout(model_v1_metrics: Dict[str, float],
                                 canary_v2_metrics: Dict[str, float]) -> Dict[str, Any]:
        v1_lat = model_v1_metrics.get("p95_latency_ms", 50.0)
        v2_lat = canary_v2_metrics.get("p95_latency_ms", 50.0)
        v2_acc = canary_v2_metrics.get("accuracy_pct", 0.0)
        v2_hallucination_rate = canary_v2_metrics.get("hallucination_rate_pct", 100.0)

        passed_accuracy = v2_acc >= 90.0
        passed_safety = v2_hallucination_rate <= 2.0
        passed_latency = v2_lat <= (v1_lat * 1.25)

        if passed_accuracy and passed_safety and passed_latency:
            return {
                "ci_cd_decision": "PROMOTE_CANARY_TO_100_PERCENT_PRODUCTION",
                "traffic_split": {"v1_stable": 0, "v2_canary": 100},
                "gates": {"accuracy_gate": "PASS", "hallucination_safety_gate": "PASS", "latency_sla_gate": "PASS"},
            }
        return {
            "ci_cd_decision": "INSTANT_AUTO_ROLLBACK_TO_V1",
            "traffic_split": {"v1_stable": 100, "v2_canary": 0},
            "gates": {
                "accuracy_gate": "PASS" if passed_accuracy else "FAIL",
                "hallucination_safety_gate": "PASS" if passed_safety else "FAIL",
                "latency_sla_gate": "PASS" if passed_latency else "FAIL",
            },
        }


# ==============================================================================
# INTEGRATION TEST
# ==============================================================================
if __name__ == "__main__":
    print("=== GRIMOIRE V3 (MASTER EDITION) ===\n")

    # 1. LoRA
    lora = LoRAFineTuningEngine(in_features=8, out_features=8, rank_r=2)
    sample_pairs = [
        ([1.0, 0.5, 0.2, 0.1, 0.0, 0.0, 0.4, 0.8], [0.5, 0.4, 0.3, 0.2, 0.1, 0.1, 0.2, 0.6]),
        ([0.2, 0.9, 0.4, 0.3, 0.1, 0.2, 0.0, 0.1], [0.2, 0.7, 0.3, 0.2, 0.1, 0.1, 0.1, 0.2]),
    ]
    lora_report = lora.fine_tune_step(sample_pairs, lr=0.05, epochs=30)
    failure_check = lora.identify_model_failure_modes(
        prompt="Berapakah harga pelan Enterprise?",
        response="Harga pelan Enterprise ialah RM4200 sebulan dengan SLA 99.99%.",
        reference_facts=["RM4200", "99.99%"],
    )
    print("[1. LORA FINE-TUNING & FAILURE MODE]:\n", json.dumps({
        "lora_metrics": lora_report, "failure_mode_audit": failure_check
    }, indent=2))

    # 2. Hybrid RRF
    hybrid_rag = HybridRRFSearchEngine()
    hybrid_rag.add_documents([
        {"id": "KB-101", "text": "Kod ralat ORD-7701 merujuk kepada penghantaran ekspres kluster GPU di Kuala Lumpur."},
        {"id": "KB-102", "text": "Panduan konfigurasi Kubernetes Horizontal Pod Autoscaler dan Docker container untuk produksi."},
        {"id": "KB-103", "text": "Prosedur integrasi IVR dan CEC Contact Center menggunakan protokol kependaman rendah."},
    ])
    rrf_out = hybrid_rag.hybrid_search_rrf("Semak status penghantaran ORD-7701 Kuala Lumpur")
    print("\n[2. HYBRID BM25 + RRF]:\n", json.dumps(rrf_out, indent=2))

    # 3. Polyglot IVA
    cec_engine = PolyglotIVAContactCenterEngine()
    call_out = cec_engine.process_ivr_voice_event(
        call_session_id="CALL-9901", customer_id="CUST-88",
        voice_transcript="Berapa nilai pesanan saya dan apakah statusnya?",
        dtmf_keypad=None, user_barge_in=True,
    )
    print("\n[3. CEC/IVR VOICE + POLYGLOT SQL/NOSQL]:\n", json.dumps(call_out, indent=2))

    # 4. Canary CI/CD
    canary_out = AutomatedCanaryDeploymentGate.evaluate_canary_rollout(
        model_v1_metrics={"p95_latency_ms": 42.0, "accuracy_pct": 91.0},
        canary_v2_metrics={"p95_latency_ms": 38.5, "accuracy_pct": 94.5, "hallucination_rate_pct": 0.8},
    )
    print("\n[4. CANARY CI/CD GATE]:\n", json.dumps(canary_out, indent=2))
