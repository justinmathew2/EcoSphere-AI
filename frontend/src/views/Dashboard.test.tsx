import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Dashboard } from './Dashboard';

describe('Dashboard Component', () => {
  it('renders Welcome Back message', () => {
    render(
      <Dashboard 
        calcResult={null} 
        streak={3} 
        unlockedBadges={[]} 
        setView={vi.fn()} 
      />
    );
    expect(screen.getByText(/Welcome Back, Eco Saver/i)).toBeInTheDocument();
  });

  it('displays the correct streak', () => {
    render(
      <Dashboard 
        calcResult={null} 
        streak={10} 
        unlockedBadges={[]} 
        setView={vi.fn()} 
      />
    );
    expect(screen.getByText(/10 Day Streak/i)).toBeInTheDocument();
  });

  it('shows carbon score when calculated', () => {
    const mockResult = {
      score: 85,
      monthly_emissions_kg: 200,
      annual_emissions_kg: 2400,
      category: "Low Impact",
      financial_savings_estimate_usd: 50,
      breakdown: { transport: 50, energy: 50, food: 50, shopping: 25, waste: 25 }
    };

    render(
      <Dashboard 
        calcResult={mockResult} 
        streak={5} 
        unlockedBadges={['beginner']} 
        setView={vi.fn()} 
      />
    );

    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Low Impact')).toBeInTheDocument();
    expect(screen.getByText('Fantastic Job! High Efficiency.')).toBeInTheDocument();
  });
});
