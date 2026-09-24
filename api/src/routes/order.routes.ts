import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createOrderSchema } from '../types/schemas';
import { createOrder, getOrder } from '../controllers/orderController';

const router = Router();

router.post('/', validate(createOrderSchema), createOrder);
router.get('/:id', getOrder);

export default router;
