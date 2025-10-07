declare module '#caller-utils' {
  export class ApiError extends Error {
    details?: unknown;
  }

  export interface CounterSnapshot {
    http_count: number;
    http_last_message: string | null;
    local_count: number;
    local_last_message: string | null;
    remote_count: number;
    remote_last_message: string | null;
  }

  export function get_counters(request_body: string): Promise<CounterSnapshot>;
  export function ping_http(request_body: string): Promise<CounterSnapshot>;
}
