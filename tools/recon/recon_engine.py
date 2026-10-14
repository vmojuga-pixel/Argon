"""NEXUS RECON-X — Lightweight Reverse Engineering Engine (FastAPI)"""
import ast, json, re, time, urllib.request
from typing import Dict, List, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="NEXUS RECON-X", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class ReconRequest(BaseModel):
    target_type: str = Field(..., pattern="^(CODE_SNIPPET|HAR_TRAFFIC|LIVE_URL)$")
    payload: str = Field(..., min_length=3)

class ReconReport(BaseModel):
    execution_time_ms: float
    detected_stack: List[str]
    extracted_endpoints: List[Dict[str, str]]
    extracted_secrets_or_keys: List[str]
    inferred_db_schema: str
    decompiled_clean_code: str
    openapi_spec: Dict[str, Any]
    security_weaknesses: List[str]

class UltraLightReverseEngineer:
    REGEX_ENDPOINTS = re.compile(r'["\']((?:https?://[^"\']+)?/(?:api|v[1-9]|auth|user|admin|graphql|webhook|internal)[a-zA-Z0-9_\-/{}/]*)["\']', re.IGNORECASE)
    REGEX_METHODS = re.compile(r'\b(GET|POST|PUT|DELETE|PATCH|OPTIONS)\b', re.IGNORECASE)
    REGEX_SECRETS = re.compile(r'(?:api[_-]?key|secret|token|authorization|bearer|password|aws_access)\s*[:=]\s*["\']([a-zA-Z0-9_\-\.=]{8,})["\']', re.IGNORECASE)
    REGEX_SQL_FIELDS = re.compile(r'["\']([a-zA-Z_][a-zA-Z0-9_]*_id|email|username|password_hash|created_at|amount|status|role|token|balance)["\']', re.IGNORECASE)

    @classmethod
    def analyze_payload(cls, target_type: str, raw_payload: str) -> ReconReport:
        start_ns = time.perf_counter_ns()
        content = raw_payload
        detected_stack = ["Unknown/Generic"]
        if target_type == "LIVE_URL" and raw_payload.startswith("http"):
            try:
                req = urllib.request.Request(raw_payload, headers={"User-Agent": "Mozilla/5.0 (ReconX-FastScanner)"})
                with urllib.request.urlopen(req, timeout=4) as response:
                    headers = dict(response.info())
                    content = response.read().decode("utf-8", errors="ignore")
                    detected_stack = cls._fingerprint_headers(headers, content)
            except Exception as e:
                content = f"// Gagal ({str(e)}). Analisis string URL sahaja.\n{raw_payload}"
        else:
            detected_stack = cls._fingerprint_code(content)

        raw_paths = set(cls.REGEX_ENDPOINTS.findall(content))
        methods_found = cls.REGEX_METHODS.findall(content)
        default_method = methods_found[0].upper() if methods_found else "POST"
        extracted_endpoints = []
        for path in sorted(raw_paths):
            method = "GET" if any(k in path.lower() for k in ["list", "get", "profile", "status"]) else default_method
            extracted_endpoints.append({"method": method, "endpoint": path, "auth_required": "Yes (Inferred)"})
        if not extracted_endpoints:
            extracted_endpoints.append({"method": "POST", "endpoint": "/api/v1/inferred-action", "auth_required": "Unknown"})

        secrets = list(set(cls.REGEX_SECRETS.findall(content)))
        fields = sorted(list(set(f.lower() for f in cls.REGEX_SQL_FIELDS.findall(content))))
        if not fields: fields = ["id", "user_id", "payload_data", "status", "created_at"]
        inferred_db_schema = cls._reconstruct_sql_schema(fields)
        decompiled_code = cls._reconstruct_clean_code(extracted_endpoints, fields)
        openapi_spec = cls._generate_openapi(extracted_endpoints, fields)
        weaknesses = cls._audit_weaknesses(content, secrets, extracted_endpoints)
        elapsed_ms = round((time.perf_counter_ns() - start_ns) / 1_000_000, 3)
        return ReconReport(execution_time_ms=elapsed_ms, detected_stack=detected_stack,
            extracted_endpoints=extracted_endpoints, extracted_secrets_or_keys=secrets,
            inferred_db_schema=inferred_db_schema, decompiled_clean_code=decompiled_code,
            openapi_spec=openapi_spec, security_weaknesses=weaknesses)

    @staticmethod
    def _fingerprint_headers(headers: Dict[str, str], body: str) -> List[str]:
        stack = []
        server = headers.get("Server", headers.get("server", ""))
        powered = headers.get("X-Powered-By", headers.get("x-powered-by", ""))
        if server: stack.append(f"Server: {server}")
        if powered: stack.append(f"Runtime: {powered}")
        if "__NEXT_DATA__" in body: stack.append("Frontend: Next.js")
        if "wp-content" in body: stack.append("CMS: WordPress")
        if "cloudflare" in server.lower(): stack.append("WAF/Edge: Cloudflare")
        return stack or ["Custom HTTP Service"]

    @staticmethod
    def _fingerprint_code(code: str) -> List[str]:
        stack = []
        if "webpackChunk" in code or "__webpack_require__" in code: stack.append("Bundler: Webpack")
        if "fetch(" in code or "axios" in code: stack.append("Client: REST/AJAX")
        if "def " in code or "import " in code: stack.append("Language: Python")
        if "Bearer " in code or "jwt" in code.lower(): stack.append("Auth: JWT")
        return stack or ["Obfuscated / Raw Logic"]

    @staticmethod
    def _reconstruct_sql_schema(fields: List[str]) -> str:
        lines = ["-- SKEMA PANGKALAN DATA (RECONSTRUCTED DDL)", "CREATE TABLE reconstructed_core_entity (",
                 "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),"]
        for f in fields:
            if f == "id": continue
            dtype = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" if "at" in f else \
                    "NUMERIC(12,2)" if f in ["amount", "balance"] else \
                    "UUID NOT NULL" if f.endswith("_id") else "VARCHAR(255)"
            lines.append(f"    {f} {dtype},")
        lines[-1] = lines[-1].rstrip(",")
        lines.append(");")
        return "\n".join(lines)

    @staticmethod
    def _reconstruct_clean_code(endpoints: List[Dict[str, str]], fields: List[str]) -> str:
        code = ["# CLEAN-ROOM RECONSTRUCTED BACKEND", "from fastapi import FastAPI, Header, HTTPException",
                "from pydantic import BaseModel", "from typing import Optional\n",
                "app = FastAPI(title='Reconstructed Target System')\n",
                "class ReconstructedPayload(BaseModel):"]
        for f in fields: code.append(f"    {f}: Optional[str] = None")
        code.append("\n# Laluan API yang diekstrak:")
        for idx, ep in enumerate(endpoints):
            m = ep["method"].lower()
            clean_path = ep["endpoint"] if ep["endpoint"].startswith("/") else f"/{ep['endpoint']}"
            fn = re.sub(r'[^a-zA-Z0-9_]', '_', clean_path.strip('/')) or f"endpoint_{idx}"
            code.append(f"\n@app.{m}('{clean_path}')")
            code.append(f"async def handle_{fn}(payload: Optional[ReconstructedPayload] = None, authorization: Optional[str] = Header(None)):")
            code.append("    if not authorization:")
            code.append("        raise HTTPException(status_code=401, detail='Missing Auth Token')")
            code.append(f"    return {{'status': 'RECONSTRUCTED_OK', 'endpoint': '{clean_path}'}}")
        return "\n".join(code)

    @staticmethod
    def _generate_openapi(endpoints: List[Dict[str, str]], fields: List[str]) -> Dict[str, Any]:
        paths = {}
        for ep in endpoints:
            paths[ep["endpoint"]] = {ep["method"].lower(): {"summary": f"Reconstructed {ep['method']}",
                "security": [{"BearerAuth": []}], "responses": {"200": {"description": "OK"}}}}
        return {"openapi": "3.0.3", "info": {"title": "Reverse Engineered API Spec", "version": "1.0.0"},
            "paths": paths, "components": {"schemas": {"Entity": {"type": "object",
            "properties": {f: {"type": "string"} for f in fields}}}}}

    @staticmethod
    def _audit_weaknesses(content: str, secrets: List[str], endpoints: List[Dict[str, str]]) -> List[str]:
        issues = []
        if secrets: issues.append(f"[CRITICAL] {len(secrets)} Kunci Rahsia didapati tertanam (Hardcoded Secrets).")
        if "eval(" in content or "Function(" in content: issues.append("[HIGH] Penggunaan eval() dikesan — risiko XSS.")
        if any("admin" in ep["endpoint"].lower() or "internal" in ep["endpoint"].lower() for ep in endpoints):
            issues.append("[MEDIUM] Laluan /admin atau /internal terdedah (Information Disclosure).")
        if not issues: issues.append("[INFO] Tiada kebocoran kritikal dikesan.")
        return issues

@app.post("/api/v1/recon", response_model=ReconReport)
async def execute_recon(req: ReconRequest):
    return UltraLightReverseEngineer.analyze_payload(req.target_type, req.payload)
