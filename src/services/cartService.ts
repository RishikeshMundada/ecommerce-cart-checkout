import { carts, products } from '../store';
import { Cart } from '../models/cart';
import { AppError } from '../utils/errors';

function getOrCreate(customerId: string): Cart {
  if (!carts.has(customerId)) {
    carts.set(customerId, { customerId, items: [] });
  }
  return carts.get(customerId)!;
}

export function cartTotal(cart: Cart): number {
  const raw = cart.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  return parseFloat(raw.toFixed(2));
}

export function getCart(customerId: string): Cart {
  return getOrCreate(customerId);
}

export function addToCart(customerId: string, productId: string, quantity: number): Cart {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new AppError(400, 'quantity must be a positive integer');
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    throw new AppError(404, `product ${productId} not found`);
  }

  const cart = getOrCreate(customerId);
  const existing = cart.items.find((i) => i.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity, unitPrice: product.price });
  }

  return cart;
}

export function updateCartItem(customerId: string, productId: string, quantity: number): Cart {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new AppError(400, 'quantity must be a non-negative integer');
  }

  const cart = getOrCreate(customerId);
  const idx = cart.items.findIndex((i) => i.productId === productId);

  if (idx === -1) {
    throw new AppError(404, `product ${productId} is not in the cart`);
  }

  if (quantity === 0) {
    cart.items.splice(idx, 1);
  } else {
    cart.items[idx].quantity = quantity;
  }

  return cart;
}

export function removeFromCart(customerId: string, productId: string): Cart {
  const cart = getOrCreate(customerId);
  const idx = cart.items.findIndex((i) => i.productId === productId);

  if (idx === -1) {
    throw new AppError(404, `product ${productId} is not in the cart`);
  }

  cart.items.splice(idx, 1);
  return cart;
}

export function clearCart(customerId: string): void {
  const cart = getOrCreate(customerId);
  cart.items = [];
}
