# ARGON — BLUEPRINT (Part 7: Tools)

## C++ Native Expert Engine
- Lokasi: tools/native/nexus_core.cpp
- Saiz binary: <50 KB
- Kelajuan: mikrosaat (<1ms)
- Zero dependency: C++17 standard library
- Compile: g++ -O3 -std=c++17 nexus_core.cpp -o nexus_core
- Run: ./nexus_core
- Output: GeneratedModule.hpp, financial report, Docker config

## Python Recon Engine
- Lokasi: tools/recon/recon_engine.py
- Stack: FastAPI + pydantic
- Fungsi: AST + regex decompiler, endpoint extraction, SQL reconstruction, OpenAPI
- Run: uvicorn recon_engine:app --host 127.0.0.1 --port 8001
- Endpoint: POST /api/v1/recon

## CF Worker Recon
- Lokasi: src/tools/recon.js
- Port JS dari Python engine (regex sahaja, no urllib/ast)
- Route: GET /recon (Basic Auth), POST /api/recon (X-API-Key)
- Speed: sub-5ms (V8)

## Cara guna
    # UI browser
    https://argon.vmojuga.workers.dev/recon

    # API
    curl -X POST https://argon.vmojuga.workers.dev/api/recon \
      -H "X-API-Key: $(cat /root/.argon-secrets/tenant.key)" \
      -H "Content-Type: application/json" \
      -d '{"target_type":"CODE_SNIPPET","payload":"fetch(\"/api/v2/auth/login\")"}'

## LLM vs Native C++
| Aspek | LLM | C++ Native |
|:---|:---|:---|
| RAM | GB | <2 MB |
| Latency | 1-5s | <1ms |
| Accuracy | Halusinasi | 100% deterministik |
| Kos | $/token | Sifar |

## Industrial RE tools
| Target | Tool |
|:---|:---|
| Binari C/Rust/Go | Radare2 / Rizin |
| Android APK | JADX + Frida |
| Web/API | mitmproxy |
| JS frontend | webcrack / Babel AST |
