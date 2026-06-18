import { Router } from 'express';
import { getStats } from '../services/statsService';
import { maybeGenerateCode } from '../services/discountService';
import { orders } from '../store';
import { NTH_ORDER_DISCOUNT } from '../constants';

const router = Router();

router.get('/stats', (_req, res) => {
  res.json(getStats());
});

router.post('/discount', (_req, res) => {
  const generated = maybeGenerateCode();

  if (generated) {
    res.status(201).json({
      conditionMet: true,
      code: generated.code,
      percent: generated.percent,
    });
    return;
  }

  const nextDiscountAt =
    (Math.floor(orders.length / NTH_ORDER_DISCOUNT) + 1) * NTH_ORDER_DISCOUNT;

  res.json({
    conditionMet: false,
    currentOrderCount: orders.length,
    nextDiscountAt,
  });
});

export default router;
