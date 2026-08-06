import React, { useState, useEffect } from 'react';
import { 
  Palette, Plus, Trash2, Check, AlertCircle, RefreshCw, Layers, Box,
  Sparkles, Sliders, ToggleLeft, ToggleRight, Eye, EyeOff, Save, Edit, X
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const DEFAULT_SETTINGS = {
  productTypes: [
    { id: 'keychain', label: '🔑 3D Custom Keychain', description: 'Custom text keychain with metallic split ring and contoured base', enabled: true },
    { id: 'nameboard', label: '🪧 3D Name Board / Plaque', description: 'Standing or wall-mountable 3D nameplate with custom font', enabled: true },
    { id: 'phonestand', label: '📱 Phone Stand / Holder', description: 'Ergonomic 3D printed desk phone stand', enabled: true },
    { id: 'trophy', label: '🏆 Custom Trophy / Award', description: 'Customized recognition award & trophy', enabled: true },
    { id: 'other', label: '⚙️ Other Custom Design', description: 'Upload a sketch or describe your custom 3D idea', enabled: true }
  ],
  textColors: [
    { name: 'Gold', hex: '#f59e0b' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Red', hex: '#ef4444' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Green', hex: '#10b981' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Black', hex: '#1e293b' }
  ],
  baseColors: [
    { name: 'Black', hex: '#0f172a' },
    { name: 'White', hex: '#f8fafc' },
    { name: 'Red', hex: '#991b1b' },
    { name: 'Navy', hex: '#1e3a8a' },
    { name: 'Gold', hex: '#d97706' }
  ],
  slicerMaterials: ['PLA', 'PETG', 'ABS', 'Resin', 'Wood', 'PP', 'PET'],
  slicerColors: ['Matte Black', 'Pure White', 'Signal Red', 'Navy Blue', 'Metallic Silver', 'Golden Yellow', 'Forest Green'],
  prototypeTypes: ['School Project', 'College Project', 'Startup Prototype', 'Research Model', 'Architecture Model', 'Robotics Project', 'Science Model', 'Other'],
  enabledLabTabs: {
    slicer: true,
    designer: true,
    prototype: true
  }
};

export default function LabSettingsManager() {
  const [activeTab, setActiveTab] = useState('colors'); // 'colors' | 'products' | 'slicer'
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Inputs for Color Swatches
  const [newTextColorName, setNewTextColorName] = useState('');
  const [newTextColorHex, setNewTextColorHex] = useState('#2563eb');
  const [newBaseColorName, setNewBaseColorName] = useState('');
  const [newBaseColorHex, setNewBaseColorHex] = useState('#0f172a');

  // Inputs for Product Types
  const [newProdLabel, setNewProdLabel] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [editingProdId, setEditingProdId] = useState(null);
  const [editProdLabel, setEditProdLabel] = useState('');
  const [editProdDesc, setEditProdDesc] = useState('');

  // Inputs for Slicer Materials & Colors & Prototype Options
  const [newMatName, setNewMatName] = useState('');
  const [newPrintColorName, setNewPrintColorName] = useState('');
  const [newPrototypeTypeName, setNewPrototypeTypeName] = useState('');

  useEffect(() => {
    fetchLabSettings();
  }, []);

  const fetchLabSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/lab-settings`);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          setSettings({
            productTypes: data.productTypes || DEFAULT_SETTINGS.productTypes,
            textColors: data.textColors || DEFAULT_SETTINGS.textColors,
            baseColors: data.baseColors || DEFAULT_SETTINGS.baseColors,
            slicerMaterials: data.slicerMaterials || DEFAULT_SETTINGS.slicerMaterials,
            slicerColors: data.slicerColors || DEFAULT_SETTINGS.slicerColors,
            prototypeTypes: data.prototypeTypes || DEFAULT_SETTINGS.prototypeTypes,
            enabledLabTabs: data.enabledLabTabs || DEFAULT_SETTINGS.enabledLabTabs
          });
        }
      }
    } catch (err) {
      console.error('Fetch lab settings error:', err);
      setError('Using default settings. Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (updatedSettings = settings) => {
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/lab-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
      if (!res.ok) throw new Error(`Failed to save settings (${res.status})`);
      setSuccessMsg('3D Lab configuration saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Save lab settings error:', err);
      setError(err.message || 'Error saving lab configuration.');
    } finally {
      setSaving(false);
    }
  };

  // --- 1. COLOR SWATCH HANDLERS ---
  const addTextColor = () => {
    if (!newTextColorName.trim()) return setError('Please enter a color name.');
    const newColor = { name: newTextColorName.trim(), hex: newTextColorHex };
    const updated = {
      ...settings,
      textColors: [...settings.textColors, newColor]
    };
    setSettings(updated);
    setNewTextColorName('');
    handleSaveSettings(updated);
  };

  const removeTextColor = (index) => {
    const updated = {
      ...settings,
      textColors: settings.textColors.filter((_, i) => i !== index)
    };
    setSettings(updated);
    handleSaveSettings(updated);
  };

  const addBaseColor = () => {
    if (!newBaseColorName.trim()) return setError('Please enter a base color name.');
    const newColor = { name: newBaseColorName.trim(), hex: newBaseColorHex };
    const updated = {
      ...settings,
      baseColors: [...settings.baseColors, newColor]
    };
    setSettings(updated);
    setNewBaseColorName('');
    handleSaveSettings(updated);
  };

  const removeBaseColor = (index) => {
    const updated = {
      ...settings,
      baseColors: settings.baseColors.filter((_, i) => i !== index)
    };
    setSettings(updated);
    handleSaveSettings(updated);
  };

  // --- 2. PRODUCT TYPE HANDLERS ("What would you like to create?") ---
  const addProductType = () => {
    if (!newProdLabel.trim()) return setError('Please enter a product type label.');
    const id = newProdLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
    const newProd = {
      id: id || `custom_${Date.now()}`,
      label: newProdLabel.trim(),
      description: newProdDesc.trim() || 'Custom 3D printed item',
      enabled: true
    };
    const updated = {
      ...settings,
      productTypes: [...settings.productTypes, newProd]
    };
    setSettings(updated);
    setNewProdLabel('');
    setNewProdDesc('');
    handleSaveSettings(updated);
  };

  const startEditProductType = (prod) => {
    setEditingProdId(prod.id);
    setEditProdLabel(prod.label);
    setEditProdDesc(prod.description || '');
  };

  const saveEditProductType = () => {
    if (!editProdLabel.trim()) return setError('Please enter a label for the product option.');
    const updated = {
      ...settings,
      productTypes: settings.productTypes.map(p => p.id === editingProdId ? {
        ...p,
        label: editProdLabel.trim(),
        description: editProdDesc.trim()
      } : p)
    };
    setSettings(updated);
    setEditingProdId(null);
    setEditProdLabel('');
    setEditProdDesc('');
    handleSaveSettings(updated);
  };

  const cancelEditProductType = () => {
    setEditingProdId(null);
    setEditProdLabel('');
    setEditProdDesc('');
  };

  const toggleProductType = (id) => {
    const updated = {
      ...settings,
      productTypes: settings.productTypes.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
    };
    setSettings(updated);
    handleSaveSettings(updated);
  };

  const removeProductType = (id) => {
    const updated = {
      ...settings,
      productTypes: settings.productTypes.filter(p => p.id !== id)
    };
    setSettings(updated);
    handleSaveSettings(updated);
  };

  // --- 3. SLICER & PROTOTYPE HANDLERS ---
  const addMaterial = () => {
    if (!newMatName.trim()) return setError('Please enter a material name.');
    if (settings.slicerMaterials.includes(newMatName.trim())) return setError('Material already exists.');
    const updated = {
      ...settings,
      slicerMaterials: [...settings.slicerMaterials, newMatName.trim()]
    };
    setSettings(updated);
    setNewMatName('');
    handleSaveSettings(updated);
  };

  const removeMaterial = (mat) => {
    const updated = {
      ...settings,
      slicerMaterials: settings.slicerMaterials.filter(m => m !== mat)
    };
    setSettings(updated);
    handleSaveSettings(updated);
  };

  const addPrintColor = () => {
    if (!newPrintColorName.trim()) return setError('Please enter a print color name.');
    if (settings.slicerColors.includes(newPrintColorName.trim())) return setError('Print color already exists.');
    const updated = {
      ...settings,
      slicerColors: [...settings.slicerColors, newPrintColorName.trim()]
    };
    setSettings(updated);
    setNewPrintColorName('');
    handleSaveSettings(updated);
  };

  const removePrintColor = (c) => {
    const updated = {
      ...settings,
      slicerColors: settings.slicerColors.filter(item => item !== c)
    };
    setSettings(updated);
    handleSaveSettings(updated);
  };

  const addPrototypeType = () => {
    if (!newPrototypeTypeName.trim()) return setError('Please enter a prototype project option label.');
    if (settings.prototypeTypes.includes(newPrototypeTypeName.trim())) return setError('Project option already exists.');
    const updated = {
      ...settings,
      prototypeTypes: [...settings.prototypeTypes, newPrototypeTypeName.trim()]
    };
    setSettings(updated);
    setNewPrototypeTypeName('');
    handleSaveSettings(updated);
  };

  const removePrototypeType = (type) => {
    const updated = {
      ...settings,
      prototypeTypes: settings.prototypeTypes.filter(item => item !== type)
    };
    setSettings(updated);
    handleSaveSettings(updated);
  };

  const toggleLabTab = (tabKey) => {
    const updated = {
      ...settings,
      enabledLabTabs: {
        ...settings.enabledLabTabs,
        [tabKey]: !settings.enabledLabTabs[tabKey]
      }
    };
    setSettings(updated);
    handleSaveSettings(updated);
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <div>Loading 3D Print Lab Configurations...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={22} color="#6366f1" /> 3D Print Lab Console Settings
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Dynamically configure custom product options, color swatches, and CAD slicer materials on the storefront
          </p>
        </div>
        <button
          onClick={() => handleSaveSettings()}
          className="btn btn-primary"
          style={{ height: '40px', padding: '0 1.25rem', fontSize: '0.84rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
          disabled={saving}
        >
          {saving ? <RefreshCw size={15} className="spin" /> : <Save size={15} />}
          {saving ? 'Saving...' : 'Save Configurations'}
        </button>
      </div>

      {/* Toast Alert Messages */}
      {error && (
        <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {successMsg && (
        <div style={{ backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} /> {successMsg}
        </div>
      )}

      {/* Top Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('colors')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '800',
            fontSize: '0.84rem',
            cursor: 'pointer',
            background: activeTab === 'colors' ? '#6366f1' : 'transparent',
            color: activeTab === 'colors' ? '#ffffff' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Palette size={16} /> 1. Design Your Own
        </button>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '800',
            fontSize: '0.84rem',
            cursor: 'pointer',
            background: activeTab === 'products' ? '#6366f1' : 'transparent',
            color: activeTab === 'products' ? '#ffffff' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Box size={16} /> 2. "What Would You Like to Create?" Options
        </button>
        <button
          onClick={() => setActiveTab('slicer')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '800',
            fontSize: '0.84rem',
            cursor: 'pointer',
            background: activeTab === 'slicer' ? '#6366f1' : 'transparent',
            color: activeTab === 'slicer' ? '#ffffff' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Sliders size={16} /> 3. CAD Slicer & Prototype Options
        </button>
      </div>

      {/* SECTION 1: COLOR SWATCHES MANAGER */}
      {activeTab === 'colors' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Text Color Swatches */}
          <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🎨 Text Colors Swatches ({settings.textColors.length})
            </h3>
            
            {/* Add Text Color Form */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <input
                type="color"
                value={newTextColorHex}
                onChange={e => setNewTextColorHex(e.target.value)}
                style={{ width: '38px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'none', padding: 0 }}
                title="Choose Hex Color"
              />
              <input
                type="text"
                className="input-field"
                placeholder="Color Name (e.g. Neon Cyan)"
                value={newTextColorName}
                onChange={e => setNewTextColorName(e.target.value)}
                style={{ flex: 1, height: '36px', fontSize: '0.8rem' }}
              />
              <button
                onClick={addTextColor}
                className="btn btn-primary"
                style={{ height: '36px', padding: '0 1rem', fontSize: '0.78rem', fontWeight: '800' }}
              >
                + Add Color
              </button>
            </div>

            {/* List of Text Colors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
              {settings.textColors.map((col, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: col.hex, border: '1px solid rgba(0,0,0,0.15)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                    <span style={{ fontWeight: '700', fontSize: '0.84rem', color: '#1e293b' }}>{col.name}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>({col.hex})</span>
                  </div>
                  <button
                    onClick={() => removeTextColor(idx)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    title="Remove Color"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Base Contour Color Swatches */}
          <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🛡️ Base Contour Colors ({settings.baseColors.length})
            </h3>
            
            {/* Add Base Color Form */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <input
                type="color"
                value={newBaseColorHex}
                onChange={e => setNewBaseColorHex(e.target.value)}
                style={{ width: '38px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'none', padding: 0 }}
                title="Choose Hex Color"
              />
              <input
                type="text"
                className="input-field"
                placeholder="Base Color Name (e.g. Matte Gray)"
                value={newBaseColorName}
                onChange={e => setNewBaseColorName(e.target.value)}
                style={{ flex: 1, height: '36px', fontSize: '0.8rem' }}
              />
              <button
                onClick={addBaseColor}
                className="btn btn-primary"
                style={{ height: '36px', padding: '0 1rem', fontSize: '0.78rem', fontWeight: '800' }}
              >
                + Add Base Color
              </button>
            </div>

            {/* List of Base Colors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
              {settings.baseColors.map((col, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: col.hex, border: '1px solid rgba(0,0,0,0.15)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                    <span style={{ fontWeight: '700', fontSize: '0.84rem', color: '#1e293b' }}>{col.name}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>({col.hex})</span>
                  </div>
                  <button
                    onClick={() => removeBaseColor(idx)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    title="Remove Color"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SECTION 2: PRODUCT TYPES MANAGER ("What would you like to create?") */}
      {activeTab === 'products' && (
        <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>
            🛍️ "What Would You Like to Create?" Options ({settings.productTypes.length})
          </h3>

          {/* Add Product Type Form */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '10px', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Option Label "
              value={newProdLabel}
              onChange={e => setNewProdLabel(e.target.value)}
              style={{ height: '38px', fontSize: '0.82rem' }}
            />
            <input
              type="text"
              className="input-field"
              placeholder="Description (e.g. Custom room door name plaque)"
              value={newProdDesc}
              onChange={e => setNewProdDesc(e.target.value)}
              style={{ height: '38px', fontSize: '0.82rem' }}
            />
            <button
              onClick={addProductType}
              className="btn btn-primary"
              style={{ height: '38px', padding: '0 1.25rem', fontSize: '0.8rem', fontWeight: '800' }}
            >
              + Add Product Option
            </button>
          </div>

          {/* Product Types List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {settings.productTypes.map(prod => {
              const isEditing = editingProdId === prod.id;
              
              if (isEditing) {
                return (
                  <div key={prod.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0.85rem 1rem', background: '#eff6ff', borderRadius: '10px', border: '1.5px solid #3b82f6' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#1e40af' }}>Editing Option: {prod.id}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                      <input
                        type="text"
                        className="input-field"
                        value={editProdLabel}
                        onChange={e => setEditProdLabel(e.target.value)}
                        placeholder="Option Label"
                        style={{ height: '36px', fontSize: '0.82rem' }}
                      />
                      <input
                        type="text"
                        className="input-field"
                        value={editProdDesc}
                        onChange={e => setEditProdDesc(e.target.value)}
                        placeholder="Description"
                        style={{ height: '36px', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <button
                        onClick={cancelEditProductType}
                        className="btn btn-secondary"
                        style={{ height: '32px', padding: '0 0.85rem', fontSize: '0.75rem' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEditProductType}
                        className="btn btn-primary"
                        style={{ height: '32px', padding: '0 1rem', fontSize: '0.75rem', fontWeight: '800' }}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={prod.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: prod.enabled ? '#f8fafc' : '#f1f5f9', borderRadius: '10px', border: '1px solid #e2e8f0', opacity: prod.enabled ? 1 : 0.6 }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {prod.label}
                      {!prod.enabled && <span style={{ fontSize: '0.65rem', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#64748b' }}>Disabled</span>}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{prod.description}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => toggleProductType(prod.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: prod.enabled ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: '700' }}
                      title={prod.enabled ? 'Disable Option' : 'Enable Option'}
                    >
                      {prod.enabled ? <ToggleRight size={22} color="#10b981" /> : <ToggleLeft size={22} color="#94a3b8" />}
                      {prod.enabled ? 'Active' : 'Hidden'}
                    </button>

                    <button
                      onClick={() => startEditProductType(prod)}
                      style={{ background: '#e2e8f0', border: 'none', color: '#1e293b', borderRadius: '6px', cursor: 'pointer', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700' }}
                      title="Edit Option"
                    >
                      <Edit size={14} /> Edit
                    </button>

                    <button
                      onClick={() => removeProductType(prod.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      title="Delete Option"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: SLICER & PROTOTYPE OPTIONS */}
      {activeTab === 'slicer' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Materials List */}
          <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>
              🧪 3D Printing Materials ({settings.slicerMaterials.length})
            </h3>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
              <input
                type="text"
                className="input-field"
                placeholder="New Material (e.g. Carbon Fiber PLA)"
                value={newMatName}
                onChange={e => setNewMatName(e.target.value)}
                style={{ flex: 1, height: '36px', fontSize: '0.8rem' }}
              />
              <button onClick={addMaterial} className="btn btn-primary" style={{ height: '36px', padding: '0 1rem', fontSize: '0.78rem' }}>+ Add</button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {settings.slicerMaterials.map((mat, idx) => (
                <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', color: '#1d4ed8' }}>
                  {mat}
                  <button onClick={() => removeMaterial(mat)} style={{ background: 'none', border: 'none', color: '#1d4ed8', cursor: 'pointer', padding: 0 }}><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Slicer Filament Colors */}
          <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>
              🎨 Material Colors ({settings.slicerColors.length})
            </h3>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
              <input
                type="text"
                className="input-field"
                placeholder="New Color (e.g. Neon Orange)"
                value={newPrintColorName}
                onChange={e => setNewPrintColorName(e.target.value)}
                style={{ flex: 1, height: '36px', fontSize: '0.8rem' }}
              />
              <button onClick={addPrintColor} className="btn btn-primary" style={{ height: '36px', padding: '0 1rem', fontSize: '0.78rem' }}>+ Add</button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {settings.slicerColors.map((col, idx) => (
                <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>
                  {col}
                  <button onClick={() => removePrintColor(col)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Prototype Building Project Options ("What are you building?") */}
          <div style={{ gridColumn: 'span 2', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>
              🏗️ "What are you building?" Prototype Options ({(settings.prototypeTypes || []).length})
            </h3>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', maxWidth: '500px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="New Option (e.g. Drone Frame, IoT Enclosure)"
                value={newPrototypeTypeName}
                onChange={e => setNewPrototypeTypeName(e.target.value)}
                style={{ flex: 1, height: '36px', fontSize: '0.8rem' }}
              />
              <button onClick={addPrototypeType} className="btn btn-primary" style={{ height: '36px', padding: '0 1rem', fontSize: '0.78rem' }}>+ Add Option</button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(settings.prototypeTypes || []).map((type, idx) => (
                <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>
                  <span>{type}</span>
                  <button onClick={() => removePrototypeType(type)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }} title="Delete Option"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
