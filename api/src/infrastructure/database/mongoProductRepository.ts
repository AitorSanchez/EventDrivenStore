// ─────────────────────────────────────────────────────────────────────────────
// Adapter: MongoProductRepository
// Mongoose implementation of IProductRepository port.
// All low-level MongoDB operations for products are encapsulated here.
// ─────────────────────────────────────────────────────────────────────────────

import { Product, IProduct } from '../../models/Product';
import {
  IProductRepository,
  ProductData,
  CreateProductData,
  UpdateProductData,
} from '../../ports/productRepository.port';

/** Maps a Mongoose IProduct document to the infrastructure-agnostic ProductData. */
function toProductData(doc: IProduct): ProductData {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    price: doc.price,
    availableStock: doc.availableStock,
    reservedStock: doc.reservedStock,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoProductRepository implements IProductRepository {
  async findById(id: string): Promise<ProductData | null> {
    const doc = await Product.findById(id);
    return doc ? toProductData(doc) : null;
  }

  async findAll(): Promise<ProductData[]> {
    const docs = await Product.find().sort({ createdAt: -1 });
    return docs.map(toProductData);
  }

  async reserveStock(productId: string, quantity: number): Promise<boolean> {
    const doc = await Product.findOneAndUpdate(
      {
        _id: productId,
        availableStock: { $gte: quantity },
      },
      {
        $inc: {
          availableStock: -quantity,
          reservedStock: quantity,
        },
      },
      { new: true },
    );
    return doc !== null;
  }

  async create(data: CreateProductData): Promise<ProductData> {
    const doc = await new Product({
      name: data.name,
      description: data.description,
      price: data.price,
      availableStock: data.availableStock,
      reservedStock: 0,
    }).save();
    return toProductData(doc);
  }

  async update(id: string, data: UpdateProductData): Promise<ProductData | null> {
    const doc = await Product.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    );
    return doc ? toProductData(doc) : null;
  }
}
