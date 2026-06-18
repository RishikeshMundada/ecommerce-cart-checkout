import { Router, Request, Response, NextFunction } from 'express';
import * as cartService from '../services/cartService';

const router = Router();

function customerId(req: Request): string {
  return (req.headers['x-customer-id'] as string | undefined) ?? 'guest';
}

function cartResponse(req: Request, res: Response, status: number): void {
  const cart = cartService.getCart(customerId(req));
  res.status(status).json({ ...cart, total: cartService.cartTotal(cart) });
}

router.get('/', (req, res) => {
  cartResponse(req, res, 200);
});

router.post('/items', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity == null) {
      res.status(400).json({ error: 'productId and quantity are required' });
      return;
    }
    cartService.addToCart(customerId(req), productId, quantity);
    cartResponse(req, res, 201);
  } catch (err) {
    next(err);
  }
});

router.put('/items/:productId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quantity } = req.body;
    if (quantity == null) {
      res.status(400).json({ error: 'quantity is required' });
      return;
    }
    cartService.updateCartItem(customerId(req), req.params.productId, quantity);
    cartResponse(req, res, 200);
  } catch (err) {
    next(err);
  }
});

router.delete('/items/:productId', (req: Request, res: Response, next: NextFunction) => {
  try {
    cartService.removeFromCart(customerId(req), req.params.productId);
    cartResponse(req, res, 200);
  } catch (err) {
    next(err);
  }
});

export default router;
