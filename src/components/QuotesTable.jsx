import React, { useState, useMemo } from 'react';
import { Eye } from 'lucide-react';

function StatusBadge({ status }) {
  const classMap = {
    Pending: 'badge badge-pending',
    Quoted: 'badge badge-quoted',
    Approved: 'badge badge-approved',
    Declined: 'badge badge-declined',
  };
  return <span className={classMap[status] || 'badge'}>{status}</span>;
}

function TypeBadge({ type }) {
  const label = 
    type === 'slicer' ? 'CAD Slice' : 
    type === 'designer' ? 'Design' : 
    type === 'spareparts' ? 'Spare Part' : 
    type === 'prototype' ? 'Prototype' : 
    type === 'order' ? 'Catalog Order' : 'Quote';
  return <span className="badge badge-type">{label}</span>;
}

export default function QuotesTable({ quotes, loading, selectedQuote, onSelectQuote, onUpdateQuote, mode = 'quotes' }) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return quotes.filter(q => {
      const matchStatus = statusFilter === 'All' || q.status === statusFilter;
      const matchType = typeFilter === 'All' || q.type === typeFilter;
      const matchSearch = !search || [q.id, q.customer_name, q.customer_email].some(
        v => v?.toLowerCase().includes(search.toLowerCase())
      );
      return matchStatus && matchType && matchSearch;
    });
  }, [quotes, statusFilter, typeFilter, search]);

  const handleQuickStatus = async (q, newStatus) => {
    try {
      const res = await fetch(`/api/quotes/${q.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          price_estimate: q.price_estimate,
          admin_notes: q.admin_notes || ''
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && onUpdateQuote) {
          onUpdateQuote(data.quote);
        }
      }
    } catch (err) {
      console.error('Quick status update failed:', err);
    }
  };

  return (
    <div className="card animate-fadeIn" style={{ overflow: 'hidden', background: '#ffffff' }}>
      {/* Filter Row */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '1.25rem',
        padding: '1.25rem',
        borderBottom: '1px solid var(--border-color)',
        flexWrap: 'wrap',
        background: '#ffffff'
      }}>
        {/* Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: '1 1 240px' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {mode === 'orders' ? 'Search Orders' : 'Search Submissions'}
          </label>
          <input
            type="text"
            placeholder={mode === 'orders' ? 'Search by name, email, order ID...' : 'Search by name, email, ticket ID...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field"
            style={{ height: '34px', fontSize: '0.78rem' }}
            id="quote-search"
          />
        </div>

        {/* Status Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '170px' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="select-field"
            style={{ height: '34px', fontSize: '0.78rem', padding: '0 0.6rem' }}
            id="status-filter-select"
          >
            <option value="All">🌐 All Statuses</option>
            <option value="Pending">⏳ Pending</option>
            <option value="Quoted">💰 Quoted</option>
            <option value="Approved">✅ Approved</option>
            <option value="Declined">❌ Declined</option>
          </select>
        </div>

        {/* Type Dropdown (Hide for catalog orders) */}
        {mode !== 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '170px' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Service Type</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="select-field"
              style={{ height: '34px', fontSize: '0.78rem', padding: '0 0.6rem' }}
              id="type-filter-select"
            >
              <option value="All">🌐 All Services</option>
              <option value="slicer">📐 CAD Slice</option>
              <option value="designer">🎨 Design Draft</option>
              <option value="spareparts">⚙️ Spare Part</option>
              <option value="prototype">🔬 Prototype Lab</option>
            </select>
          </div>
        )}

        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', paddingBottom: '0.4rem' }}>
          {filtered.length} of {quotes.length} {mode === 'orders' ? 'orders' : 'requests'}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <div style={{ fontSize: '0.82rem' }}>Loading {mode === 'orders' ? 'orders' : 'requests'}...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
          <div style={{ fontSize: '0.85rem' }}>No {mode === 'orders' ? 'orders' : 'requests'} match your filters.</div>
        </div>
      ) : mode === 'orders' ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '0.76rem',
                textTransform: 'uppercase',
                fontWeight: '700',
                letterSpacing: '0.07em'
              }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Order ID</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left' }}>Customer</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left' }}>Items Purchased</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left' }}>Shipping Location</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'right' }}>Total Paid</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center', width: '160px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => {
                const isSelected = selectedQuote?.id === q.id;
                return (
                  <tr
                    key={q.id}
                    onClick={() => onSelectQuote(q)}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                      transition: 'background 0.15s ease',
                      borderLeft: isSelected ? '3px solid var(--accent-purple)' : '3px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(0, 0, 0, 0.012)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--accent-cyan)', fontWeight: '600' }}>
                        {q.id}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {new Date(q.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{q.customer_name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>{q.customer_email}</div>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', maxWidth: '280px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {q.type === 'order' ? (
                          q.extra_data?.items?.map((it, idx) => (
                            <span key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              {it.name} <strong style={{ color: 'var(--text-primary)' }}>x{it.quantity}</strong>
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                            {q.type === 'slicer' ? `📐 CAD Slicer Print (${q.material})` :
                             q.type === 'designer' ? '🎨 Custom 3D Design' :
                             q.type === 'spareparts' ? '⚙️ Spare Part Re-creation' :
                             q.type === 'prototype' ? '🔬 Prototype Lab' : '📦 Custom Print'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {q.extra_data?.shippingAddress || 'N/A'}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <StatusBadge status={q.status} />
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: '800', color: 'var(--accent-green)' }}>
                      ₹{(q.price_estimate || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <button
                          onClick={e => { e.stopPropagation(); onSelectQuote(q); }}
                          className="btn btn-secondary"
                          style={{
                            height: '28px',
                            padding: '0 0.6rem',
                            fontSize: '0.74rem',
                            fontWeight: '600',
                            borderRadius: '99px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'none'
                          }}
                        >
                          <Eye size={12} />
                          Details
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '0.76rem',
                textTransform: 'uppercase',
                fontWeight: '700',
                letterSpacing: '0.07em'
              }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Ticket</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left' }}>Client</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left' }}>Details</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'right' }}>Est. Price</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center', width: '160px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => {
                const isSelected = selectedQuote?.id === q.id;
                return (
                  <tr
                    key={q.id}
                    onClick={() => onSelectQuote(q)}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                      transition: 'background 0.15s ease',
                      borderLeft: isSelected ? '3px solid var(--accent-purple)' : '3px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(0, 0, 0, 0.012)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--accent-cyan)', fontWeight: '600' }}>
                        {q.id}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {new Date(q.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{q.customer_name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>{q.customer_email}</div>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <TypeBadge type={q.type} />
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                        {q.type === 'slicer'
                          ? `${q.material} · ${q.color}`
                          : q.type === 'prototype'
                            ? q.extra_data?.projectName
                            : q.type === 'order'
                              ? (q.extra_data?.items?.map(it => `${it.name} (x${it.quantity})`).join(', ') || 'Catalog Order')
                              : (q.extra_data?.productType || q.extra_data?.partName || 'Custom')}
                      </div>
                      {q.file_name && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          📎 {q.file_name.length > 22 ? q.file_name.substring(0, 22) + '…' : q.file_name}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <StatusBadge status={q.status} />
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: '700', color: q.price_estimate ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                      {q.price_estimate ? `₹${q.price_estimate.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <button
                          onClick={e => { e.stopPropagation(); onSelectQuote(q); }}
                          className="btn btn-secondary"
                          style={{
                            height: '28px',
                            padding: '0 0.6rem',
                            fontSize: '0.74rem',
                            fontWeight: '600',
                            borderRadius: '99px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'none'
                          }}
                        >
                          <Eye size={12} />
                          Details
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
