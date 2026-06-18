import { checkout } from '../src/services/checkoutService';
import { addToCart } from '../src/services/cartService';
import { resetStore } from '../src/store';

beforeEach(() => {
  resetStore();
});

describe('checkout', () => {
  it('throws when the cart is empty', () => {
    expect(() => checkout('c1')).toThrow('cart is empty');
  });

  it('calculates order total correctly with no discount', () => {
    addToCart('c1', 'p1', 2); // 29.99 * 2 = 59.98
    addToCart('c1', 'p3', 1); // 49.99 * 1 = 49.99
    const { order } = checkout('c1');
    expect(order.subtotal).toBe(109.97);
    expect(order.discountAmount).toBe(0);
    expect(order.total).toBe(109.97);
  });

  it('clears the cart after a successful checkout', () => {
    addToCart('c1', 'p1', 1);
    checkout('c1');
    expect(() => checkout('c1')).toThrow('cart is empty');
  });

  it('saves the order to the store', () => {
    const { orders } = require('../src/store');
    addToCart('c1', 'p1', 1);
    const { order } = checkout('c1');
    expect(orders).toHaveLength(1);
    expect(orders[0].id).toBe(order.id);
  });

  it('does not generate a discount code before the nth order', () => {
    for (let i = 1; i <= 4; i++) {
      addToCart(`c${i}`, 'p1', 1);
      const result = checkout(`c${i}`);
      expect(result.newDiscountCode).toBeUndefined();
    }
  });

  it('generates a discount code on the nth order', () => {
    for (let i = 1; i <= 4; i++) {
      addToCart(`c${i}`, 'p1', 1);
      checkout(`c${i}`);
    }
    addToCart('c5', 'p1', 1);
    const { newDiscountCode } = checkout('c5');
    expect(newDiscountCode).toBeDefined();
    expect(typeof newDiscountCode).toBe('string');
  });

  it('does not generate a second code on the order right after the nth', () => {
    for (let i = 1; i <= 5; i++) {
      addToCart(`c${i}`, 'p1', 1);
      checkout(`c${i}`);
    }
    addToCart('c6', 'p1', 1);
    const { newDiscountCode } = checkout('c6');
    expect(newDiscountCode).toBeUndefined();
  });
});
