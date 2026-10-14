// ─────────────────────────────────────────────────────────────────────────────
// Command Handler: UpdateProductHandler
// Updates an existing product via the product repository port.
// ─────────────────────────────────────────────────────────────────────────────

import { UpdateProductCommand } from './updateProduct.command';
import { IProductRepository, ProductData } from '../../ports/productRepository.port';
import { NotFoundError } from '../../domain/errors';
import { CommandHandler } from '../bus/commandBus';

export class UpdateProductHandler implements CommandHandler<UpdateProductCommand, ProductData> {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(command: UpdateProductCommand): Promise<ProductData> {
    const updateData: Record<string, unknown> = {};
    if (command.name !== undefined) updateData.name = command.name;
    if (command.description !== undefined) updateData.description = command.description;
    if (command.price !== undefined) updateData.price = command.price;
    if (command.availableStock !== undefined) updateData.availableStock = command.availableStock;

    const product = await this.productRepo.update(command.id, updateData);
    if (!product) {
      throw new NotFoundError('Product', command.id);
    }
    return product;
  }
}
