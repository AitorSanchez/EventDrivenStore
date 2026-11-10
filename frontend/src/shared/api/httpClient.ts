// src/shared/api/httpClient.ts
// ─────────────────────────────────────────────────────────────────────────────
// Global HTTP client configuration.
// All feature-level API adapters should import and use this client instead of
// calling fetch() directly, so that base URL, headers, and error handling are
// centralised in a single place.
// ─────────────────────────────────────────────────────────────────────────────
import { getEnv } from '../config/env';

const API_BASE = getEnv('VITE_API_URL', 'http://localhost:3000');

/**
 * Thin wrapper around the native `fetch` API.
 * Adds the base URL, default headers, and standard error handling.
 */
export const httpClient = {
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`GET ${path} failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  },

  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`POST ${path} failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  },
};
