import { Product, IProduct } from '../models/Product';
import { CreateProductDto, UpdateProductDto } from '../types/schemas';

export async function getAllProducts(): Promise<IProduct[]> {
  return Product.find().sort({ createdAt: -1 });
}

export async function getProductById(id: string): Promise<IProduct | null> {
  return Product.findById(id);
}

export async function createProduct(dto: CreateProductDto): Promise<IProduct> {
  const product = new Product({
    name: dto.name,
    description: dto.description,
    price: dto.price,
    availableStock: dto.availableStock,
    reservedStock: 0,
  });
  return product.save();
}

export async function updateProduct(
  id: string,
  dto: UpdateProductDto
): Promise<IProduct | null> {
  return Product.findByIdAndUpdate(
    id,
    { $set: dto },
    { new: true, runValidators: true }
  );
}
