import type { Problem, ProblemFieldError } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface ApiError {
  message: string;
  status: number;
  title?: string;
  detail?: string;
  errors?: ProblemFieldError[];
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string; cartSession?: string } = {}
): Promise<T> {
  const { token, cartSession, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (cartSession) headers.set("X-Cart-Session", cartSession);

  let url = `${API_URL}${path}`;
  if (API_URL.endsWith("/api/v1") && path.startsWith("/api/v1")) {
    url = `${API_URL}${path.substring(7)}`;
  }
  const res = await fetch(url, { ...fetchOptions, headers, cache: "no-store" });


  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    const isProblem = contentType.includes("application/problem+json");
    const body = await res.json().catch(() => ({} as Record<string, unknown>));

    if (isProblem) {
      const problem = body as Problem;
      const message = problem.detail ?? problem.title ?? res.statusText;
      throw {
        message,
        status: res.status,
        title: problem.title,
        detail: problem.detail,
        errors: problem.errors,
      } satisfies ApiError;
    }

    const fallback = body as { message?: string };
    throw {
      message: fallback.message ?? res.statusText,
      status: res.status,
    } satisfies ApiError;
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function formatPrice(value: number | string) {
  const numeric = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(numeric);
}
