import React, { useState } from 'react';
import { Upload, Star, CheckCircle, RefreshCw } from 'lucide-react';

interface ProductAnalysisResult {
  product_name: string;
  sustainability_rating: number;
  estimated_carbon_impact: string;
  estimated_co2_kg: number;
  materials_analysis: string;
  key_recommendation: string;
  eco_friendly_alternatives: string[];
}

interface ProductAdvisorProps {
  onProductAnalyzed: () => void;
}

export const ProductAdvisor: React.FC<ProductAdvisorProps> = ({ onProductAnalyzed }) => {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProductAnalysisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description && !file) {
      setError("Please write a product name/description or upload a photo.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('product_description', description);
    if (file) {
      formData.append('file', file);
    }

    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${API}/api/analyze-product`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to analyze product");
      }

      const data: ProductAnalysisResult = await response.json();
      setResult(data);
      onProductAnalyzed(); // Unlocks "Smart Shopper" badge
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    if (impact.includes("Low")) return 'var(--color-emerald)';
    if (impact.includes("Moderate")) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  return (
    <div className="animate-slide-up" style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div className="mb-32">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Product Sustainability Advisor</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Enter a product description or upload an image of a label. Gemini AI will evaluate its environmental impact.</p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div className="form-group">
            <label className="form-label">Product Name / Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Disposable plastic water bottles, cotton organic t-shirt, plastic toothbrush..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Upload Product Photo or Ingredient Label (Optional)</label>
            <div
              className="file-upload-zone"
              onClick={() => document.getElementById('product-file-input')?.click()}
              style={{ padding: '24px' }}
            >
              <input
                type="file"
                id="product-file-input"
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
              />
              <Upload size={24} color="var(--color-primary)" />
              {file ? (
                <div>
                  <h5 style={{ fontWeight: 600 }}>{file.name}</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to replace photo</p>
                </div>
              ) : (
                <div>
                  <h5 style={{ fontWeight: 600 }}>Upload label or box image</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPEG, PNG, WEBP (Max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--color-danger)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '220px' }}
            >
              {loading ? (
                <>
                  <div className="loader-spinner" /> Reviewing Product...
                </>
              ) : (
                "Assess Product"
              )}
            </button>
          </div>

        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Success Banner */}
          <div className="glass-panel" style={{ padding: '24px', background: 'var(--color-glass-gradient)', border: '1px solid var(--color-primary)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <CheckCircle color="var(--color-primary)" size={32} />
            <div>
              <h3 style={{ fontWeight: 700 }}>Assessment Completed!</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Product details analyzed by Gemini. Badge Unlocked: <strong>Smart Shopper</strong> 🛍️</p>
            </div>
          </div>

          {/* Core Info */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{result.product_name}</h3>
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={18}
                      color={star <= result.sustainability_rating ? '#f59e0b' : 'var(--border-color)'}
                      fill={star <= result.sustainability_rating ? '#f59e0b' : 'none'}
                    />
                  ))}
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '8px', fontWeight: 500 }}>
                    ({result.sustainability_rating}/5 Rating)
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="impact-badge" style={{ backgroundColor: 'transparent', border: `1px solid ${getImpactColor(result.estimated_carbon_impact)}`, color: getImpactColor(result.estimated_carbon_impact) }}>
                  {result.estimated_carbon_impact} Carbon Impact
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '6px', color: 'var(--color-danger)' }}>
                  {result.estimated_co2_kg.toFixed(1)} kg CO₂
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h5 style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Materials & Packaging Assessment</h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>{result.materials_analysis}</p>
              </div>

              <div>
                <h5 style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Key Recommendation</h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>{result.key_recommendation}</p>
              </div>
            </div>
          </div>

          {/* Alternatives */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <RefreshCw size={18} color="var(--color-primary)" /> Green Alternatives
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {result.eco_friendly_alternatives.map((alt, index) => (
                <div key={index} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  🌿 {alt}
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => { setFile(null); setDescription(''); setResult(null); }}
            >
              Analyze Another Product
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
