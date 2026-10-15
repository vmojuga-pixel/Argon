import type {
  ArgonOptions, ChatRequest, ChatResponse, AgentRequest, AgentResponse,
  SwarmState, OmniExecuteRequest, OmniProject,
} from './types';

const DEFAULT_BASE = 'https://argon.vmojuga.workers.dev';

export class Argon {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  readonly chat: ChatResource;
  readonly agent: AgentResource;
  readonly swarm: SwarmResource;
  readonly omni: OmniResource;

  constructor(opts: ArgonOptions) {
    if (!opts.apiKey) throw new Error('apiKey required');
    this.apiKey = opts.apiKey;
    this.baseUrl = (opts.baseUrl || DEFAULT_BASE).replace(/\/$/, '');
    this.timeout = opts.timeout ?? 60_000;

    this.chat = new ChatResource(this);
    this.agent = new AgentResource(this);
    this.swarm = new SwarmResource(this);
    this.omni = new OmniResource(this);
  }

  async _fetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeout);
    try {
      const res = await fetch(this.baseUrl + path, {
        ...init,
        signal: ctrl.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
          ...(init.headers || {}),
        },
      });
      const text = await res.text();
      let data: unknown;
      try { data = JSON.parse(text); } catch { data = text; }
      if (!res.ok) {
        const msg = typeof data === 'object' && data && 'error' in data ? (data as { error: string }).error : `HTTP ${res.status}`;
        throw new Error(`Argon API error: ${msg}`);
      }
      return data as T;
    } finally {
      clearTimeout(timer);
    }
  }

  async me(): Promise<Record<string, unknown>> {
    return this._fetch('/api/me');
  }

  async health(): Promise<Record<string, unknown>> {
    return this._fetch('/api/health');
  }
}

class ChatResource {
  constructor(private client: Argon) {}
  async send(req: ChatRequest): Promise<ChatResponse> {
    return this.client._fetch('/api/chat', { method: 'POST', body: JSON.stringify(req) });
  }
}

class AgentResource {
  constructor(private client: Argon) {}
  async run(req: AgentRequest): Promise<AgentResponse> {
    return this.client._fetch('/api/agent', { method: 'POST', body: JSON.stringify(req) });
  }
}

class SwarmResource {
  constructor(private client: Argon) {}
  async state(): Promise<SwarmState> {
    return this.client._fetch('/swarm/state');
  }
  async evolve(topic?: string): Promise<Record<string, unknown>> {
    return this.client._fetch('/swarm/evolve', { method: 'POST', body: JSON.stringify({ topic: topic || null }) });
  }
}

class OmniResource {
  constructor(private client: Argon) {}
  async execute(req: OmniExecuteRequest): Promise<OmniProject> {
    return this.client._fetch('/omni/execute', { method: 'POST', body: JSON.stringify(req) });
  }
  async report(): Promise<Record<string, unknown>> {
    return this.client._fetch('/omni/report');
  }
  async scanRepo(targetRepo: string, branch = 'main'): Promise<Record<string, unknown>> {
    return this.client._fetch('/omni/scan-repo', { method: 'POST', body: JSON.stringify({ targetRepo, branch }) });
  }
}
