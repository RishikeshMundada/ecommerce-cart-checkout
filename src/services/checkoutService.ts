import { randomUUID } from 'crypto';
import { orders, products } from '../store';
import { Order } from '../models/order';
import { AppError } from '../utils/errors';
import { getCart, clearCart } from './cartService';

export function checkout(customerId: string, discountCode?: string): Order {
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

  // discount validation and nth-order code generation added in stage 5
  const discountAmount = 0;
  const total = subtotal;

  const order: Order = {
    id: randomUUID(),
    customerId,
    items: orderItems,
    subtotal,
    discountAmount,
    total,
    createdAt: new Date(),
  };

  if (discountCode) {
    // placeholder: unknown codes are silently ignored until stage 5 wires validation
    void discountCode;
  }

  orders.push(order);
  clearCart(customerId);

  return order;
}
