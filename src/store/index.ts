import { Product } from '../models/product';
import { Cart } from '../models/cart';
import { Order } from '../models/order';
import { DiscountCode } from '../models/discount';

export const products: Product[] = [
  { id: 'p1', name: 'Wireless Mouse', price: 29.99 },
  { id: 'p2', name: 'Mechanical Keyboard', price: 89.99 },
  { id: 'p3', name: 'USB-C Hub', price: 49.99 },
  { id: 'p4', name: 'Monitor Stand', price: 34.99 },
  { id: 'p5', name: 'Laptop Sleeve', price: 19.99 },
  { id: 'p6', name: 'Webcam', price: 69.99 },
];

export const carts = new Map<string, Cart>();
export const orders: Order[] = [];
export const discountCodes = new Map<string, DiscountCode>();
