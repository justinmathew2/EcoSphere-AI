import React, { useState } from 'react';
import { Upload, CheckCircle2, Lightbulb, Zap } from 'lucide-react';

interface BillAnalysisResult {
  provider: string;
  billing_period: string;
  consumption_kwh: number;
  total_amount: number;
  estimated_co2_kg: number;
  recommendations: string[];
}

interface BillAnalysisProps {
  onBillAnalyzed: () => void;
}

export const BillAnalysis: React.FC<BillAnalysisProps> = ({ onBillAnalyzed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BillAnalysisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analyze-bill', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to analyze electricity bill");
      }

      const data: BillAnalysisResult = await response.json();
      setResult(data);
      onBillAnalyzed(); // Unlocks the "Energy Auditor" badge
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up" style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div className="mb-32">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Electricity Bill Analysis</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Upload a photo or PDF of your utility bill. Gemini AI will extract consumption stats and carbon impacts.</p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '40px' }}>
          
          <div 
            className="file-upload-zone"
            onClick={() => document.getElementById('bill-file-input')?.click()}
          >
            <input 
              type="file" 
              id="bill-file-input"
              style={{ display: 'none' }} 
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
            <Upload size={32} color="var(--color-primary)" />
            {file ? (
              <div>
                <h4 style={{ fontWeight: 600 }}>{file.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB • Click to replace file</p>
              </div>
            ) : (
              <div>
                <h4 style={{ fontWeight: 600 }}>Upload electricity bill image or PDF</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supported formats: JPEG, PNG, WEBP, PDF (Max 10MB)</p>
              </div>
            )}
          </div>

          {error && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--color-danger)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '20px' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={!file || loading}
              style={{ width: '200px' }}
            >
              {loading ? (
                <>
                  <div className="loader-spinner" /> Analyzing Bill...
                </>
              ) : (
                "Analyze with Gemini"
              )}
            </button>
          </div>

        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Success Banner */}
          <div className="glass-panel" style={{ padding: '24px', background: 'var(--color-glass-gradient)', border: '1px solid var(--color-primary)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <CheckCircle2 color="var(--color-primary)" size={32} />
            <div>
              <h3 style={{ fontWeight: 700 }}>Analysis Complete!</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gemini extracted utility indicators successfully. Badge Unlocked: <strong>Energy Auditor</strong> ⚡</p>
            </div>
          </div>

          <div className="grid-2">
            {/* Metric Panel */}
            <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap color="var(--color-warning)" size={20} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Extraction Summary</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Utility Provider</span>
                  <span style={{ fontWeight: 600 }}>{result.provider}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Billing Period</span>
                  <span style={{ fontWeight: 600 }}>{result.billing_period}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Consumption</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-warning)' }}>{result.consumption_kwh} kWh</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Bill Amount</span>
                  <span style={{ fontWeight: 600 }}>${result.total_amount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Carbon Footprint</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>{result.estimated_co2_kg.toFixed(1)} kg CO₂</span>
                </div>
              </div>
            </div>

            {/* recommendations */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Lightbulb color="var(--color-primary)" size={20} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Saving Opportunities</h4>
              </div>

              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', fontSize: '0.85rem' }}>
                {result.recommendations.map((tip, idx) => (
                  <li key={idx} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{idx + 1}.</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => { setFile(null); setResult(null); }}
            >
              Analyze Another Bill
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
