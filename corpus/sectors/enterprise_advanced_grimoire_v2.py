"""
================================================================================
CODING GRIMOIRE V2 // ADVANCED DISTRIBUTED SPARK, GPU ROUTER, VENDOR AUDITOR
& CROSS-STACK AI DEBUGGER
================================================================================
Job ad requirements (RM8k-12k):
1. Distributed Data Architecture (Apache Spark MapReduce Partitioning)
2. Multi-Provider LLM Router (OpenAI/Claude/Edge) & GPU Cost Orchestrator
3. Vendor Codebase Technical Auditor (AST Static Complexity & Security)
4. Cross-Stack AI Systems Debugger (Infra vs API vs LLM Reasoning)
================================================================================
"""
import ast
import hashlib
import json
import math
import time
from typing import Callable, Dict, List, Any, Tuple


# ==============================================================================
# 1. DISTRIBUTED DATA — SPARK STYLE PARTITION & MAP-REDUCE
# ==============================================================================
class SparkStyleDistributedDataset:
    def __init__(self, raw_data: List[Dict[str, Any]], num_partitions: int = 4):
        self.num_partitions = max(1, num_partitions)
        self.partitions: List[List[Dict[str, Any]]] = [[] for _ in range(self.num_partitions)]
        self._distribute_into_partitions(raw_data)

    def _distribute_into_partitions(self, data: List[Dict[str, Any]]) -> None:
        for idx, record in enumerate(data):
            key_str = str(record.get("key", idx))
            part_id = int(hashlib.md5(key_str.encode("utf-8")).hexdigest(), 16) % self.num_partitions
            self.partitions[part_id].append(record)

    def map_partitions(self, fn: Callable[[Dict[str, Any]], Dict[str, Any]]) -> "SparkStyleDistributedDataset":
        transformed: List[Dict[str, Any]] = []
        for part in self.partitions:
            for item in part:
                transformed.append(fn(item))
        return SparkStyleDistributedDataset(transformed, self.num_partitions)

    def filter_partitions(self, predicate: Callable[[Dict[str, Any]], bool]) -> "SparkStyleDistributedDataset":
        filtered: List[Dict[str, Any]] = []
        for part in self.partitions:
            for item in part:
                if predicate(item):
                    filtered.append(item)
        return SparkStyleDistributedDataset(filtered, self.num_partitions)

    def reduce_by_key(self, key_field: str, value_field: str) -> Dict[str, Any]:
        t0 = time.perf_counter_ns()
        partial_maps: List[Dict[str, float]] = []
        for part in self.partitions:
            local_agg: Dict[str, float] = {}
            for row in part:
                k = str(row.get(key_field, "UNKNOWN"))
                v = float(row.get(value_field, 0.0))
                local_agg[k] = local_agg.get(k, 0.0) + v
            partial_maps.append(local_agg)
        global_reduced: Dict[str, float] = {}
        for p_map in partial_maps:
            for k, v in p_map.items():
                global_reduced[k] = round(global_reduced.get(k, 0.0) + v, 4)
        elapsed_ms = round((time.perf_counter_ns() - t0) / 1_000_000, 3)
        return {
            "engine": "SPARK_RDD_PARTITION_SIMULATOR",
            "partitions_count": self.num_partitions,
            "partition_distribution": [len(p) for p in self.partitions],
            "reduced_output": global_reduced,
            "execution_time_ms": elapsed_ms,
        }


# ==============================================================================
# 2. MULTI-PROVIDER LLM ROUTER + GPU COST ORCHESTRATOR
# ==============================================================================
class MultiLLMAndGPUOrchestrator:
    def __init__(self):
        self.providers = {
            "CLOUDFLARE_EDGE_LLAMA": {"cost_per_1k": 0.0001, "max_vram_gb": 8, "healthy": True, "latency_ms": 18},
            "CLAUDE_3_5_SONNET": {"cost_per_1k": 0.0030, "max_vram_gb": 40, "healthy": True, "latency_ms": 45},
            "OPENAI_GPT_4O": {"cost_per_1k": 0.0050, "max_vram_gb": 80, "healthy": True, "latency_ms": 55},
        }
        self.gpu_nodes = [
            {"node_id": "GPU-NODE-A10G-01", "total_vram_gb": 24.0, "used_vram_gb": 8.0},
            {"node_id": "GPU-NODE-A100-02", "total_vram_gb": 80.0, "used_vram_gb": 20.0},
        ]

    def allocate_gpu_workload(self, required_vram_gb: float) -> Dict[str, Any]:
        best_node = None
        min_slack = float("inf")
        for node in self.gpu_nodes:
            available = node["total_vram_gb"] - node["used_vram_gb"]
            if available >= required_vram_gb and (available - required_vram_gb) < min_slack:
                min_slack = available - required_vram_gb
                best_node = node
        if not best_node:
            return {"allocated": False, "action": "SCALE_UP_KUBERNETES_GPU_POOL"}
        best_node["used_vram_gb"] = round(best_node["used_vram_gb"] + required_vram_gb, 2)
        utilization_pct = round((best_node["used_vram_gb"] / best_node["total_vram_gb"]) * 100.0, 1)
        return {
            "allocated": True,
            "assigned_node": best_node["node_id"],
            "node_utilization_pct": utilization_pct,
            "remaining_vram_gb": round(best_node["total_vram_gb"] - best_node["used_vram_gb"], 2),
        }

    def route_llm_request(self, prompt: str, complexity: str = "AUTO") -> Dict[str, Any]:
        est_tokens = max(1, len(prompt) // 4)
        if complexity == "AUTO":
            complexity = "HIGH" if len(prompt) > 120 or "architecture" in prompt.lower() else "LOW"
        if complexity == "LOW":
            fallback_chain = ["CLOUDFLARE_EDGE_LLAMA", "CLAUDE_3_5_SONNET", "OPENAI_GPT_4O"]
            vram_needed = 4.0
        else:
            fallback_chain = ["CLAUDE_3_5_SONNET", "OPENAI_GPT_4O", "CLOUDFLARE_EDGE_LLAMA"]
            vram_needed = 16.0
        selected_provider = None
        for prov_name in fallback_chain:
            if self.providers[prov_name]["healthy"]:
                selected_provider = prov_name
                break
        if not selected_provider:
            return {"status": "ALL_PROVIDERS_DOWN", "fallback": "DETERMINISTIC_C_ENGINE"}
        prov_info = self.providers[selected_provider]
        estimated_cost = round((est_tokens / 1000.0) * prov_info["cost_per_1k"], 6)
        gpu_schedule = self.allocate_gpu_workload(vram_needed)
        return {
            "routed_provider": selected_provider,
            "task_complexity": complexity,
            "estimated_tokens": est_tokens,
            "estimated_cost_usd": estimated_cost,
            "gpu_orchestration": gpu_schedule,
            "response_preview": f"[{selected_provider}]: Eksekusi berjaya dengan kos optimum (${estimated_cost}).",
        }


# ==============================================================================
# 3. VENDOR CODEBASE TECHNICAL AUDITOR (AST)
# ==============================================================================
class VendorCodebaseAuditor:
    @staticmethod
    def audit_vendor_python_code(source_code: str) -> Dict[str, Any]:
        issues: List[str] = []
        functions_found: List[Dict[str, Any]] = []
        classes_found: List[str] = []
        complexity_score = 1
        try:
            tree = ast.parse(source_code)
        except SyntaxError as e:
            return {"audit_status": "REJECTED_SYNTAX_ERROR", "error": str(e), "commercial_readiness": "NOT_READY"}

        for node in ast.walk(tree):
            if isinstance(node, (ast.If, ast.For, ast.While, ast.ExceptHandler, ast.With)):
                complexity_score += 1
            if isinstance(node, ast.ClassDef):
                classes_found.append(node.name)
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                has_doc = ast.get_docstring(node) is not None
                func_lines = getattr(node, "end_lineno", node.lineno) - node.lineno + 1
                functions_found.append({"name": node.name, "lines": func_lines, "documented": has_doc})
                if not has_doc:
                    issues.append(f"[DOC_GAP] Fungsi '{node.name}' tiada docstring untuk knowledge transfer.")
                if func_lines > 50:
                    issues.append(f"[MAINTAINABILITY] Fungsi '{node.name}' terlalu panjang ({func_lines} baris).")
            if isinstance(node, ast.ExceptHandler) and node.type is None:
                issues.append("[HIGH_RISK] Penggunaan 'except:' kosong — menyembunyikan ralat produksi.")
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
                if node.func.id in ("eval", "exec"):
                    issues.append(f"[CRITICAL_SECURITY] Panggilan '{node.func.id}()' tidak selamat.")

        readiness_score = max(0, 100 - (len(issues) * 15) - max(0, complexity_score - 10) * 2)
        verdict = "APPROVED_FOR_OWNERSHIP" if readiness_score >= 75 else "REQUIRES_REFACTORING_BEFORE_HANDOVER"
        return {
            "audit_verdict": verdict,
            "commercial_readiness_score": readiness_score,
            "cyclomatic_complexity": complexity_score,
            "classes_discovered": classes_found,
            "functions_audited": functions_found,
            "technical_debt_findings": issues or ["Tiada hutang teknikal kritikal dikesan."],
        }


# ==============================================================================
# 4. CROSS-STACK AI SYSTEMS DEBUGGER
# ==============================================================================
class CrossStackAIDebugger:
    @staticmethod
    def diagnose_production_incident(telemetry: Dict[str, Any]) -> Dict[str, Any]:
        api_latency_ms = float(telemetry.get("api_latency_ms", 0.0))
        db_pool_exhausted = bool(telemetry.get("db_pool_exhausted", False))
        http_status = int(telemetry.get("http_status", 200))
        llm_output = str(telemetry.get("llm_raw_output", ""))
        expected_json_keys = telemetry.get("expected_json_keys", [])

        if db_pool_exhausted or http_status in (502, 503, 504) or api_latency_ms > 3000.0:
            return {
                "fault_layer": "LAYER_1_INFRASTRUCTURE_OR_NETWORK",
                "root_cause": f"Kependaman melampau ({api_latency_ms}ms) atau HTTP {http_status} / DB Pool penuh.",
                "automated_remediation": "Aktifkan Circuit Breaker, tambah replika pod K8s (HPA), guna cache Redis.",
            }
        try:
            parsed = json.loads(llm_output)
            missing_keys = [k for k in expected_json_keys if k not in parsed]
            if missing_keys:
                return {
                    "fault_layer": "LAYER_3_LLM_SCHEMA_DRIFT",
                    "root_cause": f"LLM memulangkan JSON sah tetapi tertinggal kunci wajib: {missing_keys}",
                    "automated_remediation": "Paksa Pydantic Structured Output / Grammar-Constrained Decoding + Retry Prompt.",
                }
        except json.JSONDecodeError:
            return {
                "fault_layer": "LAYER_3_LLM_REASONING_AND_FORMAT_FAILURE",
                "root_cause": "LLM gagal mematuhi struktur JSON (halusinasi teks bebas).",
                "automated_remediation": "Strip blok Markdown automatik atau beralih ke model deterministik.",
            }
        return {
            "fault_layer": "NONE_STACK_HEALTHY",
            "root_cause": "Semua lapisan beroperasi dalam SLA.",
            "automated_remediation": "Tiada tindakan diperlukan.",
        }


# ==============================================================================
# INTEGRATION TEST
# ==============================================================================
if __name__ == "__main__":
    print("=== GRIMOIRE V2: SPARK, MULTI-LLM GPU, VENDOR AUDIT & DEBUGGER ===\n")

    raw_call_logs = [
        {"key": "KL_NODE", "call_volume": 120},
        {"key": "PJ_NODE", "call_volume": 85},
        {"key": "KL_NODE", "call_volume": 230},
        {"key": "BANGSAR_NODE", "call_volume": 190},
        {"key": "PJ_NODE", "call_volume": -10},
    ]
    rdd = SparkStyleDistributedDataset(raw_call_logs, num_partitions=3)
    spark_res = (
        rdd.filter_partitions(lambda r: r["call_volume"] > 0)
           .map_partitions(lambda r: {"key": r["key"], "weighted_load": r["call_volume"] * 1.05})
           .reduce_by_key("key", "weighted_load")
    )
    print("[1. DISTRIBUTED SPARK MAP-REDUCE]:\n", json.dumps(spark_res, indent=2))

    orchestrator = MultiLLMAndGPUOrchestrator()
    route_res = orchestrator.route_llm_request(
        "Design a high-availability enterprise IVA architecture connecting CRM and ticketing systems."
    )
    print("\n[2. MULTI-LLM ROUTER & GPU ORCHESTRATOR]:\n", json.dumps(route_res, indent=2))

    sample_vendor_code = """
class VendorIVAController:
    def process_call(self, data):
        try:
            res = eval(data)
            return res
        except:
            return None
"""
    audit_res = VendorCodebaseAuditor.audit_vendor_python_code(sample_vendor_code)
    print("\n[3. VENDOR CODEBASE AUDIT]:\n", json.dumps(audit_res, indent=2))

    incident_telemetry = {
        "api_latency_ms": 145.0,
        "db_pool_exhausted": False,
        "http_status": 200,
        "llm_raw_output": '{"action": "CREATE_TICKET"}',
        "expected_json_keys": ["action", "ticket_priority", "customer_id"],
    }
    debug_res = CrossStackAIDebugger.diagnose_production_incident(incident_telemetry)
    print("\n[4. CROSS-STACK AI DEBUGGER]:\n", json.dumps(debug_res, indent=2))
