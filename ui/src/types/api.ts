export interface CounterSnapshot {
  http_count: number;
  http_last_message: string | null;
  local_count: number;
  local_last_message: string | null;
  remote_count: number;
  remote_last_message: string | null;
}

export interface ApiError extends Error {
  details?: unknown;
}

type GeneratedModule = {
  ApiError: new (message: string, details?: unknown) => ApiError;
  get_counters: (request_body: string) => Promise<CounterSnapshot>;
  ping_http: (request_body: string) => Promise<CounterSnapshot>;
  send_message: (request_body: string) => Promise<CounterSnapshot>;
};

let generatedModule: Promise<GeneratedModule> | null = null;

async function loadGenerated(): Promise<GeneratedModule> {
  if (!generatedModule) {
    generatedModule = import('#caller-utils').then((module) => module as unknown as GeneratedModule);
  }
  return generatedModule;
}

export async function get_counters(request_body: string): Promise<CounterSnapshot> {
  const api = await loadGenerated();
  return api.get_counters(request_body);
}

export async function ping_http(request_body: string): Promise<CounterSnapshot> {
  const api = await loadGenerated();
  return api.ping_http(request_body);
}

export async function send_message(request_body: string): Promise<CounterSnapshot> {
  const api = await loadGenerated();
  return api.send_message(request_body);
}
