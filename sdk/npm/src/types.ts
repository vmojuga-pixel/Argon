export interface ArgonOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface ChatRequest {
  session_id?: string;
  message: string;
  history?: Array<{ role: string; content: string }>;
}

export interface ChatResponse {
  session_id: string;
  reply: string;
  model: string;
}

export interface AgentRequest {
  session_id?: string;
  message: string;
}

export interface AgentResponse {
  session_id: string;
  reply: string;
  trace: Array<{ step: number; tool: string; args: Record<string, unknown>; result: unknown }>;
}

export interface SwarmState {
  epoch: number;
  history: Array<Record<string, unknown>>;
}

export interface OmniExecuteRequest {
  targetRepo: string;
  branch?: string;
  slug?: string;
  directive: string;
}

export interface OmniProject {
  appSlug: string;
  targetRepo: string;
  branch: string;
  directive: string;
  gitCommit: { committed: boolean; mode: string; commitSha?: string };
  deployment: { deployed: boolean; mode: string; liveUrl?: string };
  generatedFiles: string[];
}
