import React, { useState } from 'react';
import { X, User, Mail, Phone, Download, CheckCircle, XCircle } from 'lucide-react';

const API_BASE = '/api';

export default function QuoteDrawer({ quote, onClose, onUpdated }) {
  const [editPrice, setEditPrice] = useState(quote.price_estimate?.toString() || '');
  const [editNotes, setEditNotes] = useState(quote.admin_notes || '');
  const [editStatus, setEditStatus] = useState(quote.status || 'Pending');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');
  const [validationError, setValidationError] = useState('');

  // Sync state when quote changes
  React.useEffect(() => {
    setEditPrice(quote.price_estimate?.toString() || '');
    setEditNotes(quote.admin_notes || '');
    setEditStatus(quote.status || '');
    setUpdateMsg('');
    setValidationError('');
  }, [quote.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!editStatus) {
      setValidationError('Please select a valid order status.');
      return;
    }

    // Validation: Pending requests must be updated to another status to save
    if (quote.status === 'Pending' && editStatus === 'Pending') {
      setValidationError('To process this request, you must enter a quote amount and change the status to Quoted, Approved, or Declined.');
      return;
    }

    const parsedPrice = editPrice ? parseFloat(editPrice) : null;

    // Validation: Quoted or Approved status requires a valid price estimate > 0
    if ((editStatus === 'Quoted' || editStatus === 'Approved') && (parsedPrice === null || isNaN(parsedPrice) || parsedPrice <= 0)) {
      setValidationError('A valid Price Estimate (> ₹0) is required to Quote or Approve this order.');
      return;
    }

    setUpdating(true);
    setUpdateMsg('');
    try {
      const res = await fetch(`${API_BASE}/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          price_estimate: parsedPrice,
          admin_notes: editNotes
        })
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.success) {
        onUpdated(data.quote);
        setUpdateMsg('success');
      }
    } catch (err) {
      setUpdateMsg('error');
      console.error(err);
    } finally {
      setUpdating(false);
      setTimeout(() => setUpdateMsg(''), 3500);
    }
  };

  const isImage = quote.file_name?.match(/\.(jpeg|jpg|gif|png|webp)$/i);

  return (
    <div
      className="animate-fadeIn"
      style={{
        width: '340px',
        flexShrink: 0,
        borderLeft: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Drawer Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky', top: 0,
        background: 'var(--bg-secondary)',
        zIndex: 1
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>INSPECT ORDER</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: '700', color: 'var(--accent-cyan)', marginTop: '2px' }}>
            {quote.id}
          </div>
        </div>
        <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px', height: '32px', width: '32px', borderRadius: '8px' }} id="close-drawer-btn">
          <X size={15} />
        </button>
      </div>

      {/* Client Info */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>Client</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.92rem' }}>
            <User size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            {quote.customer_name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Mail size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            {quote.customer_email}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Phone size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            {quote.customer_phone || 'Not provided'}
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Order Details</div>
        
        <DetailRow label="Submission Type">
          {quote.type === 'slicer' ? 'CAD Upload Slicer' : quote.type === 'designer' ? 'Design Concept' : quote.type === 'spareparts' ? 'Spare Part Re-creation' : quote.type === 'prototype' ? 'Prototype Lab' : quote.type === 'order' ? 'Pre-made Catalog Purchase' : 'Custom Request'}
        </DetailRow>

        {quote.type === 'slicer' && (
          <>
            <DetailRow label="Material">{quote.material}</DetailRow>
            <DetailRow label="Color">{quote.color}</DetailRow>
            <DetailRow label="Quantity">{quote.quantity} pcs</DetailRow>
          </>
        )}

        {quote.type === 'designer' && (
          <>
            <DetailRow label="Product Type">
              {quote.extra_data?.productType === 'other' ? quote.extra_data?.customProductType : quote.extra_data?.productType}
            </DetailRow>
            <DetailRow label="Custom Text">{quote.extra_data?.nameText || 'None'}</DetailRow>
            <DetailRow label="Size">{quote.extra_data?.designerSize || 'Medium'}</DetailRow>
            <DetailRow label="Color">{quote.color}</DetailRow>
          </>
        )}

        {quote.type === 'spareparts' && (
          <>
            <DetailRow label="Part Name">{quote.extra_data?.partName}</DetailRow>
            {quote.extra_data?.dimensions && (
              <DetailRow label="Approx. Size">
                {quote.extra_data.dimensions.length} × {quote.extra_data.dimensions.width} × {quote.extra_data.dimensions.height} mm
              </DetailRow>
            )}
          </>
        )}

        {quote.type === 'prototype' && (
          <>
            <DetailRow label="Project Name">{quote.extra_data?.projectName}</DetailRow>
            <DetailRow label="Project Type">{quote.extra_data?.projectType}</DetailRow>
            <DetailRow label="Required Date">{quote.extra_data?.requiredDate}</DetailRow>
            <DetailRow label="Quantity">{quote.quantity} pcs</DetailRow>
          </>
        )}

        {quote.type === 'order' && (
          <>
            <DetailRow label="Order Total">₹{(quote.price_estimate || 0).toLocaleString('en-IN')}</DetailRow>
            <DetailRow label="Receipt Ref">{quote.extra_data?.receiptId}</DetailRow>
            {quote.extra_data?.shippingAddress && (
              <DetailRow label="Shipping Address">{quote.extra_data.shippingAddress}</DetailRow>
            )}
            <div style={{ marginTop: '0.65rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.65rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Items Bought</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {quote.extra_data?.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-primary)', padding: '4px 8px', background: 'var(--bg-primary)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <span>{item.name} <strong>x{item.quantity}</strong></span>
                    <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {quote.notes && (
          <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid var(--text-muted)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Client Notes</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{quote.notes}"</div>
          </div>
        )}
      </div>

      {/* Files */}
      {quote.extra_data?.files && quote.extra_data.files.length > 0 ? (
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>Uploaded Assets</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {quote.extra_data.files.map((fileObj, idx) => {
              const isImg = fileObj.fileName?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
              return (
                <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', background: '#f8fafc' }}>
                  {isImg && (
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.4rem', maxHeight: '100px' }}>
                      <img src={fileObj.fileUrl} alt={fileObj.fileName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  )}
                  <a
                    href={fileObj.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: '0.82rem', height: '28px', textDecoration: 'none', justifyContent: 'center' }}
                  >
                    <Download size={10} /> Download {fileObj.fileName.length > 18 ? fileObj.fileName.substring(0, 18) + '…' : fileObj.fileName}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      ) : quote.file_url ? (
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>Uploaded Asset</div>
          {isImage && (
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '0.6rem', maxHeight: '150px' }}>
              <img src={quote.file_url} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          )}
          <a
            href={quote.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: '0.88rem', height: '34px', textDecoration: 'none', justifyContent: 'center' }}
          >
            <Download size={12} /> Download {quote.file_name}
          </a>
        </div>
      ) : null}

      {/* Update Form */}
      <form onSubmit={handleSubmit} style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>
          Update Order
        </div>

        {/* Price */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Price Estimate (₹)</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '700' }}>₹</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 450"
              value={editPrice}
              onChange={e => setEditPrice(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '26px', height: '36px', fontSize: '0.92rem' }}
              id="quote-price-input"
            />
          </div>
        </div>

        {/* Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Status</label>
          <select
            value={editStatus}
            onChange={e => setEditStatus(e.target.value)}
            className="select-field"
            style={{ height: '36px', fontSize: '0.92rem' }}
            id="quote-status-select"
          >
            <option value="Pending">⏳ Pending – Reviewing file</option>
            <option value="Quoted">💰 Quoted – Price sent</option>
            <option value="Approved">✅ Approved – In Production</option>
            <option value="Declined">❌ Declined – Cancelled</option>
          </select>
        </div>

        {/* Admin Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Engineer Notes</label>
          <textarea
            rows={3}
            value={editNotes}
            onChange={e => setEditNotes(e.target.value)}
            placeholder="Notes for internal tracking or customer feedback..."
            className="input-field"
            style={{ fontSize: '0.88rem', padding: '0.55rem 0.9rem', resize: 'none' }}
            id="quote-notes-input"
          />
        </div>

        {/* Feedback */}
        {validationError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', fontSize: '0.8rem', fontWeight: '600' }}>
            <XCircle size={14} style={{ flexShrink: 0 }} /> {validationError}
          </div>
        )}
        {updateMsg === 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontSize: '0.88rem', fontWeight: '600' }}>
            <CheckCircle size={14} /> Order updated successfully!
          </div>
        )}
        {updateMsg === 'error' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', fontSize: '0.88rem', fontWeight: '600' }}>
            <XCircle size={14} /> Update failed. Check server connection.
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', height: '40px', fontSize: '0.88rem' }}
          disabled={updating}
          id="submit-quote-btn"
        >
          {updating ? <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> Saving...</> : 'Submit Quote & Status'}
        </button>
      </form>
    </div>
  );
}

function DetailRow({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', padding: '0.3rem 0', borderBottom: '1px solid var(--border-color)' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: '500', textAlign: 'right' }}>{children}</span>
    </div>
  );
}
