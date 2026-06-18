import {
  generateCode,
  validateCode,
  redeemCode,
  maybeGenerateCode,
} from '../src/services/discountService';
import { checkout } from '../src/services/checkoutService';
import { addToCart } from '../src/services/cartService';
import { getStats } from '../src/services/statsService';
import { resetStore } from '../src/store';
import { AppError } from '../src/utils/errors';

beforeEach(() => {
  resetStore();
});

describe('validateCode', () => {
  it('returns the discount entry for a valid unused code', () => {
    const { code } = generateCode();
    const entry = validateCode(code);
    expect(entry.code).toBe(code);
    expect(entry.used).toBe(false);
  });

  it('throws for a code that does not exist', () => {
    expect(() => validateCode('DOESNOTEXIST')).toThrow(AppError);
  });

  it('throws for a code that has already been used', () => {
    const { code } = generateCode();
    redeemCode(code);
    expect(() => validateCode(code)).toThrow(AppError);
  });
});

describe('redeemCode', () => {
  it('marks the code as used so it cannot be validated again', () => {
    const { code } = generateCode();
    redeemCode(code);
    expect(() => validateCode(code)).toThrow('has already been used');
  });
});

describe('discount code applied at checkout', () => {
  it('applies the correct percentage discount to the subtotal', () => {
    const { code, percent } = generateCode();
    addToCart('c1', 'p2', 1); // 89.99
    const { order } = checkout('c1', code);
    const expectedDiscount = parseFloat(((89.99 * percent) / 100).toFixed(2));
    expect(order.discountAmount).toBe(expectedDiscount);
    expect(order.total).toBe(parseFloat((89.99 - expectedDiscount).toFixed(2)));
    expect(order.discountCode).toBe(code);
  });

  it('marks the code as used so it cannot be reused', () => {
    const { code } = generateCode();
    addToCart('c1', 'p1', 1);
    checkout('c1', code);

    addToCart('c1', 'p1', 1);
    expect(() => checkout('c1', code)).toThrow('has already been used');
  });

  it('rejects a code that was never generated', () => {
    addToCart('c1', 'p1', 1);
    expect(() => checkout('c1', 'FAKECODE')).toThrow('does not exist');
  });

  it('does not create an order or clear the cart when the code is invalid', () => {
    const { orders } = require('../src/store');
    addToCart('c1', 'p1', 1);

    expect(() => checkout('c1', 'BADCODE')).toThrow();

    expect(orders).toHaveLength(0);
    expect(() => checkout('c1')).not.toThrow();
  });
});

describe('maybeGenerateCode', () => {
  it('returns null when no orders have been placed', () => {
    expect(maybeGenerateCode()).toBeNull();
  });

  it('returns null when order count is not a multiple of NTH_ORDER_DISCOUNT', () => {
    for (let i = 1; i <= 3; i++) {
      addToCart(`c${i}`, 'p1', 1);
      checkout(`c${i}`);
    }
    expect(maybeGenerateCode()).toBeNull();
  });

  it('returns a new code when order count is exactly a multiple of NTH_ORDER_DISCOUNT', () => {
    for (let i = 1; i <= 5; i++) {
      addToCart(`c${i}`, 'p1', 1);
      checkout(`c${i}`);
    }
    // orders.length is now 5; the checkout already called maybeGenerateCode,
    // so call it again to confirm it still generates at multiples
    const result = maybeGenerateCode();
    expect(result).not.toBeNull();
    expect(result?.used).toBe(false);
  });
});

describe('admin stats', () => {
  it('starts at zero with no orders', () => {
    const stats = getStats();
    expect(stats.totalItemsPurchased).toBe(0);
    expect(stats.totalRevenue).toBe(0);
    expect(stats.totalDiscountAmount).toBe(0);
    expect(stats.discountCodes).toHaveLength(0);
  });

  it('counts total items purchased across all orders', () => {
    addToCart('c1', 'p1', 3);
    checkout('c1');
    addToCart('c2', 'p2', 2);
    checkout('c2');
    expect(getStats().totalItemsPurchased).toBe(5);
  });

  it('accumulates total revenue from order totals', () => {
    addToCart('c1', 'p1', 2); // 29.99 * 2 = 59.98
    checkout('c1');
    addToCart('c2', 'p3', 1); // 49.99
    checkout('c2');
    expect(getStats().totalRevenue).toBe(109.97);
  });

  it('tracks total discount amount given out', () => {
    const { code } = generateCode();
    addToCart('c1', 'p2', 1); // 89.99, 10% off = 9.00
    checkout('c1', code);
    expect(getStats().totalDiscountAmount).toBe(9.0);
  });

  it('lists all generated discount codes with their used status', () => {
    const { code } = generateCode();
    addToCart('c1', 'p1', 1);
    checkout('c1', code);

    const stats = getStats();
    expect(stats.discountCodes).toHaveLength(1);
    expect(stats.discountCodes[0].code).toBe(code);
    expect(stats.discountCodes[0].used).toBe(true);
  });

  it('reflects totals correctly after a mixed sequence of orders', () => {
    addToCart('c1', 'p1', 2); // 59.98, no discount
    checkout('c1');

    const { code } = generateCode();
    addToCart('c2', 'p2', 1); // 89.99, 10% off => discount 9.00, total 80.99
    checkout('c2', code);

    const stats = getStats();
    expect(stats.totalItemsPurchased).toBe(3);
    expect(stats.totalRevenue).toBe(140.97);
    expect(stats.totalDiscountAmount).toBe(9.0);
  });
});
