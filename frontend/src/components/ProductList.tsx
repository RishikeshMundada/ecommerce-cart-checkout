import type { Product } from '../types';

interface Props {
  products: Product[];
  onAdd: (productId: string) => void;
  loading: boolean;
}

export default function ProductList({ products, onAdd, loading }: Props) {
  if (loading) return <p>Loading products...</p>;

  return (
    <section>
      <h2>Products</h2>
      <ul className="product-list">
        {products.map((p) => (
          <li key={p.id} className="product-card">
            <div className="product-info">
              <span className="product-name">{p.name}</span>
              <span className="product-price">${p.price.toFixed(2)}</span>
            </div>
            <button onClick={() => onAdd(p.id)}>Add to cart</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
