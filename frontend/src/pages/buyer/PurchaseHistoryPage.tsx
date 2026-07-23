import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { History, Search, ShieldCheck, Download, ExternalLink, RefreshCw, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import './BuyerExperience.css';
import BuyerNav from './BuyerNav';
import { mockPurchaseHistory } from './mockData';
import type { PurchaseRecord } from './mockData';

export default function PurchaseHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'refunded' | 'disputed'>('all');

  const filtered = mockPurchaseHistory.filter(item => {
    const matchesSearch =
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSpent = mockPurchaseHistory
    .filter(i => i.status === 'completed')
    .reduce((acc, i) => acc + i.price, 0);

  return (
    <div className="buyer-page">
      <BuyerNav />

      <div className="bx-header">
        <div className="bx-header-left">
          <h1>
            Purchase History
            <span className="bx-count-badge">{mockPurchaseHistory.length}</span>
          </h1>
          <p>Complete ledger of all your authentic product purchases, certificates, and receipts</p>
        </div>
        <button
          className="bx-btn-ghost"
          onClick={() => {
            const csv = 'Order,Date,Product,Brand,Price,Status,Serial Number\n' +
              mockPurchaseHistory.map(h => `"${h.orderNumber}","${h.date}","${h.product}","${h.brand}",${h.price},"${h.status}","${h.serialNumber}"`).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `purchase_history_${Date.now()}.csv`;
            a.click();
          }}
        >
          <Download size={15} /> Export History (CSV)
        </button>
      </div>

      {/* Stats row */}
      <div className="bx-stats-grid">
        <div className="bx-stat-card">
          <div className="bx-stat-icon" style={{ background: 'rgba(0, 88, 188, 0.1)', color: 'var(--accent-cyan)' }}>
            <History size={20} />
          </div>
          <div className="bx-stat-value">{mockPurchaseHistory.length}</div>
          <div className="bx-stat-label">Total Transactions</div>
        </div>

        <div className="bx-stat-card">
          <div className="bx-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
            <ShieldCheck size={20} />
          </div>
          <div className="bx-stat-value">${totalSpent.toFixed(2)}</div>
          <div className="bx-stat-label">Total Authentic Value</div>
        </div>

        <div className="bx-stat-card">
          <div className="bx-stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
            <CheckCircle size={20} />
          </div>
          <div className="bx-stat-value">
            {mockPurchaseHistory.filter(i => i.verified).length} / {mockPurchaseHistory.length}
          </div>
          <div className="bx-stat-label">Verified Items</div>
        </div>
      </div>

      {/* Filters and search */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="bx-form-input"
            style={{ paddingLeft: 38 }}
            placeholder="Search by product, brand, order # or serial..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bx-tabs" style={{ margin: 0, borderBottom: 'none' }}>
          {(['all', 'completed', 'refunded', 'disputed'] as const).map(status => (
            <button
              key={status}
              className={`bx-tab ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Purchase table */}
      <div className="bx-card" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <div className="bx-empty">
            <History size={32} />
            <h2>No matching purchases found</h2>
            <p>Try adjusting your search query or filter settings.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="bx-ph-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Serial Number</th>
                  <th>Price</th>
                  <th>Authenticity</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={item.image} alt={item.product} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.product}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.brand} · {item.category}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                      {item.orderNumber}
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {item.serialNumber}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      ${item.price.toFixed(2)}
                    </td>
                    <td>
                      {item.verified ? (
                        <span className="bx-verified">
                          <ShieldCheck size={10} /> Verified
                        </span>
                      ) : (
                        <span className="bx-unverified">
                          <AlertCircle size={10} /> Unverified
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`bx-status bx-status-${item.status}`}>
                        {item.status === 'completed' && <CheckCircle size={11} />}
                        {item.status === 'refunded' && <RotateCcw size={11} />}
                        {item.status === 'disputed' && <AlertCircle size={11} />}
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Link
                          to={`/verify?serial=${item.serialNumber}`}
                          className="bx-btn-ghost"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="Verify Serial"
                        >
                          <ExternalLink size={13} /> Certificate
                        </Link>
                        <Link
                          to="/buyer/checkout"
                          className="bx-btn-ghost"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="Reorder Item"
                        >
                          <RefreshCw size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
