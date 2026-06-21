import pytest
from calculator import calculate_footprint, CarbonProfileInput, EMISSION_FACTORS

def test_calculate_footprint_default():
    profile = CarbonProfileInput()
    result = calculate_footprint(profile)
    
    # Assert result structure and math bounds
    assert result.score >= 0 and result.score <= 100
    assert result.monthly_emissions_kg > 0
    assert result.annual_emissions_kg > 0
    assert "Impact" in result.category

def test_calculate_footprint_high_impact():
    profile = CarbonProfileInput(
        transport_flights_hours_per_year=200,
        energy_kwh_per_month=1500,
        food_habit="meat-heavy",
        shopping_electronics_per_month=2,
        shopping_clothing_items_per_month=10,
        waste_recycling_level="none"
    )
    result = calculate_footprint(profile)
    
    assert result.score < 50
    assert result.category == "High Impact"
    assert result.breakdown.food > 200

def test_calculate_footprint_low_impact():
    profile = CarbonProfileInput(
        transport_ev_km_per_week=50,
        transport_flights_hours_per_year=0,
        energy_kwh_per_month=200,
        energy_has_solar=True,
        food_habit="vegan",
        shopping_electronics_per_month=0,
        shopping_clothing_items_per_month=0,
        waste_recycling_level="full"
    )
    result = calculate_footprint(profile)
    
    assert result.score > 70
    assert result.category == "Low Impact"
