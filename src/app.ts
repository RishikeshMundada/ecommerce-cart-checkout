import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import productsRouter from './routes/products';
import cartRouter from './routes/cart';
import checkoutRouter from './routes/checkout';
import adminRouter from './routes/admin';
import { AppError } from './utils/errors';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/products', productsRouter);
app.use('/cart', cartRouter);
app.use('/checkout', checkoutRouter);
app.use('/admin', adminRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

export default app;
