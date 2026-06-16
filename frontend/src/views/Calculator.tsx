import React, { useState } from 'react';
import { 
  Car, 
  Lightbulb, 
  Utensils, 
  ShoppingBag, 
  ArrowLeft, 
  ArrowRight, 
  Check,
  AlertCircle
} from 'lucide-react';

interface CarbonBreakdown {
  transport: number;
  energy: number;
  food: number;
  shopping: number;
  waste: number;
}

interface CarbonCalculationResult {
  monthly_emissions_kg: number;
  annual_emissions_kg: number;
  score: number;
  category: string;
  breakdown: CarbonBreakdown;
  financial_savings_estimate_usd: number;
}

interface CalculatorProps {
  onCalculateSuccess: (result: CarbonCalculationResult, profileData: any) => void;
  savedProfile: any;
}

export const Calculator: React.FC<CalculatorProps> = ({ onCalculateSuccess, savedProfile }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states initialized with saved profile if it exists, otherwise defaults
  const [formData, setFormData] = useState({
    transport_car_km_per_week: savedProfile?.transport_car_km_per_week ?? 0,
    transport_ev_km_per_week: savedProfile?.transport_ev_km_per_week ?? 0,
    transport_bus_km_per_week: savedProfile?.transport_bus_km_per_week ?? 0,
    transport_train_km_per_week: savedProfile?.transport_train_km_per_week ?? 0,
    transport_bike_km_per_week: savedProfile?.transport_bike_km_per_week ?? 0,
    transport_flights_hours_per_year: savedProfile?.transport_flights_hours_per_year ?? 0,
    
    energy_kwh_per_month: savedProfile?.energy_kwh_per_month ?? 0,
    energy_ac_hours_per_week: savedProfile?.energy_ac_hours_per_week ?? 0,
    energy_has_solar: savedProfile?.energy_has_solar ?? false,
    
    food_habit: savedProfile?.food_habit ?? 'mixed',
    
    shopping_electronics_per_month: savedProfile?.shopping_electronics_per_month ?? 0,
    shopping_clothing_items_per_month: savedProfile?.shopping_clothing_items_per_month ?? 0,
    shopping_plastic_bags_per_week: savedProfile?.shopping_plastic_bags_per_week ?? 0,
    
    waste_recycling_level: savedProfile?.waste_recycling_level ?? 'partial'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      parsedValue = value === '' ? 0 : Math.max(0, parseFloat(value));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleSelectDiet = (habit: string) => {
    setFormData(prev => ({ ...prev, food_habit: habit }));
  };

  const handleSelectRecycling = (level: string) => {
    setFormData(prev => ({ ...prev, waste_recycling_level: level }));
  };

  const nextStep = () => {
    // Basic validation before changing steps
    if (step === 1) {
      if (formData.transport_car_km_per_week < 0 || formData.transport_flights_hours_per_year < 0) {
        setError("Values cannot be negative.");
        return;
      }
    }
    setError(null);
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error("Failed to calculate carbon footprint");
      }

      const result = await response.json();
      onCalculateSuccess(result, formData);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div className="mb-32 text-center">
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Carbon Footprint Assessment</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Input your habits below to compute your monthly carbon footprint.</p>
        
        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          {[1, 2, 3, 4].map(idx => (
            <div 
              key={idx} 
              style={{
                width: '40px',
                height: '6px',
                borderRadius: '3px',
                backgroundColor: idx <= step ? 'var(--color-primary)' : 'var(--border-color)',
                transition: 'background-color var(--transition-fast)'
              }}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: 'var(--border-radius-md)', borderLeft: '4px solid var(--color-danger)', marginBottom: '24px' }}>
          <AlertCircle color="var(--color-danger)" />
          <span style={{ fontSize: '0.9rem' }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
        
        {/* Step 1: Transportation */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <Car color="var(--color-primary)" size={24} />
              <h2 style={{ fontSize: '1.5rem' }}>Transportation Habits</h2>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Gasoline Car Travel (km/week)</label>
                <input 
                  type="number" 
                  name="transport_car_km_per_week" 
                  className="form-input" 
                  value={formData.transport_car_km_per_week} 
                  onChange={handleInputChange} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Electric Vehicle (EV) (km/week)</label>
                <input 
                  type="number" 
                  name="transport_ev_km_per_week" 
                  className="form-input" 
                  value={formData.transport_ev_km_per_week} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: '12px' }}>
              <div className="form-group">
                <label className="form-label">Bus Travel (km/week)</label>
                <input 
                  type="number" 
                  name="transport_bus_km_per_week" 
                  className="form-input" 
                  value={formData.transport_bus_km_per_week} 
                  onChange={handleInputChange} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Train Travel (km/week)</label>
                <input 
                  type="number" 
                  name="transport_train_km_per_week" 
                  className="form-input" 
                  value={formData.transport_train_km_per_week} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: '12px' }}>
              <div className="form-group">
                <label className="form-label">Bicycle/Walking (km/week)</label>
                <input 
                  type="number" 
                  name="transport_bike_km_per_week" 
                  className="form-input" 
                  value={formData.transport_bike_km_per_week} 
                  onChange={handleInputChange} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Air Travel (Flight Hours/year)</label>
                <input 
                  type="number" 
                  name="transport_flights_hours_per_year" 
                  className="form-input" 
                  value={formData.transport_flights_hours_per_year} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Home Energy */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <Lightbulb color="var(--color-primary)" size={24} />
              <h2 style={{ fontSize: '1.5rem' }}>Home Energy Consumption</h2>
            </div>
            
            <div className="form-group">
              <label className="form-label">Monthly Electricity Bill Consumption (kWh)</label>
              <input 
                type="number" 
                name="energy_kwh_per_month" 
                className="form-input" 
                placeholder="e.g. 300"
                value={formData.energy_kwh_per_month} 
                onChange={handleInputChange} 
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Check your utility bill for average consumption.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Air Conditioning (AC) usage (Hours/week)</label>
              <input 
                type="number" 
                name="energy_ac_hours_per_week" 
                className="form-input" 
                value={formData.energy_ac_hours_per_week} 
                onChange={handleInputChange} 
              />
            </div>

            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px', marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
              <input 
                type="checkbox" 
                id="energy_has_solar"
                name="energy_has_solar" 
                checked={formData.energy_has_solar} 
                onChange={handleInputChange} 
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <div>
                <label htmlFor="energy_has_solar" style={{ fontWeight: 600, cursor: 'pointer' }}>Solar Panels Installed</label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Check this if you offset electricity using residential solar panels.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Food Habits */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <Utensils color="var(--color-primary)" size={24} />
              <h2 style={{ fontSize: '1.5rem' }}>Dietary Preferences</h2>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>Select the dietary habit that best represents your daily food consumption:</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'vegan', label: '🌱 Vegan', desc: 'Strictly plant-based diet, no animal-derived products.' },
                { id: 'vegetarian', label: '🥚 Vegetarian', desc: 'No meat, but consumes dairy and eggs.' },
                { id: 'mixed', label: '🥗 Mixed Diet', desc: 'Average consumption of vegetables, grains, and moderate meat.' },
                { id: 'meat-heavy', label: '🥩 Meat-Heavy', desc: 'Frequent consumption of beef, pork, poultry, and dairy.' }
              ].map(diet => (
                <div 
                  key={diet.id}
                  onClick={() => handleSelectDiet(diet.id)}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid',
                    borderColor: formData.food_habit === diet.id ? 'var(--color-primary)' : 'var(--border-color)',
                    background: formData.food_habit === diet.id ? 'var(--color-glass-gradient)' : 'rgba(255,255,255,0.01)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ fontWeight: 600, color: formData.food_habit === diet.id ? 'var(--color-primary)' : 'var(--text-primary)' }}>{diet.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{diet.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Shopping & Waste */}
        {step === 4 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <ShoppingBag color="var(--color-primary)" size={24} />
              <h2 style={{ fontSize: '1.5rem' }}>Shopping & Waste Recycling</h2>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Electronics Purchased (Items/month)</label>
                <input 
                  type="number" 
                  name="shopping_electronics_per_month" 
                  className="form-input" 
                  value={formData.shopping_electronics_per_month} 
                  onChange={handleInputChange} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Clothing Purchased (Items/month)</label>
                <input 
                  type="number" 
                  name="shopping_clothing_items_per_month" 
                  className="form-input" 
                  value={formData.shopping_clothing_items_per_month} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Single-use Plastic Bags Used (Bags/week)</label>
              <input 
                type="number" 
                name="shopping_plastic_bags_per_week" 
                className="form-input" 
                value={formData.shopping_plastic_bags_per_week} 
                onChange={handleInputChange} 
              />
            </div>

            <label className="form-label" style={{ display: 'block', marginTop: '16px', marginBottom: '8px' }}>Recycling Level</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { id: 'none', label: 'No Recycling' },
                { id: 'partial', label: 'Some Items (Plastic/Paper)' },
                { id: 'full', label: 'Full Recycling & Composting' }
              ].map(level => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => handleSelectRecycling(level.id)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid',
                    borderColor: formData.waste_recycling_level === level.id ? 'var(--color-primary)' : 'var(--border-color)',
                    background: formData.waste_recycling_level === level.id ? 'var(--color-glass-gradient)' : 'transparent',
                    color: formData.waste_recycling_level === level.id ? 'var(--color-primary)' : 'var(--text-secondary)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', marginTop: '32px', paddingTop: '24px' }}>
          {step > 1 ? (
            <button type="button" onClick={prevStep} className="btn btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button type="button" onClick={nextStep} className="btn btn-primary">
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <div className="loader-spinner" /> Calculating...
                </>
              ) : (
                <>
                  <Check size={16} /> Compute Carbon Footprint
                </>
              )}
            </button>
          )}
        </div>

      </form>
    </div>
  );
};
