import { supabase } from "../lib/supabase";
import { API_BASE } from "./api";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No hay una sesión activa");
  }

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");
  headers.set(
    "Authorization",
    `Bearer ${session.access_token}`
  );

  return fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
}
