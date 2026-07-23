import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertBanner from '../../components/ui/AlertBanner';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Package, ArrowLeft, Loader, Plus, Trash2 } from 'lucide-react';
import FileUpload from '../../components/FileUpload';

export default function RegisterProduct() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    sku: '',
    imageUrl: '',
    certificateUrl: '',
  });
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addSpec = () => setSpecs(prev => [...prev, { key: '', value: '' }]);
  const removeSpec = (index: number) => setSpecs(prev => prev.filter((_, i) => i !== index));
  const updateSpec = (index: number, field: 'key' | 'value', value: string) => {
    setSpecs(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const specsMap: Record<string, string> = {};
      specs.forEach(s => { if (s.key.trim()) specsMap[s.key.trim()] = s.value; });

      await client.post('/products/register', {
        ...form,
        specs: specsMap,
      });

      setSuccess('Product registered successfully! Awaiting verification.');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 640 }}>
      <button
        onClick={() => navigate('/dashboard')}
        className="btn btn-ghost"
        style={{ marginBottom: 'var(--space-lg)', padding: '6px 0' }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <Package size={24} color="var(--accent-cyan)" />
          <h1>Register New Product</h1>
        </div>
        <p>Create a product template that can be used to generate serialized item batches.</p>
      </div>

      {error && <AlertBanner type="error" message={error} onDismiss={() => setError('')} style={{ marginBottom: 'var(--space-md)' }} />}
      {success && <AlertBanner type="success" message={success} onDismiss={() => setSuccess('')} style={{ marginBottom: 'var(--space-md)' }} />}

      {user && !user.verified && (
        <AlertBanner
          type="error"
          message={
            <span>
              <strong>Account Verification Pending:</strong> Your manufacturer account is pending administrator approval.
              You cannot register new products until verified.
            </span>
          }
          style={{ marginBottom: 'var(--space-md)' }}
        />
      )}

      <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-name">Product Name *</label>
          <input id="reg-name" className="form-input" placeholder="e.g. Premium Wireless Headphones" value={form.name} onChange={e => update('name', e.target.value)} required />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-desc">Description *</label>
          <textarea id="reg-desc" className="form-textarea" placeholder="Describe the product..." value={form.description} onChange={e => update('description', e.target.value)} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-category">Category *</label>
            <input id="reg-category" className="form-input" placeholder="e.g. Electronics" value={form.category} onChange={e => update('category', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-sku">SKU *</label>
            <input id="reg-sku" className="form-input" placeholder="e.g. WH-PRO-2024" value={form.sku} onChange={e => update('sku', e.target.value)} required style={{ fontFamily: 'var(--font-mono)' }} />
          </div>
        </div>

        <FileUpload
          label="Product Image"
          accept=".jpg,.jpeg,.png,.webp"
          maxSizeMB={5}
          value={form.imageUrl}
          onChange={(url) => update('imageUrl', url)}
          required
          type="image"
        />

        <FileUpload
          label="Factory Certificate (optional)"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          maxSizeMB={5}
          value={form.certificateUrl}
          onChange={(url) => update('certificateUrl', url)}
          type="any"
        />

        {/* Dynamic specs */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
            <span className="form-label">Specifications</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addSpec}>
              <Plus size={14} /> Add Spec
            </button>
          </div>
          {specs.map((spec, i) => (
            <div key={i} style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)', alignItems: 'center' }}>
              <input className="form-input" placeholder="Key" value={spec.key} onChange={e => updateSpec(i, 'key', e.target.value)} style={{ flex: 1 }} />
              <input className="form-input" placeholder="Value" value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} style={{ flex: 1 }} />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeSpec(i)} style={{ color: 'var(--color-danger)' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-lg" 
          disabled={submitting || !user?.verified} 
          style={{ marginTop: 'var(--space-sm)' }}
        >
          {submitting ? <Loader size={18} className="spin" /> : user?.verified ? 'Register Product' : 'Register Product (Unverified)'}
        </button>
      </form>
    </div>
  );
}
