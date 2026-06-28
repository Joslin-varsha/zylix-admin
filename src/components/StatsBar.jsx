import React from 'react';
import { FileText, Clock, CheckCircle, TrendingUp } from 'lucide-react';

export default function StatsBar({ quotes, mode = 'quotes' }) {
  const total = quotes.length;
  const pending = quotes.filter(q => q.status === 'Pending').length;
  const approved = quotes.filter(q => q.status === 'Approved').length;
  const quotedValue = quotes.reduce((acc, q) => acc + (q.price_estimate || 0), 0);

  const isOrders = mode === 'orders';

  const stats = [
    { 
      label: isOrders ? 'Total Catalog Orders' : 'Total Quote Requests', 
      value: total, 
      icon: FileText, 
      color: 'var(--accent-blue)', 
      bg: 'rgba(37, 99, 235, 0.08)',
      trend: { text: '+12% vs last month', isPositive: true }
    },
    { 
      label: isOrders ? 'Processing / Pending' : 'Pending Review', 
      value: pending, 
      icon: Clock, 
      color: 'var(--accent-amber)', 
      bg: 'rgba(217, 119, 6, 0.08)',
      trend: { text: pending > 0 ? `${pending} items active` : 'Queue cleared', isPositive: pending === 0 }
    },
    { 
      label: isOrders ? 'Paid & Approved' : 'Approved Custom Prints', 
      value: approved, 
      icon: CheckCircle, 
      color: 'var(--accent-green)', 
      bg: 'rgba(16, 185, 129, 0.08)',
      trend: { text: '+8% vs last week', isPositive: true }
    },
    { 
      label: isOrders ? 'Total Order Revenue' : 'Total Quoted Value', 
      value: `₹${quotedValue.toLocaleString('en-IN')}`, 
      icon: TrendingUp, 
      color: 'var(--accent-purple)', 
      bg: 'rgba(124, 58, 237, 0.08)',
      trend: { text: '+15.4% increase', isPositive: true }
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1.25rem',
      padding: '1.25rem 1.75rem',
      borderBottom: '1px solid var(--border-color)',
    }}>
      {stats.map(({ label, value, icon: Icon, color, bg, trend }) => (
        <div
          key={label}
          className="card animate-fadeIn"
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-card)',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {label}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {value}
            </div>
            {trend && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: '600',
                  color: trend.isPositive ? 'var(--accent-green)' : 'var(--accent-amber)',
                }}>
                  {trend.text}
                </span>
              </div>
            )}
          </div>
          <div style={{
            width: '42px', height: '42px',
            borderRadius: '12px',
            background: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <Icon size={20} style={{ color }} />
          </div>
        </div>
      ))}
    </div>
  );
}
