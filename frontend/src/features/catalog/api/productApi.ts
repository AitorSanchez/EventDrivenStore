// src/features/catalog/api/productApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// Network adapter for the Catalog feature.
// Uses the shared httpClient and maps raw API responses to domain types.
// ─────────────────────────────────────────────────────────────────────────────

import { httpClient } from '../../../shared/api/httpClient';
import { Product } from '../domain/types';

interface ProductApiResponse {
  _id: string;
  name: string;
  description: string;
  price: number;
  availableStock?: number;
  reservedStock?: number;
}

export const productApi = {
  async fetchAll(): Promise<Product[]> {
    const data = await httpClient.get<ProductApiResponse[]>('/products');

    return data.map((p) => ({
      _id: p._id,
      name: p.name,
      description: p.description,
      price: p.price,
      availableStock: p.availableStock ?? 0,
    }));
  },
};
