import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/productService';

export async function listProducts(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
}

export async function getProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found', code: 'PRODUCT_NOT_FOUND' });
      return;
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    if (!product) {
      res.status(404).json({ error: 'Product not found', code: 'PRODUCT_NOT_FOUND' });
      return;
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
}
