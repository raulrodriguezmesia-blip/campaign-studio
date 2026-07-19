import json
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import requests
from dotenv import load_dotenv
from backend.src.opentelemetry_setup import campaigns_generated, openai_api_errors, tracer

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
AI_PROVIDER = os.getenv("AI_PROVIDER", "openai").strip().lower()

if AI_PROVIDER == "groq":
    AI_API_KEY = GROQ_API_KEY
    AI_BASE_URL = os.getenv("AI_BASE_URL", "https://api.groq.com/openai/v1").rstrip("/")
    AI_MODEL = os.getenv("AI_MODEL", "mixtral-8x7b-32768")
    USE_SIMULATOR = not AI_API_KEY
else:
    AI_API_KEY = OPENAI_API_KEY
    AI_BASE_URL = os.getenv("AI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    AI_MODEL = os.getenv("AI_MODEL", "gpt-4o-mini")
    USE_SIMULATOR = not AI_API_KEY or AI_API_KEY == "sk-test-key"

# Allowed CORS origins (frontend on Vercel + local dev).
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "CORS_ORIGINS",
        "https://campaign-studio-new.vercel.app,http://localhost:8080,http://localhost:3000",
    ).split(",")
    if o.strip()
]

app = FastAPI(title="Campaign Concept Studio API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CampaignBrief(BaseModel):
    campaign_brief: str = Field(..., min_length=10, max_length=1000)
    target_audience: str = Field(..., min_length=5, max_length=500)
    product_details: str = Field(..., min_length=5, max_length=1000)
    tone: str = Field(..., min_length=3, max_length=100)
    channels: str = Field(..., min_length=3, max_length=200)


@app.get("/api/health")
async def health():
    return {"status": "ok", "source": "campaign-studio"}


@app.get("/api/config")
async def config():
    """Expose runtime config so the frontend knows which mode is active."""
    return {
        "mode": "simulator" if USE_SIMULATOR else AI_PROVIDER,
        "model": AI_MODEL,
        "cors_origins": CORS_ORIGINS,
    }


@app.post("/api/generate")
async def generate_campaign(brief: CampaignBrief):
        try:
            response_payload = create_campaign_concept(brief)
            return JSONResponse(content=response_payload)
        except Exception as exc:
            detail = str(exc)
            # Try to expose OpenAI's real error body for debugging.
            try:
                if hasattr(exc, "response") and exc.response is not None:
                    body = exc.response.json()
                    detail = body.get("error", {}).get("message") or detail
            except Exception:
                pass
            raise HTTPException(status_code=500, detail=detail)


def create_campaign_concept(brief: CampaignBrief) -> dict:
    # Si no hay API Key, usar simulador gratuito
    if USE_SIMULATOR:
        return create_campaign_simulator(brief)

    system_prompt = (
        "You are a campaign concept studio assistant. Given the campaign brief, target audience, "
        "product details, tone, and channels, generate a concise campaign concept, three headline/body "
        "copy variants, a launch checklist, and three image prompts for campaign direction. "
        "Respond with JSON only."
    )
    user_prompt = (
        f"Campaign Brief: {brief.campaign_brief}\n"
        f"Target Audience: {brief.target_audience}\n"
        f"Product Details: {brief.product_details}\n"
        f"Tone: {brief.tone}\n"
        f"Channels: {brief.channels}\n\n"
        "Respond with JSON only under the keys: campaignConcept, variants, checklist, imagePrompts. "
        "campaignConcept is a short summary. variants is an array of 3 objects with 'headline' and 'body'. "
        "checklist is an array of tasks. imagePrompts is an array of 3 strings."
    )

    response_payload = {
        "model": AI_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "response_format": {"type": "json_object"},
        "max_tokens": 800,
        "temperature": 0.8,
    }

    with tracer.start_as_current_span("create_campaign_concept") as span:
        span.set_attribute("campaign.brief_length", len(brief.campaign_brief))
        span.set_attribute("campaign.audience", brief.target_audience[:50])

        try:
            response = requests.post(
                f"{AI_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {AI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=response_payload,
                timeout=60,
            )
            response.raise_for_status()
            data = response.json()

            content = data["choices"][0]["message"]["content"]
            output = json.loads(content)

            # The text model only produces copy + image *prompts*.
            # Real image generation is left to the user via the returned prompts
            # (e.g. Bing Image Creator). This keeps the endpoint 100% text-only
            # and avoids any image-input model errors.
            prompts = output.get("imagePrompts", [])

            campaigns_generated.add(1)
            span.set_attribute("campaign.variants_count", len(output.get("variants", [])))

            return {
                "campaignConcept": output.get("campaignConcept", ""),
                "variants": output.get("variants", []),
                "checklist": output.get("checklist", []),
                "imagePrompts": prompts,
                "images": [],
            }
        except Exception as exc:
            openai_api_errors.add(1, {"error": str(exc)})
            span.record_exception(exc)
            raise


def parse_responses_output(data: dict) -> dict | None:
    for item in data.get("output", []):
        if item.get("type") != "message":
            continue
        for content in item.get("content", []):
            if content.get("type") == "output_text":
                text = content.get("text")
                if not text:
                    continue
                try:
                    return json.loads(text)
                except json.JSONDecodeError:
                    continue
            if content.get("type") == "text":
                text = content.get("text")
                if not text:
                    continue
                try:
                    return json.loads(text)
                except json.JSONDecodeError:
                    continue
    if data.get("output"):
        first_item = data["output"][0]
        for content in first_item.get("content", []):
            text = content.get("text")
            if text:
                try:
                    return json.loads(text)
                except json.JSONDecodeError:
                    continue
    return None


def create_campaign_simulator(brief: CampaignBrief) -> dict:
    """Simulador gratuito para generar campañas sin API Key real"""
    # Generar concepto basado en el brief
    campaign_concept = f"Campaña integral para '{brief.campaign_brief}' dirigida a {brief.target_audience}. {brief.product_details} con tono {brief.tone.lower()} para canales como {brief.channels}."
    
    # Generar variantes de copy
    variants = [
        {
            "headline": f"Transforma tu negocio con {brief.product_details[:40]}",
            "body": f"Descubre cómo un enfoque {brief.tone.lower()} puede impulsar tu negocio a través de {brief.channels.split(',')[0].strip()}. Solución perfecta para {brief.target_audience}."
        },
        {
            "headline": f"Tu visión, nuestro enfoque",
            "body": f"Soluciones {brief.tone.lower()} para {brief.channels}. {brief.product_details} diseñado especialmente para {brief.target_audience}. ¡Descubre la diferencia!"
        },
        {
            "headline": f"Innovación que conecta",
            "body": f"Campaña estratégica para {brief.target_audience}. Enfoque {brief.tone.lower()} en {brief.product_details}. Accede ahora y transforma tu experiencia."
        }
    ]
    
    # Generar checklist
    checklist = [
        "Definir objetivos SMART de la campaña",
        "Crear contenido visual atractivo",
        "Configurar canales de distribución",
        "Establecer métricas de éxito (KPIs)",
        "Ejecutar prueba piloto con audiencia objetivo",
        "Monitorear resultados y engagement",
        "Optimizar según datos en tiempo real",
        "Analizar ROI y costos"
    ]
    
    # Generar prompts de imagen para Bing Image Creator
    image_prompts = [
        f"Bing Image Creator: {brief.campaign_brief}, estilo {brief.tone.lower()}, branding profesional, colores modernos",
        f"Diseño visual para {brief.product_details}, estilo {brief.tone.lower()}, para {brief.target_audience}",
        f"Concepto creativo de marketing para {brief.campaign_brief[:50]}, estilo {brief.tone.lower()}, colores vibrantes"
    ]
    
    # Incrementar contador de campañas simuladas
    campaigns_generated.add(1)
    
    return {
        "campaignConcept": campaign_concept,
        "variants": variants,
        "checklist": checklist,
        "imagePrompts": image_prompts,
        "images": [],
        "note": "Para generar imágenes reales, visita: https://www.bing.com/images/create"
    }
