import type { Cart, Product } from '../types';

interface Props {
  cart: Cart;
  products: Product[];
  onUpdate: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

function productName(products: Product[], productId: string): string {
  return products.find((p) => p.id === productId)?.name ?? productId;
}

export default function CartPanel({ cart, products, onUpdate, onRemove }: Props) {
  const isEmpty = cart.items.length === 0;

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
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onUpdate(item.productId, item.quantity + 1)}>+</button>
                </div>
                <span className="cart-item-subtotal">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </span>
                <button className="remove-btn" onClick={() => onRemove(item.productId)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="cart-total">
            <strong>Total: ${cart.total.toFixed(2)}</strong>
          </div>
        </>
      )}
    </section>
  );
}
