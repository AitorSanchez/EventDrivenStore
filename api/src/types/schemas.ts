import { z } from 'zod';

// ── Product DTOs ──────────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  availableStock: z.number().int().min(0, 'Stock cannot be negative'),
});

export const updateProductSchema = z
  .object({
    name: z.string().min(3).optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    availableStock: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;

// ── Order DTOs ────────────────────────────────────────────────────────────────

export const createOrderSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  customerEmail: z.string().email('A valid customer email is required'),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
