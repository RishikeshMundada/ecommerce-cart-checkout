import type { CheckoutResult } from '../types';

interface Props {
  result: CheckoutResult;
  onContinue: () => void;
}

export default function OrderConfirmation({ result, onContinue }: Props) {
  const { order, newDiscountCode } = result;
  const discounted = order.discountAmount > 0;

  return (
    <section className="confirmation">
      <h2>Order placed</h2>
      <p className="confirmation-id">Order {order.id}</p>

      <ul className="confirmation-items">
        {order.items.map((item) => (
          <li key={item.productId} className="confirmation-item">
            <span>{item.name}</span>
            <span>x{item.quantity}</span>
            <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="confirmation-totals">
        <div className="confirmation-row">
          <span>Subtotal</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>
        {discounted && (
          <div className="confirmation-row discount-row">
            <span>Discount ({order.discountCode})</span>
            <span>-${order.discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="confirmation-row total-row">
          <strong>Total</strong>
          <strong>${order.total.toFixed(2)}</strong>
        </div>
      </div>

      {newDiscountCode && (
        <div className="new-code-banner">
          A discount code was generated for your next order:
          <strong className="new-code">{newDiscountCode}</strong>
        </div>
      )}

      <button className="continue-btn" onClick={onContinue}>
        Continue shopping
      </button>
    </section>
  );
}
