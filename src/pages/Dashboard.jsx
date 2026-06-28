import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import QuotesTable from '../components/QuotesTable';
import QuoteDrawer from '../components/QuoteDrawer';
import StatsBar from '../components/StatsBar';
import { useQuotes } from '../hooks/useQuotes';
import ProductsManager from '../components/ProductsManager';
import { Bell } from 'lucide-react';


export default function Dashboard({ onLogout }) {
  const { quotes, loading, error, refresh, updateQuote } = useQuotes();
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [activeSection, setActiveSection] = useState('quotes');
  const [catalogRefreshTrigger, setCatalogRefreshTrigger] = useState(0);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingQuotes = quotes.filter(q => q.status === 'Pending');

  const handleSelectQuote = (q) => setSelectedQuote(q);
  const handleCloseDrawer = () => setSelectedQuote(null);

  const handleRefreshClick = () => {
    if (activeSection === 'catalog') {
      setCatalogRefreshTrigger(prev => prev + 1);
    } else {
      refresh();
    }
  };

  const handleQuoteUpdated = (updatedQuote) => {
    updateQuote(updatedQuote);
    setSelectedQuote(updatedQuote);
  };

  const getHeaderDetails = () => {
    switch (activeSection) {
      case 'orders':
        return {
          title: 'Catalog Order Desk',
          subtitle: 'Manage e-commerce checkout purchases and process delivery invoices'
        };
      case 'catalog':
        return {
          title: 'Catalog Product Manager',
          subtitle: 'Add new products, upload images, set prices and update specifications'
        };
      default:
        return {
          title: 'Print Farm Manager',
          subtitle: 'Review CAD submissions · Set quotes · Track requests'
        };
    }
  };

  const headerInfo = getHeaderDetails();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={(section) => {
          setActiveSection(section);
          setSelectedQuote(null);
        }}
        onLogout={onLogout}
        quoteCount={quotes.filter(q => q.type !== 'order' && (q.status === 'Pending' || q.status === 'Quoted')).length}
        orderCount={quotes.filter(q => q.type === 'order' || q.status === 'Approved').length}
      />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Top Bar */}
        <header style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexShrink: 0,
          background: '#ffffff'
        }}>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.01em', margin: 0 }}>
              {headerInfo.title}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '3px', margin: 0, fontWeight: '500' }}>
              {headerInfo.subtitle}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="pulse-dot" />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Live</span>
            </div>
            <button
              onClick={handleRefreshClick}
              className="btn btn-secondary"
              style={{ height: '34px', fontSize: '0.75rem', padding: '0 0.9rem', borderRadius: '8px' }}
              disabled={activeSection === 'catalog' ? catalogLoading : loading}
              id="refresh-btn"
            >
              {activeSection === 'catalog' ? (
                catalogLoading ? <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> : '↺'
              ) : (
                loading ? <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> : '↺'
              )} Refresh
            </button>
            
            {/* Notification Bell Badge with Dynamic Dropdown */}
            <div 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ 
                position: 'relative', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                background: showNotifications ? '#e2e8f0' : '#f1f5f9', 
                border: '1px solid #e2e8f0', 
                color: '#475569',
                transition: 'all 0.2s ease'
              }}
              id="notification-bell"
            >
              <Bell size={16} />
              {pendingQuotes.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.58rem',
                  fontWeight: '800',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 0 2px #ffffff'
                }}>
                  {pendingQuotes.length}
                </span>
              )}

              {/* Dropdown panel */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '44px',
                  right: '0',
                  width: '300px',
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  zIndex: 100,
                  overflow: 'hidden',
                  cursor: 'default'
                }}
                onClick={(e) => e.stopPropagation()}
                className="animate-fadeIn"
                >
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>Pending Actions</span>
                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '10px', fontWeight: 'bold' }}>
                      {pendingQuotes.length} new
                    </span>
                  </div>
                  <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    {pendingQuotes.length === 0 ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        🎉 All caught up! No pending requests.
                      </div>
                    ) : (
                      pendingQuotes.slice(0, 5).map((q) => (
                        <div 
                          key={q.id}
                          onClick={() => {
                            if (q.type === 'order') {
                              setActiveSection('orders');
                            } else {
                              setActiveSection('quotes');
                            }
                            setSelectedQuote(q);
                            setShowNotifications(false);
                          }}
                          style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            textAlign: 'left'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{q.id}</span>
                            <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: '#f1f5f9', color: '#475569', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '700' }}>
                              {q.type}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: '600' }}>{q.customer_name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {q.type === 'slicer' ? `CAD: ${q.file_name}` : q.type === 'order' ? 'Pre-made Product Order' : `Custom Request`}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  {pendingQuotes.length > 5 && (
                    <div 
                      onClick={() => {
                        setActiveSection('quotes');
                        setShowNotifications(false);
                      }}
                      style={{ padding: '0.6rem', textAlign: 'center', fontSize: '0.72rem', color: 'var(--accent-cyan)', borderTop: '1px solid var(--border-color)', fontWeight: 'bold', cursor: 'pointer', background: '#f8fafc' }}
                    >
                      View all pending requests ({pendingQuotes.length})
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Stats Bar */}
        {activeSection === 'quotes' && <StatsBar quotes={quotes.filter(q => q.type !== 'order')} mode="quotes" />}
        {activeSection === 'orders' && <StatsBar quotes={quotes.filter(q => q.type === 'order')} mode="orders" />}

        {/* Error Banner */}
        {error && (
          <div style={{
            margin: '0 1.75rem',
            padding: '0.75rem 1rem',
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-amber)',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⚠ {error}. Make sure the backend server is running: <code style={{ fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '4px' }}>npm run server</code> in <code style={{ fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '4px' }}>d:\zylix\backend</code>
          </div>
        )}

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {activeSection === 'catalog' ? (
            <div style={{ flex: 1, overflow: 'auto', padding: '1.25rem 1.75rem' }}>
              <ProductsManager refreshTrigger={catalogRefreshTrigger} onLoadingChange={setCatalogLoading} />
            </div>
          ) : (
            <>
              {/* Quotes / Orders table */}
              <div style={{ flex: 1, overflow: 'auto', padding: '1.25rem 1.75rem' }}>
                <QuotesTable
                  quotes={activeSection === 'quotes' ? quotes.filter(q => q.type !== 'order' && q.status !== 'Approved') : quotes.filter(q => q.type === 'order' || q.status === 'Approved')}
                  loading={loading}
                  selectedQuote={selectedQuote}
                  onSelectQuote={handleSelectQuote}
                  onUpdateQuote={updateQuote}
                  mode={activeSection === 'quotes' ? 'quotes' : 'orders'}
                />
              </div>

              {/* Side Drawer */}
              {selectedQuote && (
                <QuoteDrawer
                  quote={selectedQuote}
                  onClose={handleCloseDrawer}
                  onUpdated={handleQuoteUpdated}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
