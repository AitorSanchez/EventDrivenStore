// ─────────────────────────────────────────────────────────────────────────────
// Port: IProductRepository
// Hexagonal "driven" port — defines the contract for product persistence.
// No Mongoose / infrastructure imports allowed here.
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductData {
  id: string;
  name: string;
  description?: string;
  price: number;
  availableStock: number;
  reservedStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  availableStock: number;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  availableStock?: number;
}

export interface IProductRepository {
  /** Find a single product by ID, or null if not found. */
  findById(id: string): Promise<ProductData | null>;

  /** Return all products, sorted newest-first. */
  findAll(): Promise<ProductData[]>;

  /**
   * Atomically reserve stock: decrement availableStock and increment reservedStock.
   * Returns true if reservation succeeded, false if stock was insufficient or product missing.
   */
  reserveStock(productId: string, quantity: number): Promise<boolean>;

  /** Persist a new product and return the saved data. */
  create(data: CreateProductData): Promise<ProductData>;

  /** Update a product by ID. Returns the updated product, or null if not found. */
  update(id: string, data: UpdateProductData): Promise<ProductData | null>;
}
