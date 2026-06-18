import { orders, discountCodes } from '../store';

export interface StoreStats {
  totalItemsPurchased: number;
  totalRevenue: number;
  totalDiscountAmount: number;
  discountCodes: Array<{ code: string; percent: number; used: boolean }>;
}

export function getStats(): StoreStats {
  const totalItemsPurchased = orders.reduce(
    (sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0),
    0
  );

  const totalRevenue = parseFloat(
    orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)
  );

  const totalDiscountAmount = parseFloat(
    orders.reduce((sum, order) => sum + order.discountAmount, 0).toFixed(2)
  );

  return {
    totalItemsPurchased,
    totalRevenue,
    totalDiscountAmount,
    discountCodes: Array.from(discountCodes.values()),
  };
}
