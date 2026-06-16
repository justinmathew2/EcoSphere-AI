import math
from pydantic import BaseModel, Field

# Constants for emission factors (in kg CO2)
EMISSION_FACTORS = {
    "transport": {
        "car": 0.20,      # per km
        "ev": 0.05,       # per km
        "bus": 0.08,      # per km
        "train": 0.04,     # per km
        "flight": 90.0,    # per hour of flight
        "bike": 0.0,       # per km
    },
    "energy": {
        "electricity": 0.45,       # per kWh (grid average)
        "electricity_solar": 0.08, # per kWh (reduced grid impact)
        "ac_hour": 0.8,            # per hour of AC (approx 1.8 kW unit)
    },
    "food": {
        "vegan": 2.5,       # per day
        "vegetarian": 3.3,  # per day
        "mixed": 5.0,       # per day
        "meat-heavy": 7.2,  # per day
    },
    "shopping": {
        "electronics": 80.0, # per major item
        "clothing": 10.0,    # per clothing item
        "plastic_bag": 0.1,  # per plastic bag
    },
    "waste": {
        "none": 1.5,     # kg CO2/day (no recycling, all landfill)
        "partial": 0.8,  # kg CO2/day (some recycling)
        "full": 0.2,     # kg CO2/day (composting & recycling)
    }
}

class CarbonProfileInput(BaseModel):
    transport_car_km_per_week: float = Field(default=0.0, ge=0.0)
    transport_ev_km_per_week: float = Field(default=0.0, ge=0.0)
    transport_bus_km_per_week: float = Field(default=0.0, ge=0.0)
    transport_train_km_per_week: float = Field(default=0.0, ge=0.0)
    transport_bike_km_per_week: float = Field(default=0.0, ge=0.0)
    transport_flights_hours_per_year: float = Field(default=0.0, ge=0.0)
    
    energy_kwh_per_month: float = Field(default=0.0, ge=0.0)
    energy_ac_hours_per_week: float = Field(default=0.0, ge=0.0)
    energy_has_solar: bool = Field(default=False)
    
    food_habit: str = Field(default="mixed") # vegan, vegetarian, mixed, meat-heavy
    
    shopping_electronics_per_month: int = Field(default=0, ge=0)
    shopping_clothing_items_per_month: int = Field(default=0, ge=0)
    shopping_plastic_bags_per_week: int = Field(default=0, ge=0)
    
    waste_recycling_level: str = Field(default="partial") # none, partial, full

class CarbonBreakdown(BaseModel):
    transport: float
    energy: float
    food: float
    shopping: float
    waste: float

class CarbonCalculationResult(BaseModel):
    monthly_emissions_kg: float
    annual_emissions_kg: float
    score: int # 0-100 (higher is better/greener)
    category: str # Low, Moderate, High Impact
    breakdown: CarbonBreakdown
    financial_savings_estimate_usd: float

def calculate_footprint(profile: CarbonProfileInput) -> CarbonCalculationResult:
    # 1. Transport monthly emissions
    # weekly km * 4.33 weeks/month * factor
    transport_monthly = (
        profile.transport_car_km_per_week * 4.33 * EMISSION_FACTORS["transport"]["car"] +
        profile.transport_ev_km_per_week * 4.33 * EMISSION_FACTORS["transport"]["ev"] +
        profile.transport_bus_km_per_week * 4.33 * EMISSION_FACTORS["transport"]["bus"] +
        profile.transport_train_km_per_week * 4.33 * EMISSION_FACTORS["transport"]["train"]
    )
    # Annual flight hours divided by 12 * factor
    transport_monthly += (profile.transport_flights_hours_per_year * EMISSION_FACTORS["transport"]["flight"]) / 12.0

    # 2. Energy monthly emissions
    electricity_factor = EMISSION_FACTORS["energy"]["electricity_solar"] if profile.energy_has_solar else EMISSION_FACTORS["energy"]["electricity"]
    energy_monthly = profile.energy_kwh_per_month * electricity_factor
    energy_monthly += profile.energy_ac_hours_per_week * 4.33 * EMISSION_FACTORS["energy"]["ac_hour"]

    # 3. Food monthly emissions (daily factor * 30.4 days/month)
    food_factor = EMISSION_FACTORS["food"].get(profile.food_habit, EMISSION_FACTORS["food"]["mixed"])
    food_monthly = food_factor * 30.4

    # 4. Shopping monthly emissions
    shopping_monthly = (
        profile.shopping_electronics_per_month * EMISSION_FACTORS["shopping"]["electronics"] +
        profile.shopping_clothing_items_per_month * EMISSION_FACTORS["shopping"]["clothing"] +
        profile.shopping_plastic_bags_per_week * 4.33 * EMISSION_FACTORS["shopping"]["plastic_bag"]
    )

    # 5. Waste monthly emissions (daily factor * 30.4)
    waste_factor = EMISSION_FACTORS["waste"].get(profile.waste_recycling_level, EMISSION_FACTORS["waste"]["partial"])
    waste_monthly = waste_factor * 30.4

    # Totals
    total_monthly = transport_monthly + energy_monthly + food_monthly + shopping_monthly + waste_monthly
    total_annual = total_monthly * 12.0

    # Carbon Score (0-100) where 100 is best.
    # Mathematical exponential function where ~800 kg/month corresponds to a score of 50.
    score = int(100 * math.exp(-total_monthly / 850.0))
    score = max(0, min(100, score))

    # Determine impact level
    if score >= 70:
        impact_category = "Low Impact"
    elif score >= 40:
        impact_category = "Moderate Impact"
    else:
        impact_category = "High Impact"

    # Financial Savings Estimate
    # Estimate savings if user switches to solar, drives less, recycles, etc.
    # We can calculate a baseline hypothetical 'high impact' state and estimate savings.
    # Or calculate direct estimated savings based on eco actions:
    # E.g. Solar saves ~$0.15 per kWh, biking instead of driving saves ~$0.12/km, etc.
    savings_est = 0.0
    if profile.energy_has_solar:
        # Solar saves approx $0.15 per kwh generated (assuming 150 kwh generated)
        savings_est += 150.0 * 0.15
    # Biking/walking or bus saves fuel
    saved_car_km = profile.transport_bike_km_per_week + profile.transport_bus_km_per_week + profile.transport_train_km_per_week
    savings_est += (saved_car_km * 4.33) * 0.10 # $0.10 saved per km
    # Waste recycling saves raw purchases
    if profile.waste_recycling_level == "full":
        savings_est += 20.0 # $20/month shopping savings from conscious reusage
    elif profile.waste_recycling_level == "partial":
        savings_est += 8.0

    return CarbonCalculationResult(
        monthly_emissions_kg=round(total_monthly, 1),
        annual_emissions_kg=round(total_annual, 1),
        score=score,
        category=impact_category,
        breakdown=CarbonBreakdown(
            transport=round(transport_monthly, 1),
            energy=round(energy_monthly, 1),
            food=round(food_monthly, 1),
            shopping=round(shopping_monthly, 1),
            waste=round(waste_monthly, 1)
        ),
        financial_savings_estimate_usd=round(savings_est, 2)
    )
