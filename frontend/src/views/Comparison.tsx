import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Navigation, ShieldCheck, HelpCircle } from 'lucide-react';

export const Comparison: React.FC = () => {
  const [distance, setDistance] = useState(150); // Default distance 150 km

  // Calculations based on emission factors
  const travelData = [
    { name: 'Train', emissions: parseFloat((distance * 0.04).toFixed(1)), color: '#10b981', desc: 'Highly efficient electrified grid rail.' },
    { name: 'EV (Electric)', emissions: parseFloat((distance * 0.05).toFixed(1)), color: '#0d9488', desc: 'Zero tailpipe, dependent on regional grid kWh.' },
    { name: 'Bus', emissions: parseFloat((distance * 0.08).toFixed(1)), color: '#34d399', desc: 'Shared mass transit vehicle.' },
    { name: 'Flight', emissions: parseFloat((distance * 0.13).toFixed(1)), color: '#f59e0b', desc: 'High altitude jet fuel combustion.' },
    { name: 'Gasoline Car', emissions: parseFloat((distance * 0.20).toFixed(1)), color: '#ef4444', desc: 'Internal combustion engine passenger commute.' },
  ];

  // Sort emissions to find lowest
  const sortedData = [...travelData].sort((a, b) => a.emissions - b.emissions);
  const bestOption = sortedData[0];
  const worstOption = sortedData[sortedData.length - 1];
  const co2Diff = worstOption.emissions - bestOption.emissions;

  return (
    <div className="animate-slide-up" style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div className="mb-32">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Travel Emission Comparison</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Compare CO₂ impacts of different commuting options dynamically.</p>
      </div>

      <div className="grid-2">
        {/* Slider control */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.25rem' }}>Configure Journey</h2>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Journey Distance</span>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem' }}>{distance} km</span>
            </label>
            <input 
              type="range" 
              min="5" 
              max="2000" 
              step="5" 
              value={distance} 
              onChange={(e) => setDistance(parseInt(e.target.value))} 
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: 'var(--border-color)',
                outline: 'none',
                cursor: 'pointer',
                accentColor: 'var(--color-primary)'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>5 km (Short Commute)</span>
              <span>2,000 km (Long Journey)</span>
            </div>
          </div>

          {/* Advice card */}
          <div style={{ background: 'var(--color-glass-gradient)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '16px', borderRadius: 'var(--border-radius-md)', marginTop: '8px' }}>
            <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', color: 'var(--color-primary)' }}>
              <ShieldCheck size={16} /> Eco Recommendation
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.5' }}>
              For a distance of <strong>{distance} km</strong>, commuting by <strong>{bestOption.name}</strong> is your greenest path, emitting only <strong>{bestOption.emissions} kg</strong> of CO₂.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px' }}>
              Choosing {bestOption.name} over a Gasoline Car prevents <strong>{co2Diff.toFixed(1)} kg</strong> of CO₂ from entering the atmosphere.
            </p>
          </div>
        </div>

        {/* Chart display */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', height: '380px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Carbon footprint (kg CO₂)</h2>
          
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={travelData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} width={80} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--border-radius-md)'
                  }}
                />
                <Bar dataKey="emissions" radius={[0, 4, 4, 0]}>
                  {travelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fact sheet */}
      <div className="glass-panel mt-32" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <HelpCircle size={20} color="var(--color-primary)" /> Travel Impact Breakdown
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {travelData.map((item, idx) => (
            <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }}>
              <h5 style={{ fontWeight: 600, color: item.color, fontSize: '0.95rem' }}>{item.name}</h5>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0' }}>{item.emissions} kg CO₂</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
