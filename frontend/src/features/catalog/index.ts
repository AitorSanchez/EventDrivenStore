// src/features/catalog/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// Public API of the Catalog feature.
// External consumers (e.g. App.tsx) should ONLY import from this barrel file,
// never reach into internal sub-folders directly.
// ─────────────────────────────────────────────────────────────────────────────

export { default as CatalogList } from './components/CatalogList';
export type { Product } from './domain/types';
