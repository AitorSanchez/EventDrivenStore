// src/features/catalog/domain/types.ts
// ─────────────────────────────────────────────────────────────────────────────
// Domain types for the Catalog feature.
// These interfaces represent the business entities consumed by hooks and
// rendered by components — they are framework-agnostic and free of React or
// HTTP concerns.
// ─────────────────────────────────────────────────────────────────────────────

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  availableStock: number;
}
