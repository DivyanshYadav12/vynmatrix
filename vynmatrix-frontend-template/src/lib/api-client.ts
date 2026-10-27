/**
 * API client for Vynmatrix backend
 * Handles authentication, error handling, and typed requests
 */

import type { OverviewData, VersionData, ControlData, StrategiesData, PnLData, FillsData } from "./types";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

/**
 * Get admin key from sessionStorage (stored only in the browser tab)
 */
function getAdminKey(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("adminKey");
}

/**
 * Set admin key in sessionStorage
 */
export function setAdminKey(key: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("adminKey", key);
}

/**
 * Clear admin key from sessionStorage
 */
export function clearAdminKey(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("adminKey");
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAdminKey() !== null;
}

/**
 * Fetch wrapper with admin key authentication
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  // Add admin key from sessionStorage
  const adminKey = getAdminKey();
  if (adminKey) {
    headers.set("X-Admin-Key", adminKey);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text().catch(() => "Unknown error");
    throw new ApiError(response.status, error);
  }

  return response.json() as Promise<T>;
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * API client methods organized by resource
 */
export const api = {
  // Owner UI API endpoints
  overview: () => apiRequest<OverviewData>("/ui/overview"),
  version: () => apiRequest<VersionData>("/ui/version"),
  control: () => apiRequest<ControlData>("/ui/control"),
  strategies: () => apiRequest<StrategiesData>("/ui/strategies"),
  pnl: (days: number = 90) => apiRequest<PnLData>(`/ui/pnl?days=${days}`),
  fills: (limit: number = 50, before?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (before) params.append("before", before);
    return apiRequest<FillsData>(`/ui/fills?${params.toString()}`);
  },

  // Binding control (UI-specific)
  createBinding: (data: { strategy_id: string; broker_account_id: number; mode: string }) =>
    apiRequest<unknown>("/ui/bindings", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateBinding: (bindingId: number, data: { expected: unknown; changes: unknown }) =>
    apiRequest<unknown>(`/ui/bindings/${bindingId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Admin API endpoints (to be used selectively)
  owner: () => apiRequest<unknown>("/owner"),
  updateOwner: (data: { expected: unknown; changes: unknown }) =>
    apiRequest<unknown>("/owner", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  brokerAccounts: () => apiRequest<unknown>("/broker-accounts"),
  onboardBrokerAccount: (data: unknown) =>
    apiRequest<unknown>("/broker-accounts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateBrokerAccount: (accountId: number, data: { expected: unknown; changes: unknown }) =>
    apiRequest<unknown>(`/broker-accounts/${accountId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  rotateCredentials: (accountId: number, data: unknown) =>
    apiRequest<unknown>(`/broker-accounts/${accountId}/credentials`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  strategyConfigs: () => apiRequest<unknown>("/strategy-configs"),
  upsertStrategyConfig: (strategyId: string, data: unknown) =>
    apiRequest<unknown>(`/strategy-configs/${strategyId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deactivateStrategyConfig: (strategyId: string) =>
    apiRequest<unknown>(`/strategy-configs/${strategyId}`, {
      method: "DELETE",
    }),
  drawdownMandates: () => apiRequest<unknown>("/risk-mandates/drawdown"),
  upsertDrawdownMandate: (data: { max_drawdown_pct: string }) =>
    apiRequest<unknown>("/risk-mandates/drawdown", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export default api;
