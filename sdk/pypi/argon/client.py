"""Argon Python SDK — chat, agent, swarm, omni."""
from typing import Any, Dict, List, Optional

import httpx

DEFAULT_BASE = "https://argon.vmojuga.workers.dev"


class ArgonError(Exception):
    pass


class Argon:
    def __init__(self, api_key: str, base_url: str = DEFAULT_BASE, timeout: float = 60.0):
        if not api_key:
            raise ValueError("api_key required")
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self._client = httpx.Client(
            base_url=self.base_url,
            headers={"X-API-Key": api_key, "Content-Type": "application/json"},
            timeout=timeout,
        )
        self.chat = ChatResource(self)
        self.agent = AgentResource(self)
        self.swarm = SwarmResource(self)
        self.omni = OmniResource(self)

    def _request(self, method: str, path: str, json_body: Optional[Dict] = None) -> Any:
        res = self._client.request(method, path, json=json_body)
        try:
            data = res.json()
        except Exception:
            data = res.text
        if res.status_code >= 400:
            msg = data.get("error") if isinstance(data, dict) else f"HTTP {res.status_code}"
            raise ArgonError(f"Argon API error: {msg}")
        return data

    def me(self) -> Dict[str, Any]:
        return self._request("GET", "/api/me")

    def health(self) -> Dict[str, Any]:
        return self._request("GET", "/api/health")

    def close(self) -> None:
        self._client.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()


class ChatResource:
    def __init__(self, client: Argon):
        self._c = client

    def send(self, message: str, session_id: Optional[str] = None,
             history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        body: Dict[str, Any] = {"message": message}
        if session_id:
            body["session_id"] = session_id
        if history:
            body["history"] = history
        return self._c._request("POST", "/api/chat", body)


class AgentResource:
    def __init__(self, client: Argon):
        self._c = client

    def run(self, message: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        body: Dict[str, Any] = {"message": message}
        if session_id:
            body["session_id"] = session_id
        return self._c._request("POST", "/api/agent", body)


class SwarmResource:
    def __init__(self, client: Argon):
        self._c = client

    def state(self) -> Dict[str, Any]:
        return self._c._request("GET", "/swarm/state")

    def evolve(self, topic: Optional[str] = None) -> Dict[str, Any]:
        return self._c._request("POST", "/swarm/evolve", {"topic": topic})


class OmniResource:
    def __init__(self, client: Argon):
        self._c = client

    def execute(self, target_repo: str, directive: str,
                branch: str = "main", slug: Optional[str] = None) -> Dict[str, Any]:
        body = {"targetRepo": target_repo, "branch": branch, "directive": directive}
        if slug:
            body["slug"] = slug
        return self._c._request("POST", "/omni/execute", body)

    def report(self) -> Dict[str, Any]:
        return self._c._request("GET", "/omni/report")

    def scan_repo(self, target_repo: str, branch: str = "main") -> Dict[str, Any]:
        return self._c._request("POST", "/omni/scan-repo", {"targetRepo": target_repo, "branch": branch})
