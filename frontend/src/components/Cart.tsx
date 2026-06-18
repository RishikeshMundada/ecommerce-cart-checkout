import { useState } from 'react';
import type { Cart, Product } from '../types';

interface Props {
  cart: Cart;
  products: Product[];
  onUpdate: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: (discountCode?: string) => void;
  checkingOut: boolean;
}

function productName(products: Product[], productId: string): string {
  return products.find((p) => p.id === productId)?.name ?? productId;
}

export default function CartPanel({
  cart,
  products,
  onUpdate,
  onRemove,
  onCheckout,
  checkingOut,
}: Props) {
  const [discountCode, setDiscountCode] = useState('');
  const isEmpty = cart.items.length === 0;

  function handleCheckout() {
    onCheckout(discountCode.trim() || undefined);
  }

  return (
    <section className="cart">
      <h2>Cart</h2>
      {isEmpty ? (
        <p className="cart-empty">Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-items">
            {cart.items.map((item) => (
              <li key={item.productId} className="cart-item">
                <span className="cart-item-name">{productName(products, item.productId)}</span>
                <span className="cart-item-price">${item.unitPrice.toFixed(2)}</span>
                <div className="cart-item-qty">
                  <button
                    onClick={() => onUpdate(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1 || checkingOut}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => onUpdate(item.productId, item.quantity + 1)}
                    disabled={checkingOut}
                  >
                    +
                  </button>
                </div>
                <span className="cart-item-subtotal">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </span>
                <button
                  className="remove-btn"
                  onClick={() => onRemove(item.productId)}
                  disabled={checkingOut}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="cart-total">
            <strong>Total: ${cart.total.toFixed(2)}</strong>
          </div>

          <div className="checkout-section">
            <input
              type="text"
              className="discount-input"
              placeholder="Discount code (optional)"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              disabled={checkingOut}
            />
            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? 'Placing order...' : 'Checkout'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
