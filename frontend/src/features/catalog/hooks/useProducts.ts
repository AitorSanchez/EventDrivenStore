// src/features/catalog/hooks/useProducts.ts
// ─────────────────────────────────────────────────────────────────────────────
// Custom hook encapsulating all catalog data-fetching logic.
// Components that consume this hook receive clean, typed state — they never
// interact with fetch, HTTP, or the API layer directly.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { productApi } from '../api/productApi';
import { Product } from '../domain/types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await productApi.fetchAll();
        if (!cancelled) setProducts(data);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load products');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading, error };
};
