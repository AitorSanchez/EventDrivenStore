// ─────────────────────────────────────────────────────────────────────────────
// Port: IOrderRepository
// Hexagonal "driven" port — defines the contract for order persistence.
// No Mongoose / infrastructure imports allowed here.
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderData {
  id: string;
  productId: string;
  quantity: number;
  customerEmail: string;
  status: 'pending' | 'completed' | 'cancelled';
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Enriched view with populated product info — used for read-side queries. */
export interface OrderViewData extends OrderData {
  product?: {
    name: string;
    price: number;
  };
}

export interface CreatePendingOrderData {
  productId: string;
  quantity: number;
  customerEmail: string;
  eventId: string;
}

export interface IOrderRepository {
  /** Create an order in 'pending' status. */
  createPending(data: CreatePendingOrderData): Promise<OrderData>;

  /** Find order by ID with populated product name/price — read-optimised. */
  findByIdPopulated(id: string): Promise<OrderViewData | null>;
}
