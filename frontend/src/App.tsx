import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calculator as CalcIcon, 
  MessageSquare, 
  CheckSquare, 
  BarChart3, 
  FileText, 
  ShoppingBag, 
  Sliders, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Leaf 
} from 'lucide-react';

// Import views
import { Dashboard } from './views/Dashboard';
import { Calculator } from './views/Calculator';
import { Coach } from './views/Coach';
import { ActionPlan } from './views/ActionPlan';
import { Comparison } from './views/Comparison';
import { BillAnalysis } from './views/BillAnalysis';
import { ProductAdvisor } from './views/ProductAdvisor';
import { Simulator } from './views/Simulator';

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
interface CarbonProfileInput {
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

interface CarbonRecommendation {
  category: string;
  description: string;
  estimated_co2_savings_kg: number;
  estimated_cost_savings_usd: number;
}

interface ActionPlanData {
  title: string;
  score_impact: number;
  recommendations: CarbonRecommendation[];
}

function App() {
  const [view, setView] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Carbon Footprint Profile & Calculations States
  const [calcResult, setCalcResult] = useState<CarbonCalculationResult | null>(null);
  const [profileData, setProfileData] = useState<CarbonProfileInput | null>(null);
  
  // Weekly action plan states (cached here so checking off items is persistent)
  const [actionPlan, setActionPlan] = useState<ActionPlanData | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<boolean[]>([]);

  // Gamification states
  const [streak, setStreak] = useState(3); // Start with a 3-day streak for flavor
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);

  // Apply theme to document
  useEffect(() => {
    const bodyClass = document.body.classList;
    if (theme === 'light') {
      bodyClass.add('light-mode');
    } else {
      bodyClass.remove('light-mode');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleCalculateSuccess = (result: CarbonCalculationResult, profile: any) => {
    setCalcResult(result);
    setProfileData(profile);
    
    // Increment streak on calculation
    setStreak(prev => prev + 1);
    
    // Unlock Green Beginner Badge
    if (!unlockedBadges.includes('beginner')) {
      setUnlockedBadges(prev => [...prev, 'beginner']);
    }
    
    // Unlock Eco Warrior Badge if Carbon Score >= 70
    if (result.score >= 70 && !unlockedBadges.includes('warrior')) {
      setUnlockedBadges(prev => [...prev, 'warrior']);
    } else if (result.score < 70 && unlockedBadges.includes('warrior')) {
      setUnlockedBadges(prev => prev.filter(b => b !== 'warrior'));
    }

    // Return to dashboard
    setView('dashboard');
  };

  // Adjust carbon score dynamically when task lists are completed
  const handleScoreAdjust = (points: number) => {
    if (calcResult) {
      const newScore = Math.max(0, Math.min(100, calcResult.score + points));
      let newCategory = calcResult.category;
      if (newScore >= 70) newCategory = "Low Impact";
      else if (newScore >= 40) newCategory = "Moderate Impact";
      else newCategory = "High Impact";

      setCalcResult({
        ...calcResult,
        score: newScore,
        category: newCategory
      });
      
      // If completed action plan (meaning all checkboxes would be true)
      // We check this in ActionPlan, but let's unlock champion badge here if score rises
      if (newScore >= 80 && !unlockedBadges.includes('champion')) {
        setUnlockedBadges(prev => [...prev, 'champion']);
      }
    }
  };

  // Callback when bill is analyzed
  const handleBillAnalyzed = () => {
    if (!unlockedBadges.includes('bill')) {
      setUnlockedBadges(prev => [...prev, 'bill']);
    }
    setStreak(prev => prev + 1);
  };

  // Callback when product is analyzed
  const handleProductAnalyzed = () => {
    if (!unlockedBadges.includes('product')) {
      setUnlockedBadges(prev => [...prev, 'product']);
    }
    setStreak(prev => prev + 1);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'calculator', label: 'Carbon Calculator', icon: <CalcIcon size={18} /> },
    { id: 'coach', label: 'AI Sustainability Coach', icon: <MessageSquare size={18} /> },
    { id: 'action-plan', label: 'Weekly AI Action Plan', icon: <CheckSquare size={18} /> },
    { id: 'comparison', label: 'Travel Comparison', icon: <BarChart3 size={18} /> },
    { id: 'bill', label: 'Electricity Bill Analyzer', icon: <FileText size={18} /> },
    { id: 'product', label: 'Product Advisor', icon: <ShoppingBag size={18} /> },
    { id: 'simulator', label: 'Footprint Simulator', icon: <Sliders size={18} /> }
  ];

  return (
    <div className="app-container">
      
      {/* Mobile Header Nav */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Leaf color="var(--color-primary)" size={20} />
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>EcoSphere AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="hamburger-btn" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle navigation menu" aria-expanded={sidebarOpen}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">🌱</div>
          <span className="sidebar-title gradient-text">EcoSphere AI</span>
        </div>

        <nav style={{ flex: 1 }}>
          <ul className="sidebar-nav">
            {menuItems.map(item => (
              <li 
                key={item.id}
                className={`sidebar-nav-item ${view === item.id ? 'active' : ''}`}
                onClick={() => {
                  setView(item.id);
                  setSidebarOpen(false);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>Active Saver</span>
          </div>
          <button 
            onClick={toggleTheme} 
            className="btn btn-secondary"
            style={{ padding: '8px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.03)' }}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </aside>

      {/* Main View Container */}
      <main className="main-content">
        {view === 'dashboard' && (
          <Dashboard 
            calcResult={calcResult} 
            streak={streak} 
            unlockedBadges={unlockedBadges} 
            setView={setView} 
          />
        )}
        
        {view === 'calculator' && (
          <Calculator 
            onCalculateSuccess={handleCalculateSuccess} 
            savedProfile={profileData} 
          />
        )}

        {view === 'coach' && (
          <Coach profileData={profileData} />
        )}

        {view === 'action-plan' && (
          <ActionPlan 
            profileData={profileData} 
            actionPlan={actionPlan}
            setActionPlan={setActionPlan}
            checkedTasks={checkedTasks}
            setCheckedTasks={setCheckedTasks}
            onPlanComplete={handleScoreAdjust}
          />
        )}

        {view === 'comparison' && (
          <Comparison />
        )}

        {view === 'bill' && (
          <BillAnalysis onBillAnalyzed={handleBillAnalyzed} />
        )}

        {view === 'product' && (
          <ProductAdvisor onProductAnalyzed={handleProductAnalyzed} />
        )}

        {view === 'simulator' && (
          <Simulator currentProfile={profileData} />
        )}
      </main>

    </div>
  );
}

export default App;
