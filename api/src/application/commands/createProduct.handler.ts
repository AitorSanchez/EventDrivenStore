// ─────────────────────────────────────────────────────────────────────────────
// Command Handler: CreateProductHandler
// Persists a new product via the product repository port.
// ─────────────────────────────────────────────────────────────────────────────

import { CreateProductCommand } from './createProduct.command';
import { IProductRepository, ProductData } from '../../ports/productRepository.port';
import { CommandHandler } from '../bus/commandBus';

export class CreateProductHandler implements CommandHandler<CreateProductCommand, ProductData> {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(command: CreateProductCommand): Promise<ProductData> {
    return this.productRepo.create({
      name: command.name,
      description: command.description,
      price: command.price,
      availableStock: command.availableStock,
    });
  }
}
