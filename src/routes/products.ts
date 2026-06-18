import { Router } from 'express';
import { products } from '../store';

const router = Router();

router.get('/', (_req, res) => {
  res.json(products);
});

export default router;
