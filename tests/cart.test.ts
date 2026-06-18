import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  cartTotal,
} from '../src/services/cartService';
import { resetStore } from '../src/store';

beforeEach(() => {
  resetStore();
});

describe('addToCart', () => {
  it('adds a new item to an empty cart', () => {
    addToCart('c1', 'p1', 2);
    const cart = getCart('c1');
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
  });

  it('increments quantity when the same product is added twice', () => {
    addToCart('c1', 'p1', 1);
    addToCart('c1', 'p1', 3);
    const cart = getCart('c1');
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(4);
  });

  it('adds distinct products as separate line items', () => {
    addToCart('c1', 'p1', 1);
    addToCart('c1', 'p2', 2);
    expect(getCart('c1').items).toHaveLength(2);
  });

  it('stores the unit price from the product catalogue', () => {
    addToCart('c1', 'p1', 1);
    expect(getCart('c1').items[0].unitPrice).toBe(29.99);
  });

  it('rejects a quantity of zero', () => {
    expect(() => addToCart('c1', 'p1', 0)).toThrow();
  });

  it('rejects a negative quantity', () => {
    expect(() => addToCart('c1', 'p1', -1)).toThrow();
  });

  it('rejects an unknown product id', () => {
    expect(() => addToCart('c1', 'no-such-product', 1)).toThrow();
  });
});

describe('cartTotal', () => {
  it('returns 0 for an empty cart', () => {
    expect(cartTotal(getCart('c1'))).toBe(0);
  });

  it('sums price times quantity across all items', () => {
    addToCart('c1', 'p1', 2); // 29.99 * 2 = 59.98
    addToCart('c1', 'p2', 1); // 89.99 * 1 = 89.99
    expect(cartTotal(getCart('c1'))).toBe(149.97);
  });
});

describe('updateCartItem', () => {
  it('sets a new quantity for an existing item', () => {
    addToCart('c1', 'p1', 2);
    updateCartItem('c1', 'p1', 5);
    expect(getCart('c1').items[0].quantity).toBe(5);
  });

  it('removes the item when quantity is set to zero', () => {
    addToCart('c1', 'p1', 2);
    updateCartItem('c1', 'p1', 0);
    expect(getCart('c1').items).toHaveLength(0);
  });

  it('throws when the product is not in the cart', () => {
    expect(() => updateCartItem('c1', 'p1', 3)).toThrow();
  });
});

describe('removeFromCart', () => {
  it('removes a product from the cart', () => {
    addToCart('c1', 'p1', 1);
    removeFromCart('c1', 'p1');
    expect(getCart('c1').items).toHaveLength(0);
  });

  it('throws when the product is not in the cart', () => {
    expect(() => removeFromCart('c1', 'p1')).toThrow();
  });
});
