// ─────────────────────────────────────────────────────────────────────────────
// Domain Errors — Framework-free, typed error classes.
// Used by command/query handlers and caught by the global Express errorHandler.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Base application error.
 * All domain-specific errors extend this so the error-handler middleware
 * can reliably read `statusCode` and `code` without unsafe casting.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    // Restore prototype chain broken by extending built-in Error
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Resource was not found (HTTP 404). */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier: string) {
    super(`${resource} not found: ${identifier}`, 404, `${resource.toUpperCase()}_NOT_FOUND`);
  }
}

/** Insufficient stock to fulfil the reservation (HTTP 400). */
export class InsufficientStockError extends AppError {
  constructor(requested: number, available: number) {
    super(
      `Insufficient stock. Requested: ${requested}, Available: ${available}`,
      400,
      'INSUFFICIENT_STOCK',
    );
  }
}
