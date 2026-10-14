import { Request, Response, NextFunction } from 'express';
import { commandBus, queryBus } from '../container';
import { CreateProductCommand } from '../application/commands/createProduct.command';
import { UpdateProductCommand } from '../application/commands/updateProduct.command';
import { GetProductByIdQuery } from '../application/queries/getProductById.query';
import { ListProductsQuery } from '../application/queries/listProducts.query';
import { ProductData } from '../ports/productRepository.port';

export async function listProducts(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const products = await queryBus.execute<ProductData[]>(new ListProductsQuery());
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
    const product = await queryBus.execute<ProductData | null>(
      new GetProductByIdQuery(req.params.id)
    );
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
    const command = new CreateProductCommand(
      req.body.name,
      req.body.price,
      req.body.availableStock,
      req.body.description,
    );
    const product = await commandBus.execute<ProductData>(command);
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
    const command = new UpdateProductCommand(
      req.params.id,
      req.body.name,
      req.body.description,
      req.body.price,
      req.body.availableStock,
    );
    const product = await commandBus.execute<ProductData>(command);
    res.json(product);
  } catch (err) {
    next(err);
  }
}
