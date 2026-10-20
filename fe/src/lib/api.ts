const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3100/api";

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
  operationKey?: string;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, operationKey } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (operationKey) headers["Idempotency-Key"] = operationKey;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Xử lý response rỗng (204 No Content, hoặc body không phải JSON)
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => ({}))
    : {};

  if (!res.ok) {
    throw { status: res.status, ...data };
  }

  return data as T;
}

export const api = {
  get:   <T>(url: string, token?: string) => request<T>(url, { token }),
  post:  <T>(url: string, body: unknown, token?: string, operationKey?: string) => request<T>(url, { method: "POST", body, token, operationKey }),
  patch: <T>(url: string, body: unknown, token?: string) => request<T>(url, { method: "PATCH", body, token }),
  del:   <T>(url: string, body?: unknown, token?: string) => request<T>(url, { method: "DELETE", body, token }),
};
