import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from main import app

client = TestClient(app)

# ─── /api/calculate ────────────────────────────────────────────────────────────

class TestCalculateEndpoint:
    def test_returns_200_with_valid_payload(self):
        response = client.post("/api/calculate", json={
            "transport_car_km_per_week": 100,
            "transport_flights_hours_per_year": 5,
            "energy_kwh_per_month": 300,
            "energy_has_solar": False,
            "food_habit": "mixed",
            "shopping_electronics_per_month": 1,
            "shopping_clothing_items_per_month": 2,
            "waste_recycling_level": "partial"
        })
        assert response.status_code == 200

    def test_response_schema(self):
        response = client.post("/api/calculate", json={
            "transport_car_km_per_week": 50,
            "food_habit": "vegan",
            "waste_recycling_level": "full",
        })
        assert response.status_code == 200
        data = response.json()
        assert "score" in data
        assert "monthly_emissions_kg" in data
        assert "annual_emissions_kg" in data
        assert "category" in data
        assert "breakdown" in data
        assert "financial_savings_estimate_usd" in data

    def test_score_in_valid_range(self):
        response = client.post("/api/calculate", json={
            "food_habit": "mixed",
            "waste_recycling_level": "partial"
        })
        data = response.json()
        assert 0 <= data["score"] <= 100

    def test_breakdown_fields_present(self):
        response = client.post("/api/calculate", json={
            "food_habit": "vegetarian",
            "waste_recycling_level": "partial",
        })
        bd = response.json()["breakdown"]
        for key in ["transport", "energy", "food", "shopping", "waste"]:
            assert key in bd

    def test_rejects_negative_car_km(self):
        response = client.post("/api/calculate", json={
            "transport_car_km_per_week": -50,
        })
        assert response.status_code == 422

    def test_rejects_negative_energy(self):
        response = client.post("/api/calculate", json={
            "energy_kwh_per_month": -10,
        })
        assert response.status_code == 422

    def test_rejects_negative_shopping_items(self):
        response = client.post("/api/calculate", json={
            "shopping_electronics_per_month": -3,
        })
        assert response.status_code == 422

    def test_default_profile_minimal_payload(self):
        """Sending empty body should succeed using pydantic defaults."""
        response = client.post("/api/calculate", json={})
        assert response.status_code == 200

    def test_vegan_lower_emissions_than_meat_heavy(self):
        vegan = client.post("/api/calculate", json={"food_habit": "vegan"}).json()
        meat = client.post("/api/calculate", json={"food_habit": "meat-heavy"}).json()
        assert vegan["monthly_emissions_kg"] < meat["monthly_emissions_kg"]

    def test_solar_lowers_energy_breakdown(self):
        no_solar = client.post("/api/calculate", json={
            "energy_kwh_per_month": 400, "energy_has_solar": False
        }).json()
        with_solar = client.post("/api/calculate", json={
            "energy_kwh_per_month": 400, "energy_has_solar": True
        }).json()
        assert with_solar["breakdown"]["energy"] < no_solar["breakdown"]["energy"]

    def test_all_food_habits_accepted(self):
        for habit in ["vegan", "vegetarian", "mixed", "meat-heavy"]:
            response = client.post("/api/calculate", json={"food_habit": habit})
            assert response.status_code == 200, f"Failed for food_habit={habit}"

    def test_all_recycling_levels_accepted(self):
        for level in ["none", "partial", "full"]:
            response = client.post("/api/calculate", json={"waste_recycling_level": level})
            assert response.status_code == 200, f"Failed for waste_recycling_level={level}"

    def test_category_is_string(self):
        response = client.post("/api/calculate", json={"food_habit": "mixed"})
        assert isinstance(response.json()["category"], str)

    def test_high_emissions_gives_high_impact_category(self):
        response = client.post("/api/calculate", json={
            "transport_car_km_per_week": 500,
            "transport_flights_hours_per_year": 200,
            "energy_kwh_per_month": 2000,
            "food_habit": "meat-heavy",
            "waste_recycling_level": "none",
        })
        data = response.json()
        assert data["score"] < 50
        assert data["category"] == "High Impact"


# ─── /api/coach ────────────────────────────────────────────────────────────────

class TestCoachEndpoint:
    def test_empty_chat_history_returns_400(self):
        response = client.post("/api/coach", json={"chat_history": []})
        assert response.status_code in [400, 503]

    def test_no_ai_agent_returns_503(self):
        """When ai_agent is None, any request should return 503."""
        import main as main_module
        original = main_module.ai_agent
        main_module.ai_agent = None
        try:
            response = client.post("/api/coach", json={
                "chat_history": [{"role": "user", "content": "Hello"}]
            })
            assert response.status_code == 503
        finally:
            main_module.ai_agent = original

    def test_coach_with_valid_history_when_ai_available(self):
        """If ai_agent is initialized, a valid request returns 200 or 500 (if AI fails)."""
        import main as main_module
        if main_module.ai_agent is None:
            pytest.skip("AI agent not initialized in test environment")
        response = client.post("/api/coach", json={
            "chat_history": [{"role": "user", "content": "How can I reduce my footprint?"}]
        })
        assert response.status_code in [200, 500]


# ─── /api/action-plan ─────────────────────────────────────────────────────────

class TestActionPlanEndpoint:
    def test_no_ai_agent_returns_503(self):
        import main as main_module
        original = main_module.ai_agent
        main_module.ai_agent = None
        try:
            response = client.post("/api/action-plan", json={"food_habit": "mixed"})
            assert response.status_code == 503
        finally:
            main_module.ai_agent = original

    def test_valid_profile_returns_correct_status_without_ai(self):
        import main as main_module
        if main_module.ai_agent is None:
            response = client.post("/api/action-plan", json={"food_habit": "vegan"})
            assert response.status_code == 503


# ─── /api/analyze-bill ────────────────────────────────────────────────────────

class TestAnalyzeBillEndpoint:
    def test_no_ai_agent_returns_503(self):
        import main as main_module
        original = main_module.ai_agent
        main_module.ai_agent = None
        try:
            dummy_file = b"\x89PNG\r\n\x1a\n"
            response = client.post(
                "/api/analyze-bill",
                files={"file": ("bill.png", dummy_file, "image/png")},
            )
            assert response.status_code == 503
        finally:
            main_module.ai_agent = original

    def test_invalid_file_type_returns_400(self):
        import main as main_module
        original = main_module.ai_agent
        # Temporarily set ai_agent to a non-None so we pass the ai_agent check
        main_module.ai_agent = MagicMock()
        try:
            response = client.post(
                "/api/analyze-bill",
                files={"file": ("doc.txt", b"hello", "text/plain")},
            )
            assert response.status_code == 400
        finally:
            main_module.ai_agent = original

    def test_valid_image_type_accepted_when_ai_present(self):
        """Allowed MIME types should pass the type validation gate."""
        import main as main_module
        if main_module.ai_agent is None:
            pytest.skip("AI agent not initialized in test environment")
        response = client.post(
            "/api/analyze-bill",
            files={"file": ("bill.jpg", b"\xff\xd8\xff", "image/jpeg")},
        )
        # Could be 200 or 500 (AI failure), not 400
        assert response.status_code != 400


# ─── /api/analyze-product ─────────────────────────────────────────────────────

class TestAnalyzeProductEndpoint:
    def test_no_ai_agent_returns_503(self):
        import main as main_module
        original = main_module.ai_agent
        main_module.ai_agent = None
        try:
            response = client.post(
                "/api/analyze-product",
                data={"product_description": "Plastic water bottle"},
            )
            assert response.status_code == 503
        finally:
            main_module.ai_agent = original

    def test_no_description_no_file_returns_400(self):
        import main as main_module
        original = main_module.ai_agent
        main_module.ai_agent = MagicMock()
        try:
            response = client.post("/api/analyze-product", data={"product_description": ""})
            assert response.status_code == 400
        finally:
            main_module.ai_agent = original

    def test_invalid_image_type_returns_400(self):
        import main as main_module
        original = main_module.ai_agent
        main_module.ai_agent = MagicMock()
        try:
            response = client.post(
                "/api/analyze-product",
                data={"product_description": "Bottle"},
                files={"file": ("doc.txt", b"hello", "text/plain")},
            )
            assert response.status_code == 400
        finally:
            main_module.ai_agent = original
