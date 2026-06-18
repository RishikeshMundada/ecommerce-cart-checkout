import { useState, useEffect, useCallback } from 'react';
import type { StoreStats } from '../types';
import * as api from '../api';

export default function AdminStats() {
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .getStats()
      .then(setStats)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleGenerate() {
    setGenerating(true);
    setGenerateMessage(null);
    try {
      const result = await api.generateDiscount();
      if (result.conditionMet && result.code) {
        setGenerateMessage(`Code generated: ${result.code} (${result.percent}% off)`);
        load();
      } else {
        setGenerateMessage(
          `Condition not met. Order count: ${result.currentOrderCount}, next code at order ${result.nextDiscountAt}.`
        );
      }
    } catch (err) {
      setGenerateMessage((err as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <p>Loading stats...</p>;
  if (error) return <p className="admin-error">Failed to load stats: {error}</p>;
  if (!stats) return null;

  return (
    <div className="admin-stats">
      <section className="stats-section">
        <h2>Overview</h2>
        <dl className="stats-grid">
          <div className="stat-card">
            <dt>Items purchased</dt>
            <dd>{stats.totalItemsPurchased}</dd>
          </div>
          <div className="stat-card">
            <dt>Total revenue</dt>
            <dd>${stats.totalRevenue.toFixed(2)}</dd>
          </div>
          <div className="stat-card">
            <dt>Discounts given</dt>
            <dd>${stats.totalDiscountAmount.toFixed(2)}</dd>
          </div>
          <div className="stat-card">
            <dt>Codes generated</dt>
            <dd>{stats.discountCodes.length}</dd>
          </div>
        </dl>
      </section>

      <section className="stats-section">
        <h2>Discount codes</h2>
        {stats.discountCodes.length === 0 ? (
          <p className="muted">No codes generated yet.</p>
        ) : (
          <table className="codes-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.discountCodes.map((dc) => (
                <tr key={dc.code}>
                  <td className="code-value">{dc.code}</td>
                  <td>{dc.percent}%</td>
                  <td>
                    <span className={dc.used ? 'badge badge-used' : 'badge badge-active'}>
                      {dc.used ? 'used' : 'active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="stats-section">
        <h2>Manual code generation</h2>
        <p className="muted">
          Checks whether the nth order condition is currently met and generates a code if so.
        </p>
        <div className="generate-row">
          <button className="generate-btn" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Checking...' : 'Check and generate'}
          </button>
          {generateMessage && <span className="generate-message">{generateMessage}</span>}
        </div>
      </section>
    </div>
  );
}
