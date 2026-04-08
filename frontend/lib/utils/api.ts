const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  isFormData?: boolean;
};

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, token, isFormData = false } = options;

  const headers: Record<string, string> = {};

  if (token != null) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (body && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isFormData
      ? (body as FormData)
      : body
      ? JSON.stringify(body)
      : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
}

export async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  // getSession reads from storage; refreshSession ensures the token is valid
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) return session.access_token;
  // Fall back to refreshing the session
  const { data: refreshed } = await supabase.auth.refreshSession();
  return refreshed.session?.access_token ?? null;
}
