import os
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List, Optional

# Project configuration
PROJECT_ID = "deployfesthack"
LOCATION = "us-central1"
MODEL_NAME = "gemini-2.5-flash"

def get_client() -> genai.Client:
    return genai.Client(
        vertexai=True,
        project=PROJECT_ID,
        location=LOCATION
    )

# --- Pydantic Schemas for AI Responses ---

class CarbonRecommendation(BaseModel):
    category: str = Field(description="The category of recommendation (e.g., Transport, Energy, Food, Shopping, Waste)")
    description: str = Field(description="A clear, actionable, personalized instruction to reduce carbon footprint")
    estimated_co2_savings_kg: float = Field(description="Estimated monthly CO2 savings in kg")
    estimated_cost_savings_usd: float = Field(description="Estimated monthly financial savings in USD")

class ActionPlan(BaseModel):
    title: str = Field(description="Title of the weekly action plan")
    score_impact: int = Field(description="Expected improvements to the user's Carbon Score (e.g., +5, +10)")
    recommendations: List[CarbonRecommendation] = Field(description="List of 3 sustainability recommendations")

class BillAnalysisResult(BaseModel):
    provider: str = Field(description="Name of the utility provider")
    billing_period: str = Field(description="Billing period or month")
    consumption_kwh: float = Field(description="Electricity usage in kWh")
    total_amount: float = Field(description="Total bill amount in USD")
    estimated_co2_kg: float = Field(description="Estimated carbon emissions for this usage in kg CO2")
    recommendations: List[str] = Field(description="3-4 highly actionable tips based on this bill to reduce electricity footprint")

class ProductAnalysisResult(BaseModel):
    product_name: str = Field(description="Identified or input product name")
    sustainability_rating: int = Field(description="Sustainability rating out of 5 (1 is worst, 5 is best)")
    estimated_carbon_impact: str = Field(description="Carbon impact level: 'Low', 'Moderate', or 'High'")
    estimated_co2_kg: float = Field(description="Estimated CO2 footprint of this product (lifecycle or manufacture, in kg CO2)")
    materials_analysis: str = Field(description="Brief assessment of the product materials and packaging sustainability")
    key_recommendation: str = Field(description="Top recommendation for this product (e.g. use longer, recycle, buy refilled)")
    eco_friendly_alternatives: List[str] = Field(description="3-4 greener alternative products or options")

# --- Chat Schema ---

class ChatMessage(BaseModel):
    role: str # 'user' or 'model'
    content: str

# --- AI Workflows ---

class AIAgent:
    def __init__(self):
        self.client = get_client()

    def generate_coach_response(self, chat_history: List[ChatMessage], user_profile_summary: str) -> str:
        """
        Generates a natural language response for the AI Sustainability Coach.
        Incorporates user's carbon footprint profile summary to keep recommendations contextualized.
        """
        system_instruction = f"""
You are the EcoSphere AI Sustainability Coach, a friendly, encouraging, and highly knowledgeable environmental expert.
Your goal is to guide users to understand their carbon footprint and suggest realistic, high-impact ways to reduce emissions and save money.

Here is the user's carbon footprint summary profile:
{user_profile_summary}

Refer to this profile to give personalized and context-aware advice. For example:
- If their transport footprint is high, focus on commuting, electric vehicles, biking, or public transit.
- If their food footprint is high, encourage delicious plant-based swaps.
- If their energy is high, talk about AC efficiency, smart thermostats, or solar.
Keep your tone positive, practical, and non-judgmental. Keep responses relatively concise and structured with bullet points.
"""
        # Formulate contents
        contents = []
        for msg in chat_history[:-1]:
            role_param = "user" if msg.role == "user" else "model"
            contents.append(types.Content(role=role_param, parts=[types.Part.from_text(text=msg.content)]))
        
        # Add the latest user message
        contents.append(chat_history[-1].content)
        
        response = self.client.models.generate_content(
            model=MODEL_NAME,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
            )
        )
        return response.text

    def generate_action_plan(self, user_profile_summary: str) -> ActionPlan:
        """
        Generates a personalized weekly action plan with Pydantic structured output.
        """
        prompt = f"""
Given the following user carbon footprint profile, generate a highly custom 3-item action plan.
Profile:
{user_profile_summary}

Create concrete, actionable weekly tasks like "Take a bus instead of driving 3 times this week" or "Turn off AC 1 hour earlier daily".
Provide estimated carbon savings (in kg CO2) and financial savings (in USD) that the user can expect to save in a month.
"""
        response = self.client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ActionPlan,
                temperature=0.3
            )
        )
        # The response.text will be a valid ActionPlan JSON string.
        # FastAPI will return it as a structured object.
        return ActionPlan.model_validate_json(response.text)

    def analyze_electricity_bill(self, file_bytes: bytes, mime_type: str) -> BillAnalysisResult:
        """
        Analyzes an uploaded electricity bill (image or PDF) and extracts structured info.
        """
        prompt = """
Analyze this electricity bill.
Extract:
1. The provider name (e.g. "Green Energy Co.", "City Power"). If not visible, guess or use "Unknown Provider".
2. The billing period (e.g. "June 2026", "05/01/26 - 06/01/26").
3. The total electricity consumption in kWh. If only cost is shown, estimate the kWh (assume $0.15 per kWh).
4. The total bill amount in USD.
5. The estimated carbon emissions for this usage (kWh * 0.45 kg CO2/kWh).
6. Create 3-4 specific, actionable tips to reduce electricity consumption based on the bill and standard tips.
"""
        part = types.Part.from_bytes(
            data=file_bytes,
            mime_type=mime_type
        )
        response = self.client.models.generate_content(
            model=MODEL_NAME,
            contents=[part, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=BillAnalysisResult,
                temperature=0.2
            )
        )
        return BillAnalysisResult.model_validate_json(response.text)

    def analyze_product_sustainability(self, product_description: str, file_bytes: Optional[bytes] = None, mime_type: Optional[str] = None) -> ProductAnalysisResult:
        """
        Analyzes a product (by text description, uploaded photo/label, or both) and returns a sustainability rating and green alternatives.
        """
        prompt = f"""
You are an expert product sustainability advisor. Analyze the product described or shown.
If a photo is uploaded, inspect the product, label, ingredients, or brand.
Product description: {product_description}

Provide:
1. Product Name.
2. Sustainability rating (1 to 5 stars).
3. Estimated carbon impact level (Low, Moderate, High).
4. Estimated carbon footprint (kg CO2 per unit/use).
5. Analysis of materials/packaging (e.g. single-use plastic, recyclable cardboard, organic cotton, etc.).
6. Key recommendation for sustainable usage or purchase.
7. List 3 eco-friendly alternatives (specific greener products or behavior swaps, e.g. "Bamboo toothbrush", "Reusable glass bottle").
"""
        contents = []
        if file_bytes and mime_type:
            part = types.Part.from_bytes(
                data=file_bytes,
                mime_type=mime_type
            )
            contents.append(part)
        
        contents.append(prompt)
        
        response = self.client.models.generate_content(
            model=MODEL_NAME,
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ProductAnalysisResult,
                temperature=0.3
            )
        )
        return ProductAnalysisResult.model_validate_json(response.text)
