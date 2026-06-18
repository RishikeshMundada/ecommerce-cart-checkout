import { Router, Request, Response, NextFunction } from 'express';
import * as checkoutService from '../services/checkoutService';

const router = Router();

function customerId(req: Request): string {
  return (req.headers['x-customer-id'] as string | undefined) ?? 'guest';
}

router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { discountCode } = req.body;
    const result = checkoutService.checkout(customerId(req), discountCode);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
