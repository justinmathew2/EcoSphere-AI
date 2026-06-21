import math
import pytest
from calculator import calculate_footprint, CarbonProfileInput, EMISSION_FACTORS, CarbonCalculationResult


# ─── Helper ────────────────────────────────────────────────────────────────────

def make_zero_profile(**overrides) -> CarbonProfileInput:
    """Return a profile with all numeric fields at 0 and sensible string defaults."""
    defaults = dict(
        transport_car_km_per_week=0,
        transport_ev_km_per_week=0,
        transport_bus_km_per_week=0,
        transport_train_km_per_week=0,
        transport_bike_km_per_week=0,
        transport_flights_hours_per_year=0,
        energy_kwh_per_month=0,
        energy_ac_hours_per_week=0,
        energy_has_solar=False,
        food_habit="vegan",
        shopping_electronics_per_month=0,
        shopping_clothing_items_per_month=0,
        shopping_plastic_bags_per_week=0,
        waste_recycling_level="full",
    )
    defaults.update(overrides)
    return CarbonProfileInput(**defaults)


# ─── Result structure ──────────────────────────────────────────────────────────

class TestResultStructure:
    def test_returns_carbon_calculation_result(self):
        result = calculate_footprint(CarbonProfileInput())
        assert isinstance(result, CarbonCalculationResult)

    def test_all_required_fields_present(self):
        result = calculate_footprint(CarbonProfileInput())
        assert hasattr(result, "score")
        assert hasattr(result, "monthly_emissions_kg")
        assert hasattr(result, "annual_emissions_kg")
        assert hasattr(result, "category")
        assert hasattr(result, "breakdown")
        assert hasattr(result, "financial_savings_estimate_usd")

    def test_breakdown_fields_present(self):
        result = calculate_footprint(CarbonProfileInput())
        bd = result.breakdown
        assert hasattr(bd, "transport")
        assert hasattr(bd, "energy")
        assert hasattr(bd, "food")
        assert hasattr(bd, "shopping")
        assert hasattr(bd, "waste")

    def test_score_within_range(self):
        for profile in [
            CarbonProfileInput(),
            make_zero_profile(food_habit="mixed", waste_recycling_level="partial"),
        ]:
            result = calculate_footprint(profile)
            assert 0 <= result.score <= 100

    def test_annual_equals_12x_monthly(self):
        profile = CarbonProfileInput(transport_car_km_per_week=100, energy_kwh_per_month=300)
        result = calculate_footprint(profile)
        assert abs(result.annual_emissions_kg - result.monthly_emissions_kg * 12.0) < 0.01


# ─── Emission calculations ─────────────────────────────────────────────────────

class TestEmissionCalculations:
    def test_car_emission_math(self):
        """100 km/week * 4.33 * 0.20 = 86.6 kg/month transport."""
        profile = make_zero_profile(
            transport_car_km_per_week=100,
            food_habit="vegan",
            waste_recycling_level="full",
        )
        result = calculate_footprint(profile)
        expected_transport = round(100 * 4.33 * EMISSION_FACTORS["transport"]["car"], 1)
        assert result.breakdown.transport == expected_transport

    def test_ev_emission_math(self):
        profile = make_zero_profile(transport_ev_km_per_week=200, food_habit="vegan", waste_recycling_level="full")
        result = calculate_footprint(profile)
        expected = round(200 * 4.33 * EMISSION_FACTORS["transport"]["ev"], 1)
        assert result.breakdown.transport == expected

    def test_flight_emission_math(self):
        profile = make_zero_profile(transport_flights_hours_per_year=12, food_habit="vegan", waste_recycling_level="full")
        result = calculate_footprint(profile)
        expected = round((12 * EMISSION_FACTORS["transport"]["flight"]) / 12.0, 1)
        assert result.breakdown.transport == expected

    def test_electricity_without_solar(self):
        profile = make_zero_profile(energy_kwh_per_month=300, food_habit="vegan", waste_recycling_level="full")
        result = calculate_footprint(profile)
        expected = round(300 * EMISSION_FACTORS["energy"]["electricity"], 1)
        assert result.breakdown.energy == expected

    def test_electricity_with_solar(self):
        profile = make_zero_profile(energy_kwh_per_month=300, energy_has_solar=True, food_habit="vegan", waste_recycling_level="full")
        result = calculate_footprint(profile)
        expected = round(300 * EMISSION_FACTORS["energy"]["electricity_solar"], 1)
        assert result.breakdown.energy == expected

    def test_solar_reduces_energy_emissions(self):
        no_solar = make_zero_profile(energy_kwh_per_month=300, food_habit="vegan", waste_recycling_level="full")
        with_solar = make_zero_profile(energy_kwh_per_month=300, energy_has_solar=True, food_habit="vegan", waste_recycling_level="full")
        assert calculate_footprint(with_solar).breakdown.energy < calculate_footprint(no_solar).breakdown.energy

    def test_ac_emission_math(self):
        profile = make_zero_profile(energy_ac_hours_per_week=10, food_habit="vegan", waste_recycling_level="full")
        result = calculate_footprint(profile)
        expected = round(10 * 4.33 * EMISSION_FACTORS["energy"]["ac_hour"], 1)
        assert result.breakdown.energy == expected

    def test_vegan_food_emission(self):
        profile = make_zero_profile(food_habit="vegan", waste_recycling_level="full")
        result = calculate_footprint(profile)
        expected = round(EMISSION_FACTORS["food"]["vegan"] * 30.4, 1)
        assert result.breakdown.food == expected

    def test_meat_heavy_food_emission(self):
        profile = make_zero_profile(food_habit="meat-heavy", waste_recycling_level="full")
        result = calculate_footprint(profile)
        expected = round(EMISSION_FACTORS["food"]["meat-heavy"] * 30.4, 1)
        assert result.breakdown.food == expected

    def test_vegetarian_food_emission(self):
        profile = make_zero_profile(food_habit="vegetarian", waste_recycling_level="full")
        result = calculate_footprint(profile)
        expected = round(EMISSION_FACTORS["food"]["vegetarian"] * 30.4, 1)
        assert result.breakdown.food == expected

    def test_mixed_food_emission(self):
        profile = make_zero_profile(food_habit="mixed", waste_recycling_level="full")
        result = calculate_footprint(profile)
        expected = round(EMISSION_FACTORS["food"]["mixed"] * 30.4, 1)
        assert result.breakdown.food == expected

    def test_unknown_food_habit_falls_back_to_mixed(self):
        profile = make_zero_profile(food_habit="carnivore", waste_recycling_level="full")
        result = calculate_footprint(profile)
        expected = round(EMISSION_FACTORS["food"]["mixed"] * 30.4, 1)
        assert result.breakdown.food == expected

    def test_shopping_electronics_emission(self):
        profile = make_zero_profile(shopping_electronics_per_month=2, food_habit="vegan", waste_recycling_level="full")
        result = calculate_footprint(profile)
        expected = round(2 * EMISSION_FACTORS["shopping"]["electronics"], 1)
        assert result.breakdown.shopping == expected

    def test_shopping_clothing_emission(self):
        profile = make_zero_profile(shopping_clothing_items_per_month=5, food_habit="vegan", waste_recycling_level="full")
        result = calculate_footprint(profile)
        expected = round(5 * EMISSION_FACTORS["shopping"]["clothing"], 1)
        assert result.breakdown.shopping == expected

    def test_plastic_bags_emission(self):
        profile = make_zero_profile(shopping_plastic_bags_per_week=10, food_habit="vegan", waste_recycling_level="full")
        result = calculate_footprint(profile)
        expected = round(10 * 4.33 * EMISSION_FACTORS["shopping"]["plastic_bag"], 1)
        assert result.breakdown.shopping == expected

    def test_waste_none_emission(self):
        profile = make_zero_profile(food_habit="vegan", waste_recycling_level="none")
        result = calculate_footprint(profile)
        expected = round(EMISSION_FACTORS["waste"]["none"] * 30.4, 1)
        assert result.breakdown.waste == expected

    def test_waste_partial_emission(self):
        profile = make_zero_profile(food_habit="vegan", waste_recycling_level="partial")
        result = calculate_footprint(profile)
        expected = round(EMISSION_FACTORS["waste"]["partial"] * 30.4, 1)
        assert result.breakdown.waste == expected

    def test_waste_full_emission(self):
        profile = make_zero_profile(food_habit="vegan", waste_recycling_level="full")
        result = calculate_footprint(profile)
        expected = round(EMISSION_FACTORS["waste"]["full"] * 30.4, 1)
        assert result.breakdown.waste == expected

    def test_monthly_equals_sum_of_breakdown(self):
        profile = CarbonProfileInput(
            transport_car_km_per_week=100,
            energy_kwh_per_month=300,
            food_habit="mixed",
            shopping_electronics_per_month=1,
            waste_recycling_level="partial",
        )
        result = calculate_footprint(profile)
        bd = result.breakdown
        total = round(bd.transport + bd.energy + bd.food + bd.shopping + bd.waste, 1)
        assert result.monthly_emissions_kg == total


# ─── Score and Category ────────────────────────────────────────────────────────

class TestScoreAndCategory:
    def test_default_profile_score_in_range(self):
        result = calculate_footprint(CarbonProfileInput())
        assert 0 <= result.score <= 100

    def test_high_emission_gives_low_score(self):
        profile = CarbonProfileInput(
            transport_car_km_per_week=500,
            transport_flights_hours_per_year=200,
            energy_kwh_per_month=2000,
            food_habit="meat-heavy",
            shopping_electronics_per_month=5,
            shopping_clothing_items_per_month=20,
            waste_recycling_level="none",
        )
        result = calculate_footprint(profile)
        assert result.score < 50
        assert result.category == "High Impact"

    def test_low_emission_gives_high_score(self):
        profile = CarbonProfileInput(
            transport_ev_km_per_week=50,
            transport_flights_hours_per_year=0,
            energy_kwh_per_month=100,
            energy_has_solar=True,
            food_habit="vegan",
            shopping_electronics_per_month=0,
            shopping_clothing_items_per_month=0,
            waste_recycling_level="full",
        )
        result = calculate_footprint(profile)
        assert result.score > 70
        assert result.category == "Low Impact"

    def test_score_formula_matches_exponential(self):
        """Verify the score math: int(100 * exp(-total / 850))."""
        profile = CarbonProfileInput(energy_kwh_per_month=500, food_habit="mixed")
        result = calculate_footprint(profile)
        expected_score = int(100 * math.exp(-result.monthly_emissions_kg / 850.0))
        expected_score = max(0, min(100, expected_score))
        assert result.score == expected_score

    def test_category_low_impact_threshold(self):
        """Score >= 70 → Low Impact."""
        profile = make_zero_profile(food_habit="vegan", waste_recycling_level="full")
        result = calculate_footprint(profile)
        if result.score >= 70:
            assert result.category == "Low Impact"

    def test_category_moderate_impact_threshold(self):
        profile = CarbonProfileInput(
            transport_car_km_per_week=200,
            energy_kwh_per_month=400,
            food_habit="mixed",
        )
        result = calculate_footprint(profile)
        if 40 <= result.score < 70:
            assert result.category == "Moderate Impact"

    def test_category_high_impact_threshold(self):
        profile = CarbonProfileInput(
            transport_car_km_per_week=500,
            transport_flights_hours_per_year=100,
            energy_kwh_per_month=2000,
            food_habit="meat-heavy",
        )
        result = calculate_footprint(profile)
        if result.score < 40:
            assert result.category == "High Impact"

    def test_higher_emission_gives_lower_score(self):
        low = CarbonProfileInput(transport_car_km_per_week=50, food_habit="vegan")
        high = CarbonProfileInput(transport_car_km_per_week=500, food_habit="meat-heavy")
        assert calculate_footprint(low).score > calculate_footprint(high).score


# ─── Financial Savings ─────────────────────────────────────────────────────────

class TestFinancialSavings:
    def test_no_eco_actions_zero_savings(self):
        profile = make_zero_profile(food_habit="mixed", waste_recycling_level="none")
        result = calculate_footprint(profile)
        assert result.financial_savings_estimate_usd == 0.0

    def test_solar_adds_savings(self):
        no_solar = make_zero_profile(food_habit="vegan", waste_recycling_level="none")
        with_solar = make_zero_profile(energy_has_solar=True, food_habit="vegan", waste_recycling_level="none")
        assert calculate_footprint(with_solar).financial_savings_estimate_usd > calculate_footprint(no_solar).financial_savings_estimate_usd

    def test_full_recycling_adds_savings(self):
        no_recycle = make_zero_profile(food_habit="vegan", waste_recycling_level="none")
        full_recycle = make_zero_profile(food_habit="vegan", waste_recycling_level="full")
        assert calculate_footprint(full_recycle).financial_savings_estimate_usd > calculate_footprint(no_recycle).financial_savings_estimate_usd

    def test_bus_travel_adds_savings(self):
        no_bus = make_zero_profile(food_habit="vegan", waste_recycling_level="none")
        with_bus = make_zero_profile(transport_bus_km_per_week=100, food_habit="vegan", waste_recycling_level="none")
        assert calculate_footprint(with_bus).financial_savings_estimate_usd > calculate_footprint(no_bus).financial_savings_estimate_usd

    def test_savings_non_negative(self):
        result = calculate_footprint(CarbonProfileInput())
        assert result.financial_savings_estimate_usd >= 0.0


# ─── Edge Cases ────────────────────────────────────────────────────────────────

class TestEdgeCases:
    def test_all_zero_profile_does_not_crash(self):
        profile = make_zero_profile(food_habit="vegan", waste_recycling_level="full")
        result = calculate_footprint(profile)
        assert result.monthly_emissions_kg >= 0

    def test_extreme_high_values_score_not_below_zero(self):
        profile = CarbonProfileInput(
            transport_car_km_per_week=9999,
            transport_flights_hours_per_year=9999,
            energy_kwh_per_month=9999,
            food_habit="meat-heavy",
            shopping_electronics_per_month=99,
            shopping_clothing_items_per_month=99,
            shopping_plastic_bags_per_week=99,
            waste_recycling_level="none",
        )
        result = calculate_footprint(profile)
        assert result.score >= 0

    def test_output_values_are_rounded(self):
        profile = CarbonProfileInput(transport_car_km_per_week=33, energy_kwh_per_month=77)
        result = calculate_footprint(profile)
        # Should be rounded to 1 decimal place
        assert result.monthly_emissions_kg == round(result.monthly_emissions_kg, 1)
        assert result.annual_emissions_kg == round(result.annual_emissions_kg, 1)

    def test_pydantic_validation_rejects_negative_transport(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            CarbonProfileInput(transport_car_km_per_week=-10)

    def test_pydantic_validation_rejects_negative_energy(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            CarbonProfileInput(energy_kwh_per_month=-5)

    def test_pydantic_validation_rejects_negative_shopping(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            CarbonProfileInput(shopping_electronics_per_month=-1)
