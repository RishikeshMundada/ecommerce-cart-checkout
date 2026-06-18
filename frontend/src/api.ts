import type { Product, Cart, CheckoutResult, StoreStats } from './types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function getCustomerId(): string {
  let id = localStorage.getItem('customerId');
  if (!id) {
    id = `customer-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('customerId', id);
  }
  return id;
}

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Customer-Id': getCustomerId(),
  };
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function getProducts(): Promise<Product[]> {
  return parseResponse(await fetch(`${BASE}/products`, { headers: headers() }));
}

export async function getCart(): Promise<Cart> {
  return parseResponse(await fetch(`${BASE}/cart`, { headers: headers() }));
}

export async function addToCart(productId: string, quantity: number): Promise<Cart> {
  return parseResponse(
    await fetch(`${BASE}/cart/items`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ productId, quantity }),
    })
  );
}

export async function updateCartItem(productId: string, quantity: number): Promise<Cart> {
  return parseResponse(
    await fetch(`${BASE}/cart/items/${productId}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ quantity }),
    })
  );
}

export async function removeFromCart(productId: string): Promise<Cart> {
  return parseResponse(
    await fetch(`${BASE}/cart/items/${productId}`, {
      method: 'DELETE',
      headers: headers(),
    })
  );
}

export async function checkout(discountCode?: string): Promise<CheckoutResult> {
  return parseResponse(
    await fetch(`${BASE}/checkout`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ discountCode }),
    })
  );
}

export async function getStats(): Promise<StoreStats> {
  return parseResponse(await fetch(`${BASE}/admin/stats`, { headers: headers() }));
}

export async function generateDiscount(): Promise<unknown> {
  return parseResponse(
    await fetch(`${BASE}/admin/discount`, { method: 'POST', headers: headers() })
  );
}
