import React, { useState, useEffect } from 'react';
import { 
  Package, Trash2, Plus, X, Upload, Check, AlertCircle, RefreshCw, Edit, SlidersHorizontal,
  Sparkles, Box, Key, Smile, Lightbulb, PenTool, Gift, Image, 
  Wrench, Shield, Compass, Palette
} from 'lucide-react';

const STATIC_CATEGORIES = [
  { id: 'keychains', label: 'Custom Keychains', icon: 'Key' },
  { id: 'miniatures', label: 'Custom Miniature', icon: 'Sparkles' },
  { id: 'holders', label: '3D Printed Holders', icon: 'Box' },
  { id: 'lightbox', label: 'Light Box', icon: 'Lightbulb' },
  { id: 'masks', label: '3D Mask', icon: 'Smile' },
  { id: 'stencils', label: 'Stencil', icon: 'PenTool' },
  { id: 'gifts', label: 'Gifts', icon: 'Gift' },
  { id: 'wallart', label: 'Wall Art', icon: 'Image' }
];

const iconMap = {
  Sparkles, Box, Key, Smile, Lightbulb, PenTool, Gift, Image, 
  Wrench, Shield, Compass, Palette, Package
};

const DEFAULT_MATERIALS = ['PLA', 'PETG', 'ABS', 'Resin', 'Wood', 'PP', 'PET'];

const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  // If it starts with /uploads, it's a backend file path (port 5000)
  if (url.startsWith('/uploads')) {
    return `http://localhost:5000${url}`;
  }
  // Otherwise, it's a storefront asset, so load from storefront (port 5173)
  return `http://localhost:5173${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function ProductsManager({ refreshTrigger = 0, onLoadingChange }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Sync loading state with parent
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(loading);
    }
  }, [loading, onLoadingChange]);

  // Categories Panel & Form State
  const [categories, setCategories] = useState(STATIC_CATEGORIES);
  const [showCategoriesPanel, setShowCategoriesPanel] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Sparkles');
  const [catImageFile, setCatImageFile] = useState(null);
  const [catImagePreview, setCatImagePreview] = useState('');
  const [submittingCat, setSubmittingCat] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('keychains');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [badge, setBadge] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState(['PLA']);
  const [availableMaterials, setAvailableMaterials] = useState(() => {
    const saved = localStorage.getItem('zylix_available_materials');
    return saved ? JSON.parse(saved) : DEFAULT_MATERIALS;
  });
  const [customMaterial, setCustomMaterial] = useState('');
  const [specs, setSpecs] = useState([
    { key: 'Material', value: 'PLA' },
    { key: 'Size', value: '' }
  ]);
  const [inStock, setInStock] = useState(true);
  const didFetch = React.useRef(false);

  useEffect(() => {
    // Prevent double fetches on StrictMode mount
    if (didFetch.current && refreshTrigger === 0) return;
    didFetch.current = true;

    fetchProducts();
    fetchCategories();
  }, [refreshTrigger]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error(`Server returned error: ${res.status}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setCategories(data);
        // Only set default if current category is not in the new list
        setCategory(prev => {
          const stillExists = data.some(c => c.id === prev);
          return stillExists ? prev : data[0].id;
        });
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error(`Server returned error: ${res.status}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Fetch products error:', err);
      setError('Could not connect to the backend server to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCatFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCatImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCatImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!newCatName.trim()) return setError('Category name is required.');
    
    // Uniqueness validation
    const normalizedId = newCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const exists = categories.some(c => c.id === normalizedId);
    if (exists) {
      return setError('A category with this name or ID already exists.');
    }
    
    if (!catImageFile) return setError('Please upload a cover image for the category.');

    setSubmittingCat(true);
    try {
      const formData = new FormData();
      formData.append('name', newCatName.trim());
      formData.append('icon', newCatIcon);
      formData.append('image', catImageFile);

      const res = await fetch('/api/categories', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Error creating category: ${res.status}`);
      }

      const responseData = await res.json();
      setSuccessMsg('Category added successfully!');
      
      if (responseData.category) {
        setCategories(prev => [...prev, responseData.category].sort((a, b) => a.label.localeCompare(b.label)));
      } else {
        fetchCategories();
      }

      // Reset Form
      setNewCatName('');
      setNewCatIcon('Sparkles');
      setCatImageFile(null);
      setCatImagePreview('');

      // Auto-clear success message
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while creating the category.');
    } finally {
      setSubmittingCat(false);
    }
  };

  const handleCategoryDelete = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category? All products under this category might lose their grouping.')) return;

    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/categories/${catId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Delete failed: ${res.status}`);
      }

      setCategories(prev => prev.filter(c => c.id !== catId));
      setSuccessMsg('Category deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not delete category.');
    }
  };

  const handleMaterialToggle = (material) => {
    setSelectedMaterials(prev =>
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  const addSpecField = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const removeSpecField = (index) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const handleStartEdit = (prod) => {
    setError('');
    setSuccessMsg('');
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category);
    setPrice(prod.price);
    setOriginalPrice(prod.originalPrice || '');
    setBadge(prod.badge || '');
    setDescription(prod.description || '');
    setImagePreview(prod.image || '');
    setImageFile(null);
    
    const prodMats = prod.materials || ['PLA'];
    setSelectedMaterials(prodMats);
    setAvailableMaterials(prev => {
      const updated = [...prev];
      let changed = false;
      prodMats.forEach(m => {
        if (m && !updated.includes(m)) {
          updated.push(m);
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem('zylix_available_materials', JSON.stringify(updated));
      }
      return updated;
    });
    
    // Parse specs
    const specsArray = [];
    if (prod.specs && typeof prod.specs === 'object') {
      Object.entries(prod.specs).forEach(([k, v]) => {
        specsArray.push({ key: k, value: String(v) });
      });
    }
    if (specsArray.length === 0) {
      specsArray.push({ key: 'Material', value: 'PLA' }, { key: 'Size', value: '' });
    }
    setSpecs(specsArray);
    setInStock(prod.inStock !== false);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setName('');
    if (categories && categories.length > 0) {
      setCategory(categories[0].id);
    } else {
      setCategory('keychains');
    }
    setPrice('');
    setOriginalPrice('');
    setBadge('');
    setDescription('');
    setImageFile(null);
    setImagePreview('');
    setSelectedMaterials(['PLA']);
    setSpecs([
      { key: 'Material', value: 'PLA' },
      { key: 'Size', value: '' }
    ]);
    setInStock(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) return setError('Product name is required.');
    if (!price || parseFloat(price) <= 0) return setError('Please enter a valid price.');
    
    // MRP vs Selling Price validation
    if (originalPrice && parseFloat(originalPrice) <= parseFloat(price)) {
      return setError('Original Price (MRP) must be greater than the Selling Price for discounts to apply.');
    }
    
    // Asset presence validation
    if (!editingProduct && !imageFile) {
      return setError('Product cover image file is required.');
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('category', category);
      
      const catLabel = categories.find(c => c.id === category)?.label || category;
      formData.append('categoryLabel', catLabel);
      
      formData.append('price', price);
      if (originalPrice) {
        formData.append('originalPrice', originalPrice);
        // Calculate discount % automatically
        const pVal = parseFloat(price);
        const opVal = parseFloat(originalPrice);
        if (opVal > pVal) {
          const discountPct = Math.round(((opVal - pVal) / opVal) * 100);
          formData.append('discount', discountPct);
        }
      }
      
      formData.append('badge', badge.trim());
      formData.append('description', description.trim());
      formData.append('inStock', String(inStock));
      formData.append('materials', JSON.stringify(selectedMaterials));

      // Build specs object
      const specsObj = {};
      specs.forEach(item => {
        if (item.key.trim() && item.value.trim()) {
          specsObj[item.key.trim()] = item.value.trim();
        }
      });
      formData.append('specs', JSON.stringify(specsObj));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Error processing product: ${res.status}`);
      }

      const responseData = await res.json();
      setSuccessMsg(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
      
      // Update state
      if (responseData.product) {
        if (editingProduct) {
          setProducts(prev => prev.map(p => p.id === responseData.product.id ? responseData.product : p));
        } else {
          setProducts(prev => [...prev, responseData.product]);
        }
      } else {
        fetchProducts(); // Refresh list just in case
      }

      resetForm();
      setShowAddForm(false);
      
      // Auto-clear success message
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while creating the product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Delete failed: ${res.status}`);
      }

      setProducts(prev => prev.filter(p => p.id !== productId));
      setSuccessMsg('Product deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not delete product.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.25s ease' }}>
      
      {/* Top Banner Notifications */}
      {error && (
        <div className="animate-fadeIn" style={{
          padding: '0.8rem 1rem',
          background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.2)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--accent-red)',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="animate-fadeIn" style={{
          padding: '0.8rem 1rem',
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--accent-green)',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Action Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={18} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
            Total Catalog Items: {products.length}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => {
              setShowCategoriesPanel(!showCategoriesPanel);
              setShowAddForm(false);
              setError('');
              setSuccessMsg('');
            }}
            className="btn btn-secondary"
            style={{ height: '36px', fontSize: '0.78rem', gap: '4px', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
            id="toggle-categories-btn"
          >
            <SlidersHorizontal size={14} />
            {showCategoriesPanel ? 'View Products Inventory' : 'Manage Categories'}
          </button>
          {!showCategoriesPanel && (
            <button
              type="button"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setError('');
                setSuccessMsg('');
              }}
              className="btn btn-primary"
              style={{ height: '36px', fontSize: '0.78rem', gap: '4px' }}
              id="toggle-add-product-btn"
            >
              {showAddForm ? <X size={14} /> : <Plus size={14} />}
              {showAddForm ? 'Cancel Form' : 'Add New Product'}
            </button>
          )}
        </div>
      </div>

      {/* CATEGORY MANAGEMENT PANEL */}
      {showCategoriesPanel && (
        <div className="card animate-fadeIn" style={{ padding: '1.5rem', background: '#ffffff', display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* Left Column: Add Category Form */}
          <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.25rem', marginTop: 0 }}>
              Create New Category
            </h3>
            <form onSubmit={handleCategorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} id="add-category-form">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label htmlFor="cat-name" style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Category Name *</label>
                <input
                  id="cat-name"
                  type="text"
                  className="input-field"
                  placeholder="e.g. Mechanical Gears"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label htmlFor="cat-icon" style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Lucide Icon Selection *</label>
                <select
                  id="cat-icon"
                  className="select-field"
                  value={newCatIcon}
                  onChange={e => setNewCatIcon(e.target.value)}
                >
                  <option value="Sparkles">Sparkles ✨</option>
                  <option value="Box">Box 📦</option>
                  <option value="Key">Key 🔑</option>
                  <option value="Smile">Smile 😊</option>
                  <option value="Lightbulb">Lightbulb 💡</option>
                  <option value="PenTool">Pen Tool ✒️</option>
                  <option value="Gift">Gift 🎁</option>
                  <option value="Image">Image 🖼️</option>
                  <option value="Wrench">Wrench 🔧</option>
                  <option value="Shield">Shield 🛡️</option>
                  <option value="Compass">Compass 🧭</option>
                  <option value="Palette">Palette 🎨</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Category Cover Image *</label>
                <div style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  textAlign: 'center',
                  background: 'var(--bg-secondary)',
                  cursor: 'pointer',
                  position: 'relative',
                  minHeight: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition)'
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCatFileChange}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                    required={!catImagePreview}
                    id="cat-image-file"
                  />
                  {catImagePreview ? (
                    <img 
                      src={catImagePreview}
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: '4px', objectFit: 'contain' }} 
                    />
                  ) : (
                    <>
                      <Upload size={20} style={{ color: 'var(--text-muted)', marginBottom: '6px' }} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Click/Drag Image</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>PNG, JPG or WEBP</span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ height: '38px', fontSize: '0.8rem', marginTop: '0.5rem' }}
                disabled={submittingCat}
              >
                {submittingCat ? 'Creating Category...' : 'Publish Category'}
              </button>
            </form>
          </div>

          {/* Right Column: Categories List */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.25rem', marginTop: 0 }}>
              Active Catalog Categories ({categories.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {categories.map(cat => {
                const IconComponent = iconMap[cat.icon] || Package;
                return (
                  <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', transition: 'all 0.2s' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '6px', overflow: 'hidden', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                      {cat.img ? (
                        <img 
                          src={resolveImageUrl(cat.img)} 
                          alt={cat.label} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Package size={16} style={{ color: 'var(--text-muted)' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <IconComponent size={14} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                        {cat.label}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ID: {cat.id}</div>
                    </div>
                    <button
                      onClick={() => handleCategoryDelete(cat.id)}
                      className="btn btn-ghost"
                      style={{
                        height: '28px',
                        width: '28px',
                        padding: 0,
                        borderRadius: '50%',
                        background: 'rgba(220, 38, 38, 0.08)',
                        color: 'var(--accent-red)',
                        border: '1px solid rgba(220, 38, 38, 0.15)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                      title="Delete category"
                      id={`delete-cat-${cat.id}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ADD PRODUCT FORM PANEL */}
      {showAddForm && (
        <div className="card animate-fadeIn" style={{ padding: '1.5rem', background: '#ffffff' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.25rem', marginTop: 0 }}>
            {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Enter New Catalog Product Details'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} id="add-product-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem' }}>
              
              {/* Left Column Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label htmlFor="prod-name" style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Product Name *</label>
                  <input
                    id="prod-name"
                    type="text"
                    className="input-field"
                    placeholder="e.g. Flexible Articulated Dragon"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label htmlFor="prod-category" style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Catalog Category *</label>
                    <select
                      id="prod-category"
                      className="select-field"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label htmlFor="prod-badge" style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Badge / Promo Tag (Optional)</label>
                    <input
                      id="prod-badge"
                      type="text"
                      className="input-field"
                      placeholder="e.g. NEW, BESTSELLER, -20%"
                      value={badge}
                      onChange={e => setBadge(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label htmlFor="prod-price" style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Selling Price (₹) *</label>
                    <input
                      id="prod-price"
                      type="number"
                      min="1"
                      className="input-field"
                      placeholder="e.g. 299"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label htmlFor="prod-original-price" style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Original Price (₹) (Optional)</label>
                    <input
                      id="prod-original-price"
                      type="number"
                      min="1"
                      className="input-field"
                      placeholder="e.g. 399 (for discount calculation)"
                      value={originalPrice}
                      onChange={e => setOriginalPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label htmlFor="prod-desc" style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Product Description</label>
                  <textarea
                    id="prod-desc"
                    className="input-field"
                    rows="3"
                    placeholder="Describe the product, features, and print details..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Right Column: Image and Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Product Image File *</label>
                  <div style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    textAlign: 'center',
                    background: 'var(--bg-secondary)',
                    cursor: 'pointer',
                    position: 'relative',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--transition)'
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                      required={!imagePreview}
                      id="prod-image-file"
                    />
                    {imagePreview ? (
                      <img 
                        src={resolveImageUrl(imagePreview)}
                        alt="Preview" 
                        style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '4px', objectFit: 'contain' }} 
                      />
                    ) : (
                      <>
                        <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Click or Drag Image File</span>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '4px' }}>PNG, JPG or WEBP (Max 5MB)</span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="prod-instock"
                    checked={inStock}
                    onChange={e => setInStock(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="prod-instock" style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Available in Stock
                  </label>
                </div>
              </div>
            </div>

            {/* Custom Specs and Materials List */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
                
                {/* Product Specifications Table */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Product Specifications</label>
                    <button
                      type="button"
                      onClick={addSpecField}
                      className="btn btn-ghost"
                      style={{ height: '24px', fontSize: '0.68rem', padding: '0 6px', color: 'var(--accent-cyan)' }}
                    >
                      + Add Row
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {specs.map((spec, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Key (e.g. Dimensions)"
                          value={spec.key}
                          onChange={e => handleSpecChange(i, 'key', e.target.value)}
                          style={{ height: '32px', fontSize: '0.78rem' }}
                        />
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Value (e.g. 10 x 8 x 5 cm)"
                          value={spec.value}
                          onChange={e => handleSpecChange(i, 'value', e.target.value)}
                          style={{ height: '32px', fontSize: '0.78rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeSpecField(i)}
                          className="btn btn-ghost"
                          style={{ padding: 0, width: '28px', height: '32px', color: 'var(--accent-red)' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Material Selection checkboxes */}
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                    Print Materials Required
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '0.75rem' }}>
                    {availableMaterials.map(mat => {
                      const isSelected = selectedMaterials.includes(mat);
                      return (
                        <button
                          key={mat}
                          type="button"
                          onClick={() => handleMaterialToggle(mat)}
                          className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                          style={{
                            height: '28px',
                            fontSize: '0.7rem',
                            padding: '0 0.6rem',
                            borderRadius: '4px',
                            background: isSelected ? 'var(--accent-cyan)' : 'transparent',
                            color: isSelected ? '#fff' : 'var(--text-secondary)',
                            borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--border-color)'
                          }}
                        >
                          {mat}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Dynamic Custom Material Input */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Add custom material (e.g. TPU)"
                      value={customMaterial}
                      onChange={e => setCustomMaterial(e.target.value)}
                      style={{ height: '28px', fontSize: '0.74rem', maxWidth: '220px' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const clean = customMaterial.trim();
                        if (clean && !availableMaterials.includes(clean)) {
                          const updated = [...availableMaterials, clean];
                          setAvailableMaterials(updated);
                          localStorage.setItem('zylix_available_materials', JSON.stringify(updated));
                          setSelectedMaterials(prev => [...prev, clean]);
                          setCustomMaterial('');
                        }
                      }}
                      className="btn btn-ghost"
                      style={{ height: '28px', fontSize: '0.7rem', padding: '0 0.6rem', color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)' }}
                    >
                      + Add
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
                style={{ height: '38px', fontSize: '0.8rem' }}
              >
                Clear Details
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ height: '38px', fontSize: '0.8rem' }}
                disabled={submitting}
                id="submit-product-btn"
              >
                {submitting 
                  ? (editingProduct ? 'Saving Changes...' : 'Creating Product...') 
                  : (editingProduct ? 'Save Changes' : 'Publish Product to Catalog')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PRODUCTS INVENTORY LIST */}
      {!showCategoriesPanel && (
        <div className="card" style={{ overflow: 'hidden', background: '#ffffff' }}>
          {loading ? (
            <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <div className="spinner" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading products inventory database...</span>
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>No products found in the catalog. Add one to get started!</span>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--text-secondary)', width: '60px' }}>Image</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Product Name</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Category</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Price</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Stock Status</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--text-secondary)', width: '100px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod, index) => (
                    <tr
                      key={prod.id || index}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.15s ease',
                        borderLeft: '3px solid transparent',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.012)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '0.6rem 1rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '6px',
                          background: 'var(--bg-secondary)',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--border-color)'
                        }}>
                          {prod.image ? (
                            <img 
                              src={resolveImageUrl(prod.image)}
                              alt={prod.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Package size={16} style={{ color: 'var(--text-muted)' }} />
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.6rem 1rem' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{prod.name}</div>
                          {prod.badge && (
                            <span style={{
                              display: 'inline-block',
                              background: 'rgba(2,132,199,0.08)',
                              color: 'var(--accent-cyan)',
                              fontSize: '0.58rem',
                              fontWeight: '800',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              marginTop: '2px',
                              textTransform: 'uppercase'
                            }}>
                              {prod.badge}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.6rem 1rem', textTransform: 'capitalize' }}>
                        <span className="badge badge-type" style={{ fontSize: '0.7rem' }}>
                          {prod.categoryLabel || prod.category}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 1rem' }}>
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹{prod.price}</div>
                          {prod.originalPrice && (
                            <div style={{ fontSize: '0.68rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                              ₹{prod.originalPrice}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.6rem 1rem' }}>
                        <span className={`badge ${prod.inStock ? 'badge-approved' : 'badge-declined'}`} style={{ fontSize: '0.7rem' }}>
                          {prod.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            onClick={() => handleStartEdit(prod)}
                            className="btn btn-ghost"
                            style={{
                              height: '28px',
                              width: '28px',
                              padding: 0,
                              borderRadius: '50%',
                              background: 'rgba(2, 132, 199, 0.08)',
                              color: 'var(--accent-cyan)',
                              border: '1px solid rgba(2, 132, 199, 0.15)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Edit product"
                            id={`edit-prod-${prod.id}`}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id)}
                            className="btn btn-ghost"
                            style={{
                              height: '28px',
                              width: '28px',
                              padding: 0,
                              borderRadius: '50%',
                              background: 'rgba(220, 38, 38, 0.08)',
                              color: 'var(--accent-red)',
                              border: '1px solid rgba(220, 38, 38, 0.15)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Delete product"
                            id={`delete-prod-${prod.id}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
