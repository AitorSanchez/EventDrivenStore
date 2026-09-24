import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../types/schemas';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
} from '../controllers/productController';

const router = Router();

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', validate(createProductSchema), createProduct);
router.put('/:id', validate(updateProductSchema), updateProduct);

export default router;
