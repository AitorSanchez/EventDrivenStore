// src/features/catalog/components/CatalogList.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Top-level catalog view that composes the feature's hook and card component.
// Contains ZERO business logic — it only orchestrates loading/error states
// and delegates rendering to ProductCard.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from './ProductCard';

const CatalogList: React.FC = () => {
  const { products, loading, error } = useProducts();

  if (loading) {
    return <p className="catalog-status">Loading products…</p>;
  }

  if (error) {
    return <p className="catalog-status catalog-error">{error}</p>;
  }

  if (products.length === 0) {
    return <p className="catalog-status">No products available.</p>;
  }

  return (
    <div className="catalog-grid">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default CatalogList;
