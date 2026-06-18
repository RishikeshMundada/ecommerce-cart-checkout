import { useState, useEffect, useCallback } from 'react';
import ProductList from './components/ProductList';
import CartPanel from './components/Cart';
import type { Product, Cart } from './types';
import * as api from './api';
import './App.css';

const emptyCart: Cart = { customerId: '', items: [], total: 0 };

type Tab = 'shop' | 'admin';

export default function App() {
  const [tab, setTab] = useState<Tab>('shop');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCart()])
      .then(([prods, c]) => {
        setProducts(prods);
        setCart(c);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setProductsLoading(false));
  }, []);

  const handleAdd = useCallback(async (productId: string) => {
    clearError();
    try {
      const updated = await api.addToCart(productId, 1);
      setCart(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const handleUpdate = useCallback(async (productId: string, quantity: number) => {
    clearError();
    try {
      const updated = await api.updateCartItem(productId, quantity);
      setCart(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const handleRemove = useCallback(async (productId: string) => {
    clearError();
    try {
      const updated = await api.removeFromCart(productId);
      setCart(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Store</h1>
        <nav>
          <button
            className={tab === 'shop' ? 'tab active' : 'tab'}
            onClick={() => setTab('shop')}
          >
            Shop
          </button>
          <button
            className={tab === 'admin' ? 'tab active' : 'tab'}
            onClick={() => setTab('admin')}
          >
            Admin
          </button>
        </nav>
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={clearError}>x</button>
        </div>
      )}

      {tab === 'shop' && (
        <main className="shop-layout">
          <ProductList
            products={products}
            onAdd={handleAdd}
            loading={productsLoading}
          />
          <CartPanel
            cart={cart}
            products={products}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
          />
        </main>
      )}

      {tab === 'admin' && (
        <main className="admin-layout">
          <p>Admin stats will appear here.</p>
        </main>
      )}
    </div>
  );
}
