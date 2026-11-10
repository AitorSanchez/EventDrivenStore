// src/features/catalog/components/ProductCard.tsx
import React from 'react';
import { Product } from '../domain/types';

interface Props {
  product: Product;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  return (
    <div className="product-card">
      <h2 className="product-name">{product.name}</h2>
      <p className="product-description">{product.description}</p>
      <div className="product-meta">
        <span className="product-price">${product.price.toFixed(2)}</span>
        <span className="product-stock">
          {product.availableStock > 0 ? `${product.availableStock} in stock` : 'Sold out'}
        </span>
      </div>
    </div>
  );
};
