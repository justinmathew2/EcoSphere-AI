import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Sliders, Sun, Leaf, ShieldAlert } from 'lucide-react';

interface CarbonProfile {
  transport_car_km_per_week: number;
  transport_ev_km_per_week: number;
  transport_bus_km_per_week: number;
  transport_train_km_per_week: number;
  transport_bike_km_per_week: number;
  transport_flights_hours_per_year: number;
  
  energy_kwh_per_month: number;
  energy_ac_hours_per_week: number;
  energy_has_solar: boolean;
  
  food_habit: string;
  
  shopping_electronics_per_month: number;
  shopping_clothing_items_per_month: number;
  shopping_plastic_bags_per_week: number;
  
  waste_recycling_level: string;
}

interface SimulatorProps {
  currentProfile: CarbonProfile | null;
}

export const Simulator: React.FC<SimulatorProps> = ({ currentProfile }) => {
  // Default profile if none has been computed yet
  const defaultProfile: CarbonProfile = {
    transport_car_km_per_week: 150,
    transport_ev_km_per_week: 0,
    transport_bus_km_per_week: 20,
    transport_train_km_per_week: 10,
    transport_bike_km_per_week: 5,
    transport_flights_hours_per_year: 15,
    energy_kwh_per_month: 350,
    energy_ac_hours_per_week: 15,
    energy_has_solar: false,
    food_habit: 'mixed',
    shopping_electronics_per_month: 1,
    shopping_clothing_items_per_month: 3,
    shopping_plastic_bags_per_week: 10,
    waste_recycling_level: 'partial'
  };

  const activeProfile = currentProfile || defaultProfile;

  // Simulator states
  const [simProfile, setSimProfile] = useState<CarbonProfile>({ ...activeProfile });

  // Emission Factors mapping (matching backend)
  const factors = {
    car: 0.20,
    ev: 0.05,
    bus: 0.08,
    train: 0.04,
    flight: 90.0,
    electricity: 0.45,
    electricity_solar: 0.08,
    ac: 0.8,
    vegan: 2.5,
    vegetarian: 3.3,
    mixed: 5.0,
    'meat-heavy': 7.2,
    electronics: 80.0,
    clothing: 10.0,
    bag: 0.1,
    none: 1.5,
    partial: 0.8,
    full: 0.2
  };

  // Compute monthly emissions for a profile
  const computeEmissions = (p: CarbonProfile) => {
    const transport = (
      p.transport_car_km_per_week * 4.33 * factors.car +
      p.transport_ev_km_per_week * 4.33 * factors.ev +
      p.transport_bus_km_per_week * 4.33 * factors.bus +
      p.transport_train_km_per_week * 4.33 * factors.train +
      (p.transport_flights_hours_per_year * factors.flight) / 12.0
    );

    const electricity_factor = p.energy_has_solar ? factors.electricity_solar : factors.electricity;
    const energy = (p.energy_kwh_per_month * electricity_factor) + (p.energy_ac_hours_per_week * 4.33 * factors.ac);

    const diet_factor = factors[p.food_habit as keyof typeof factors] || factors.mixed;
    const food = diet_factor * 30.4;

    const shopping = (
      p.shopping_electronics_per_month * factors.electronics +
      p.shopping_clothing_items_per_month * factors.clothing +
      p.shopping_plastic_bags_per_week * 4.33 * factors.bag
    );

    const waste_factor = factors[p.waste_recycling_level as keyof typeof factors] || factors.partial;
    const waste = waste_factor * 30.4;

    const total = transport + energy + food + shopping + waste;
    const score = Math.max(0, Math.min(100, Math.round(100 * Math.exp(-total / 850.0))));

    return { transport, energy, food, shopping, waste, total, score };
  };

  const currentResult = computeEmissions(activeProfile);
  const simulatedResult = computeEmissions(simProfile);

  // Recharts structured comparison
  const chartData = useMemo(() => [
    { name: 'Transport', Current: Math.round(currentResult.transport), Simulated: Math.round(simulatedResult.transport) },
    { name: 'Energy', Current: Math.round(currentResult.energy), Simulated: Math.round(simulatedResult.energy) },
    { name: 'Food', Current: Math.round(currentResult.food), Simulated: Math.round(simulatedResult.food) },
    { name: 'Shopping', Current: Math.round(currentResult.shopping), Simulated: Math.round(simulatedResult.shopping) },
    { name: 'Waste', Current: Math.round(currentResult.waste), Simulated: Math.round(simulatedResult.waste) },
  ], [currentResult, simulatedResult]);

  const handleSliderChange = (name: keyof CarbonProfile, value: any) => {
    setSimProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetSimulator = () => {
    setSimProfile({ ...activeProfile });
  };

  return (
    <div className="animate-slide-up">
      <div className="flex-between mb-32">
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Carbon Simulator</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Experiment with lifestyle changes to see hypothetical impacts on score and footprint.</p>
        </div>
        
        <button className="btn btn-secondary" onClick={resetSimulator}>
          Reset Sim
        </button>
      </div>

      {!currentProfile && (
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--color-warning)', borderRadius: 'var(--border-radius-md)', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px' }}>
          <ShieldAlert color="var(--color-warning)" size={18} />
          <span style={{ fontSize: '0.85rem' }}>* Showing default averages. Run your Carbon Assessment first to compare against actual personal details.</span>
        </div>
      )}

      <div className="grid-2">
        {/* Sliders Panel */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.25rem' }}>Simulate Lifestyle Changes</h2>
          </div>

          {/* Transport */}
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>🚗 Commute Adjustments</h4>
            
            <div className="form-group">
              <label htmlFor="sim-car-distance" className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Car Distance (Gasoline)</span>
                <span style={{ fontWeight: 600 }}>{simProfile.transport_car_km_per_week} km/week</span>
              </label>
              <input 
                id="sim-car-distance"
                type="range" min="0" max="500" step="10"
                value={simProfile.transport_car_km_per_week}
                onChange={(e) => handleSliderChange('transport_car_km_per_week', parseInt(e.target.value))}
                style={{ accentColor: 'var(--color-primary)' }}
              />
            </div>

            <div className="form-group" style={{ marginTop: '8px' }}>
              <label htmlFor="sim-ev-distance" className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Switch travel to EV</span>
                <span style={{ fontWeight: 600 }}>{simProfile.transport_ev_km_per_week} km/week</span>
              </label>
              <input 
                id="sim-ev-distance"
                type="range" min="0" max="500" step="10"
                value={simProfile.transport_ev_km_per_week}
                onChange={(e) => handleSliderChange('transport_ev_km_per_week', parseInt(e.target.value))}
                style={{ accentColor: 'var(--color-teal)' }}
              />
            </div>
          </div>

          {/* Home Utilities */}
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>⚡ Utilities & Energy</h4>

            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                 onClick={() => handleSliderChange('energy_has_solar', !simProfile.energy_has_solar)}>
              <input 
                id="sim-has-solar"
                type="checkbox" checked={simProfile.energy_has_solar} readOnly
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="sim-has-solar" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <Sun size={14} color="var(--color-warning)" />
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Install Solar Panels</span>
              </label>
            </div>

            <div className="form-group" style={{ marginTop: '12px' }}>
              <label htmlFor="sim-ac-hours" className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Air Conditioner hours</span>
                <span style={{ fontWeight: 600 }}>{simProfile.energy_ac_hours_per_week} hours/week</span>
              </label>
              <input 
                id="sim-ac-hours"
                type="range" min="0" max="60" step="1"
                value={simProfile.energy_ac_hours_per_week}
                onChange={(e) => handleSliderChange('energy_ac_hours_per_week', parseInt(e.target.value))}
                style={{ accentColor: 'var(--color-primary)' }}
              />
            </div>
          </div>

          {/* Diet Preferences */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>🥗 Food Diet Preference</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['vegan', 'vegetarian', 'mixed', 'meat-heavy'].map(diet => (
                <button
                  key={diet}
                  type="button"
                  onClick={() => handleSliderChange('food_habit', diet)}
                  aria-pressed={simProfile.food_habit === diet}
                  style={{
                    flex: '1 1 40%',
                    padding: '8px 10px',
                    borderRadius: 'var(--border-radius-sm)',
                    border: '1px solid',
                    borderColor: simProfile.food_habit === diet ? 'var(--color-primary)' : 'var(--border-color)',
                    background: simProfile.food_habit === diet ? 'var(--color-glass-gradient)' : 'transparent',
                    color: simProfile.food_habit === diet ? 'var(--color-primary)' : 'var(--text-secondary)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    textTransform: 'capitalize'
                  }}
                >
                  {diet.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Visualized Results Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Score comparison card */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Current Score</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>{currentResult.score}</div>
            </div>
            
            <div style={{ width: '1px', background: 'var(--border-color)' }} />

            <div>
              <div style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Simulated Score</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-emerald)' }}>{simulatedResult.score}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-emerald)', fontWeight: 600 }}>
                {simulatedResult.score > currentResult.score ? `+${simulatedResult.score - currentResult.score} Increase!` : ''}
              </span>
            </div>
          </div>

          {/* Emissions chart */}
          <div className="glass-panel" style={{ padding: '24px', flex: 1, minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '16px' }}>Category Emissions (kg CO₂ / month)</h4>
            
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip 
                    contentStyle={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--border-radius-md)'
                    }}
                  />
                  <Legend fontSize={10} wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="Current" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Simulated" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Total savings card */}
          <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--color-glass-gradient)', border: '1px solid var(--color-primary)' }}>
            <Leaf color="var(--color-primary)" size={20} />
            <div>
              <h5 style={{ fontWeight: 700 }}>Prevented Emissions Potential</h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Simulating this lifestyle saves <strong>{Math.max(0, Math.round(currentResult.total - simulatedResult.total))} kg CO₂</strong> per month ({Math.max(0, Math.round((currentResult.total - simulatedResult.total) * 12))} kg annually).
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
