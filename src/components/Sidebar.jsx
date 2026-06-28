import React from 'react';
import { Layers, LogOut, Zap, ShoppingBag, SlidersHorizontal } from 'lucide-react';

export default function Sidebar({ activeSection, onSectionChange, onLogout, quoteCount, orderCount }) {
  const navItems = [
    { id: 'quotes', label: 'Quote Requests', icon: Layers, badge: quoteCount },
    { id: 'orders', label: 'Catalog Orders', icon: ShoppingBag, badge: orderCount },
    { id: 'catalog', label: 'Product Manager', icon: SlidersHorizontal },
  ];

  return (
    <aside style={{
      width: '240px',
      flexShrink: 0,
      background: '#0d1527', // Dark slate-navy background from reference
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
    }}>
      {/* Brand Logo & Header */}
      <div style={{
        padding: '1.5rem 1.4rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '32px', height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <Zap size={15} style={{ color: '#ffffff' }} />
        </div>
        <div>
          <div style={{ fontWeight: '800', fontSize: '0.94rem', color: '#ffffff', letterSpacing: '-0.01em' }}>Zylix</div>
          <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>Admin Console</div>
        </div>
      </div>

      {/* Navigation menu list */}
      <nav style={{ flex: 1, padding: '1rem 0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#475569', padding: '0.4rem 0.6rem', marginBottom: '0.4rem' }}>
          Menu
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0.72rem 1rem',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontWeight: isActive ? '700' : '600',
                fontSize: '0.84rem',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.2s ease',
                textAlign: 'left',
              }}
              onMouseEnter={e => { 
                if (!isActive) { 
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; 
                  e.currentTarget.style.color = '#ffffff'; 
                } 
              }}
              onMouseLeave={e => { 
                if (!isActive) { 
                  e.currentTarget.style.background = 'transparent'; 
                  e.currentTarget.style.color = '#94a3b8'; 
                } 
              }}
            >
              <Icon size={16} style={{ color: isActive ? '#ffffff' : '#475569', transition: 'color 0.2s' }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{
                  background: isActive ? '#ffffff' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: isActive ? '#4f46e5' : '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: '800',
                  padding: '2px 7px',
                  borderRadius: '99px',
                  minWidth: '18px',
                  textAlign: 'center',
                  boxShadow: isActive ? 'none' : '0 2px 8px rgba(99,102,241,0.2)'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile card widget from reference */}
      <div style={{
        padding: '0.85rem',
        margin: '0.5rem 0.8rem',
        background: '#131e35',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '0.8rem',
        border: '1px solid rgba(255,255,255,0.03)'
      }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: '700',
          fontSize: '0.82rem',
          flexShrink: 0
        }}>
          AU
        </div>
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.8rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Admin User</div>
          <div style={{ color: '#475569', fontSize: '0.66rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontWeight: '600' }}>Administrator</div>
        </div>
      </div>

      {/* Sign Out Button */}
      <div style={{ padding: '0.8rem 0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={onLogout}
          className="btn btn-ghost"
          style={{ 
            width: '100%', 
            justifyContent: 'flex-start', 
            gap: '10px', 
            fontSize: '0.8rem', 
            height: '36px', 
            paddingLeft: '0.8rem',
            color: '#94a3b8',
            borderRadius: '8px'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
          }}
          id="logout-btn"
        >
          <LogOut size={14} style={{ color: '#ef4444' }} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
