import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_calculate_emissions_endpoint():
    response = client.post(
        "/api/calculate",
        json={
            "transport_car_km_per_week": 100,
            "transport_flights_hours_per_year": 5,
            "energy_kwh_per_month": 300,
            "energy_has_solar": False,
            "food_habit": "mixed",
            "shopping_electronics_per_month": 1,
            "shopping_clothing_items_per_month": 2,
            "waste_recycling_level": "partial"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "monthly_emissions_kg" in data
    assert data["score"] >= 0 and data["score"] <= 100

def test_calculate_emissions_invalid_data():
    response = client.post(
        "/api/calculate",
        json={
            "transport_car_km_per_week": -50, # Invalid negative number
        }
    )
    assert response.status_code == 422 # Pydantic validation error

def test_coach_endpoint_missing_history():
    response = client.post(
        "/api/coach",
        json={
            "chat_history": []
        }
    )
    # Depending on whether AI is initialized, it might be 503 or 400
    assert response.status_code in [400, 503]
