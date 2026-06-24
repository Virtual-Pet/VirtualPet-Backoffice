import { createLogger } from "@/lib/logger";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const log = createLogger("sse");

const INITIAL_RETRY_MS = 1000;
const MAX_RETRY_MS = 30000;
// A connection must stay open at least this long to count as "healthy" and earn
// a fast reconnect. Shorter-lived connections back off, so a backend that closes
// immediately is retried with growing delay instead of hammered every second.
const HEALTHY_MS = 3000;

export interface SseMessage {
  /** The SSE `event:` name; defaults to "message" when absent. */
  event: string;
  /** The raw `data:` payload (lines joined by "\n"). */
  data: string;
}

export interface SseOptions {
  token?: string;
  onMessage: (message: SseMessage) => void;
  /** Fired each time the transport (re)connects successfully. */
  onOpen?: () => void;
  /** Fired when the connection drops; the client will retry afterwards. */
  onError?: (err: unknown) => void;
}

function resolveUrl(path: string): string {
  // Mirror the /api/v1 de-duplication that api.ts performs.
  if (API_URL.endsWith("/api/v1") && path.startsWith("/api/v1")) {
    return `${API_URL}${path.substring(7)}`;
  }
  return `${API_URL}${path}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const FRAME_SEPARATOR = /\r\n\r\n|\r\r|\n\n/;
const LINE_SEPARATOR = /\r\n|\r|\n/;

function parseFrame(frame: string): SseMessage | null {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of frame.split(LINE_SEPARATOR)) {
    if (line === "" || line.startsWith(":")) continue; // blank or comment
    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).replace(/^ /, ""));
    }
  }
  if (dataLines.length === 0) return null;
  return { event, data: dataLines.join("\n") };
}

/**
 * Minimal Server-Sent Events client built on fetch + ReadableStream.
 *
 * Unlike the native EventSource API, this supports an Authorization header,
 * which the backend requires. It reconnects automatically with exponential
 * backoff until the returned close() function is called.
 */
export function openSse(path: string, options: SseOptions): () => void {
  const controller = new AbortController();
  let closed = false;
  let retryDelay = INITIAL_RETRY_MS;

  async function readStream(body: ReadableStream<Uint8Array>): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (!closed) {
      const { value, done } = await reader.read();
      if (done) return; // server closed (e.g. 5-min timeout) → reconnect
      buffer += decoder.decode(value, { stream: true });
      let match: RegExpExecArray | null;
      while ((match = FRAME_SEPARATOR.exec(buffer)) !== null) {
        const frame = buffer.slice(0, match.index);
        buffer = buffer.slice(match.index + match[0].length);
        const parsed = parseFrame(frame);
        if (parsed) options.onMessage(parsed);
      }
    }
  }

  async function run(): Promise<void> {
    while (!closed) {
      let healthy = false;
      try {
        const headers = new Headers({ Accept: "text/event-stream" });
        if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
        const res = await fetch(resolveUrl(path), {
          method: "GET",
          headers,
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok || !res.body) {
          throw new Error(`SSE handshake failed with status ${res.status}`);
        }
        const openedAt = Date.now();
        options.onOpen?.();
        await readStream(res.body); // resolves on a clean server close (e.g. timeout)
        healthy = Date.now() - openedAt >= HEALTHY_MS;
      } catch (err) {
        if (closed || controller.signal.aborted) return;
        log.warn(`stream dropped, retrying in ${retryDelay}ms`, err);
        options.onError?.(err);
      }
      if (closed) return;
      if (healthy) retryDelay = INITIAL_RETRY_MS; // good run → reconnect quickly
      await sleep(retryDelay);
      if (!healthy) retryDelay = Math.min(retryDelay * 2, MAX_RETRY_MS);
    }
  }

  run();

  return () => {
    closed = true;
    controller.abort();
  };
}
