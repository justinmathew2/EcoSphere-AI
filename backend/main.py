import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional

from .calculator import CarbonProfileInput, calculate_footprint, CarbonCalculationResult
from .ai_agent import AIAgent, ChatMessage, ActionPlan, BillAnalysisResult, ProductAnalysisResult

app = FastAPI(
    title="EcoSphere AI API",
    description="Backend API for Carbon Footprint tracking and AI recommendations"
)

# Enable CORS for local development (frontend running on Vite dev port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AIAgent (requires Vertex AI credentials in environment)
try:
    ai_agent = AIAgent()
    print("AIAgent initialized successfully.")
except Exception as e:
    ai_agent = None
    print(f"Warning: Failed to initialize AIAgent. AI features will be disabled. Error: {e}")

# Helper to construct user profile summary text for the AI prompt
def get_profile_summary(profile: Optional[CarbonProfileInput]) -> str:
    if not profile:
        return "No carbon profile calculated yet. The user has no data entered."
    
    # Calculate footprint to get scores
    res = calculate_footprint(profile)
    
    summary = f"""
- Carbon Score: {res.score}/100 ({res.category})
- Monthly Emissions: {res.monthly_emissions_kg} kg CO2
- Breakdown:
  * Transportation: {res.breakdown.transport} kg CO2
  * Home Energy: {res.breakdown.energy} kg CO2
  * Food: {res.breakdown.food} kg CO2
  * Shopping: {res.breakdown.shopping} kg CO2
  * Waste Management: {res.breakdown.waste} kg CO2
- Transportation details:
  * Gasoline Car: {profile.transport_car_km_per_week} km/week
  * EV: {profile.transport_ev_km_per_week} km/week
  * Bus: {profile.transport_bus_km_per_week} km/week
  * Train: {profile.transport_train_km_per_week} km/week
  * Flights: {profile.transport_flights_hours_per_year} hours/year
- Home Energy details:
  * Electricity: {profile.energy_kwh_per_month} kWh/month
  * AC usage: {profile.energy_ac_hours_per_week} hours/week
  * Has solar panels: {profile.energy_has_solar}
- Food Diet Habit: {profile.food_habit}
- Shopping details:
  * Electronics bought: {profile.shopping_electronics_per_month} items/month
  * Clothing bought: {profile.shopping_clothing_items_per_month} items/month
  * Plastic bags used: {profile.shopping_plastic_bags_per_week} bags/week
- Waste recycling level: {profile.waste_recycling_level}
"""
    return summary

# --- Request Models ---

class CoachRequest(BaseModel):
    chat_history: List[ChatMessage]
    profile: Optional[CarbonProfileInput] = None

# --- API Endpoints ---

@app.post("/api/calculate", response_model=CarbonCalculationResult)
def calculate_emissions(profile: CarbonProfileInput):
    """
    Calculate estimated carbon emissions and Carbon Score from user daily habits.
    """
    try:
        return calculate_footprint(profile)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {e}")

@app.post("/api/coach")
def chat_with_coach(request: CoachRequest):
    """
    Interact with the AI Sustainability Coach.
    Returns tailored sustainability advice based on chat history and carbon profile.
    """
    if not ai_agent:
        raise HTTPException(status_code=503, detail="Gemini AI Agent is not initialized.")
    if not request.chat_history:
        raise HTTPException(status_code=400, detail="Chat history cannot be empty.")
    
    try:
        profile_summary = get_profile_summary(request.profile)
        response_text = ai_agent.generate_coach_response(request.chat_history, profile_summary)
        return {"response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Coach error: {e}")

@app.post("/api/action-plan", response_model=ActionPlan)
def get_weekly_action_plan(profile: CarbonProfileInput):
    """
    Generate a personalized weekly action plan based on user habits.
    """
    if not ai_agent:
        raise HTTPException(status_code=503, detail="Gemini AI Agent is not initialized.")
    
    try:
        profile_summary = get_profile_summary(profile)
        return ai_agent.generate_action_plan(profile_summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Action Plan error: {e}")

@app.post("/api/analyze-bill", response_model=BillAnalysisResult)
async def upload_and_analyze_bill(file: UploadFile = File(...)):
    """
    Upload an electricity bill (image or PDF) and analyze it using Gemini multimodal vision.
    """
    if not ai_agent:
        raise HTTPException(status_code=503, detail="Gemini AI Agent is not initialized.")
    
    # Verify MIME type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}")
    
    try:
        file_bytes = await file.read()
        return ai_agent.analyze_electricity_bill(file_bytes, file.content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bill Analysis error: {e}")

@app.post("/api/analyze-product", response_model=ProductAnalysisResult)
async def upload_and_analyze_product(
    product_description: str = Form(""),
    file: Optional[UploadFile] = File(None)
):
    """
    Provide sustainability insights for a product based on description or uploaded photo.
    """
    if not ai_agent:
        raise HTTPException(status_code=503, detail="Gemini AI Agent is not initialized.")
    
    file_bytes = None
    content_type = None
    
    if file:
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail=f"Invalid image type. Allowed types: {', '.join(allowed_types)}")
        file_bytes = await file.read()
        content_type = file.content_type
        
    if not product_description and not file:
        raise HTTPException(status_code=400, detail="Must provide either a product description or an image.")
    
    try:
        return ai_agent.analyze_product_sustainability(product_description, file_bytes, content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Product analysis error: {e}")

# Serve compiled React frontend files if they exist
# This is placed at the end of definitions so it doesn't shadow api endpoints
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
frontend_dist = os.path.join(project_root, "frontend", "dist")

if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
    print(f"Mounted React static build directory from {frontend_dist}")
else:
    print(f"Running in API-only mode. Static folder not found at {frontend_dist}. Build frontend to mount it.")
