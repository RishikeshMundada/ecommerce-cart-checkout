import { randomUUID } from 'crypto';
import { orders, products } from '../store';
import { Order } from '../models/order';
import { AppError } from '../utils/errors';
import { getCart, clearCart } from './cartService';
import { validateCode, redeemCode, maybeGenerateCode } from './discountService';

export interface CheckoutResult {
  order: Order;
  newDiscountCode?: string;
}

export function checkout(customerId: string, discountCode?: string): CheckoutResult {
  const cart = getCart(customerId);

  if (cart.items.length === 0) {
    throw new AppError(400, 'cart is empty');
  }

  const orderItems = cart.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      throw new AppError(400, `product ${item.productId} no longer exists`);
    }
    return {
      productId: item.productId,
      name: product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    };
  });

  const subtotal = parseFloat(
    orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0).toFixed(2)
  );

  // Validate before mutating any state so a bad code leaves everything unchanged.
  let discountAmount = 0;
  let appliedCode: string | undefined;

  if (discountCode) {
    const discount = validateCode(discountCode);
    discountAmount = parseFloat(((subtotal * discount.percent) / 100).toFixed(2));
    appliedCode = discountCode;
  }

  const total = parseFloat((subtotal - discountAmount).toFixed(2));

  const order: Order = {
    id: randomUUID(),
    customerId,
    items: orderItems,
    subtotal,
    discountCode: appliedCode,
    discountAmount,
    total,
    createdAt: new Date(),
  };

  orders.push(order);

  if (appliedCode) {
    redeemCode(appliedCode);
  }

  clearCart(customerId);

  const generated = maybeGenerateCode();

  return { order, newDiscountCode: generated?.code };
}
