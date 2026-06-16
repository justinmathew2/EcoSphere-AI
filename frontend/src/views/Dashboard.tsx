import React from 'react';
import { 
  Flame, 
  TrendingDown, 
  DollarSign, 
  Award, 
  ArrowRight,
  Leaf,
  Sparkles
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

interface DashboardProps {
  calcResult: CarbonCalculationResult | null;
  streak: number;
  unlockedBadges: string[];
  setView: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  calcResult, 
  streak, 
  unlockedBadges, 
  setView 
}) => {
  // Default values if no calculations exist yet
  const score = calcResult ? calcResult.score : 0;
  const monthlyEmissions = calcResult ? calcResult.monthly_emissions_kg : 0;
  const savings = calcResult ? calcResult.financial_savings_estimate_usd : 0;
  const category = calcResult ? calcResult.category : "No Data Yet";

  // SVG calculations for radial progress
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getImpactClass = (cat: string) => {
    if (cat.includes("Low")) return "low";
    if (cat.includes("Moderate")) return "moderate";
    return "high";
  };

  const getBadgeActive = (id: string) => {
    return unlockedBadges.includes(id) ? "active" : "";
  };

  return (
    <div className="animate-slide-up">
      <div className="flex-between mb-32">
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Welcome Back, Eco Saver</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track and manage your carbon impact with AI intelligence.</p>
        </div>
        
        {/* Streak Display */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: 'var(--border-radius-md)' }}>
          <Flame color="#ef4444" fill="#ef4444" size={20} />
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{streak} Day Streak</span>
        </div>
      </div>

      <div className="metrics-grid">
        {/* Carbon Score Card */}
        <div className="glass-panel score-panel">
          <div className="radial-progress-container">
            <svg className="radial-progress-svg">
              <circle className="radial-progress-bg" cx="80" cy="80" r={radius} />
              <circle 
                className="radial-progress-bar" 
                cx="80" 
                cy="80" 
                r={radius} 
                style={{ 
                  strokeDasharray: circumference, 
                  strokeDashoffset: strokeDashoffset,
                  stroke: calcResult ? 'var(--color-primary)' : 'var(--text-muted)'
                }}
              />
            </svg>
            <div className="radial-progress-text">
              <span className="radial-score-val">{calcResult ? score : '--'}</span>
              <span className="radial-score-lbl">Carbon Score</span>
            </div>
          </div>

          <div className="score-details">
            <span className={`impact-badge ${getImpactClass(category)}`}>
              {category}
            </span>
            <h3 style={{ fontSize: '1.5rem', marginTop: '4px' }}>
              {calcResult 
                ? score >= 70 
                  ? "Fantastic Job! High Efficiency." 
                  : score >= 40 
                    ? "Good base. There is room to improve!" 
                    : "High impact detected. Let's optimize!"
                : "Calculate footprint to see score"
              }
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px' }}>
              {calcResult 
                ? "Your daily habits put you in the upper echelons of sustainability compared to average regional grids. Check your coach tips to optimize."
                : "Fill out the carbon footprint calculator form in the sidebar menu to retrieve your personalized Carbon Score and custom analytics."
              }
            </p>
            {!calcResult && (
              <button 
                className="btn btn-primary mt-24"
                style={{ width: 'fit-content' }}
                onClick={() => setView('calculator')}
              >
                Start Carbon Assessment <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Stats Column */}
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-emerald)' }}>
            <TrendingDown size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Monthly Footprint</span>
            <span className="stat-value">{calcResult ? `${monthlyEmissions} kg` : '--'}</span>
            <span className="stat-subtext">CO₂ Equivalent</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(2, 132, 199, 0.1)', color: 'var(--color-sky)' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Monthly Savings</span>
            <span className="stat-value">{calcResult ? `$${savings}` : '--'}</span>
            <span className="stat-subtext">Estimated Financials</span>
          </div>
        </div>
      </div>

      <div className="grid-2 mt-32">
        {/* Achievements / Gamification */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Award size={24} color="var(--color-emerald)" />
            <h2 style={{ fontSize: '1.5rem' }}>Eco Achievements</h2>
          </div>
          
          <div className="badge-container">
            <div className={`badge-item ${getBadgeActive('beginner')}`}>
              <span className="badge-icon">🌱</span>
              <span className="badge-name">Green Beginner</span>
              <span className="badge-desc">Completed Carbon Assessment</span>
            </div>
            
            <div className={`badge-item ${getBadgeActive('warrior')}`}>
              <span className="badge-icon">🌳</span>
              <span className="badge-name">Eco Warrior</span>
              <span className="badge-desc">Carbon Score &gt;= 70</span>
            </div>
            
            <div className={`badge-item ${getBadgeActive('champion')}`}>
              <span className="badge-icon">🌍</span>
              <span className="badge-name">Climate Champion</span>
              <span className="badge-desc">Completed Weekly AI Goals</span>
            </div>
            
            <div className={`badge-item ${getBadgeActive('bill')}`}>
              <span className="badge-icon">⚡</span>
              <span className="badge-name">Energy Auditor</span>
              <span className="badge-desc">Analyzed Electricity Bill</span>
            </div>

            <div className={`badge-item ${getBadgeActive('product')}`}>
              <span className="badge-icon">🛍️</span>
              <span className="badge-name">Smart Shopper</span>
              <span className="badge-desc">Analyzed Sustainable Product</span>
            </div>
          </div>
          
          <div className="mt-32" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="var(--color-warning)" /> Weekly Challenges
            </h4>
            <ul style={{ listStyle: 'none', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span>🚫 Meat-Free Monday</span>
                <span style={{ color: 'var(--color-emerald)' }}>+10 pts</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span>🚲 Commute by Bike/Walk (5km)</span>
                <span style={{ color: 'var(--color-emerald)' }}>+20 pts</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>💡 Standby Power Shutoff</span>
                <span style={{ color: 'var(--color-emerald)' }}>+10 pts</span>
              </li>
            </ul>
          </div>
        </div>

        {/* AI Recommendations Hook */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Leaf size={24} color="var(--color-emerald)" />
              <h2 style={{ fontSize: '1.5rem' }}>AI Sustainability Coach</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
              Our AI Sustainability Coach matches your activity patterns to local grid emission profiles and shopping metrics. Get real-time advice on meals, travel modes, and electric utilities.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                💡 <strong>Coach Suggestion:</strong> {calcResult && breakdownHigh(calcResult.breakdown) === 'transport' 
                  ? "Since your transport emissions are high, try the travel comparison tool to evaluate EV options!" 
                  : "Upload an electricity bill using the Bill Analyzer to extract saving insights."}
              </div>
            </div>
          </div>

          <button 
            className="btn btn-accent mt-24"
            style={{ width: '100%' }}
            onClick={() => setView('coach')}
          >
            Chat with AI Coach
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple helper to find highest emission category
const breakdownHigh = (breakdown: CarbonBreakdown): string => {
  let maxVal = 0;
  let maxCat = '';
  Object.entries(breakdown).forEach(([cat, val]) => {
    if (val > maxVal) {
      maxVal = val;
      maxCat = cat;
    }
  });
  return maxCat;
};
