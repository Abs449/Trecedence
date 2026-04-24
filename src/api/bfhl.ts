import type { BFHLRequest, BFHLResponse } from "../types/bfhl";

// In dev: Vite proxy forwards /bfhl → http://localhost:3001/bfhl
// In prod: set VITE_API_URL to your deployed API base (e.g. https://your-api.onrender.com)
const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function postBFHL(data: string[]): Promise<BFHLResponse> {
  const body: BFHLRequest = { data };
  
  // Clean up any accidental trailing slashes in the env variable
  const baseUrl = API_BASE.replace(/\/+$/, "");

  const response = await fetch(`${baseUrl}/bfhl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  return response.json() as Promise<BFHLResponse>;
}
