# ecommerce-cart-checkout

A small ecommerce backend with cart, checkout, and a discount code system. Includes a React frontend for demoing the full flow.

## Stack

- Backend: Node.js, TypeScript, Express, in-memory store
- Frontend: React, TypeScript, Vite
- Tests: Jest, ts-jest

## Setup

### Backend

```bash
npm install
npm run dev
```

Runs on `http://localhost:3000`.

To run with non-default discount settings:

```bash
NTH_ORDER_DISCOUNT=3 DISCOUNT_PERCENT=15 npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`. The backend must be running first.

### Tests

From the project root:

```bash
npm test
```

## Discount logic

Every nth order placed across all customers triggers a discount code. The default is every 5th order, giving 10% off.

The code is generated after the nth order completes and included in the checkout response. It is single-use: once applied at checkout it cannot be used again. Attempting to reuse it, or passing a code that was never generated, returns a 400 error and the order is not created.

`NTH_ORDER_DISCOUNT` and `DISCOUNT_PERCENT` are configurable via environment variables.

## API

All cart and checkout endpoints read the customer identity from the `X-Customer-Id` header. If omitted, it defaults to `guest`.

### Products

```bash
curl http://localhost:3000/products
```

### Cart

```bash
# add item
curl -X POST http://localhost:3000/cart/items \
  -H "Content-Type: application/json" \
  -H "X-Customer-Id: alice" \
  -d '{"productId": "p1", "quantity": 2}'

# view cart
curl http://localhost:3000/cart \
  -H "X-Customer-Id: alice"

# update quantity (set to 0 to remove)
curl -X PUT http://localhost:3000/cart/items/p1 \
  -H "Content-Type: application/json" \
  -H "X-Customer-Id: alice" \
  -d '{"quantity": 1}'

# remove item
curl -X DELETE http://localhost:3000/cart/items/p1 \
  -H "X-Customer-Id: alice"
```

### Checkout

```bash
# without discount code
curl -X POST http://localhost:3000/checkout \
  -H "Content-Type: application/json" \
  -H "X-Customer-Id: alice" \
  -d '{}'

# with discount code
curl -X POST http://localhost:3000/checkout \
  -H "Content-Type: application/json" \
  -H "X-Customer-Id: alice" \
  -d '{"discountCode": "A1B2C3D4"}'
```

Response includes `order` and, if this was the nth order, `newDiscountCode`.

### Admin

```bash
# store stats
curl http://localhost:3000/admin/stats

# check nth-order condition and generate a code if met
curl -X POST http://localhost:3000/admin/discount
```
