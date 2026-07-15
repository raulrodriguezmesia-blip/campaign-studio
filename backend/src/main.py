import json
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import requests
from dotenv import load_dotenv
from backend.src.opentelemetry_setup import campaigns_generated, openai_api_errors, tracer

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is required in environment")

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent.parent / "frontend"

app = FastAPI(title="Campaign Concept Studio API", version="0.1.0")
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


class CampaignBrief(BaseModel):
    campaign_brief: str = Field(..., min_length=10, max_length=1000)
    target_audience: str = Field(..., min_length=5, max_length=500)
    product_details: str = Field(..., min_length=5, max_length=1000)
    tone: str = Field(..., min_length=3, max_length=100)
    channels: str = Field(..., min_length=3, max_length=200)


@app.get("/api/health")
async def health():
    return {"status": "ok", "source": "campaign-studio"}


@app.get("/")
async def serve_frontend():
    index_path = FRONTEND_DIR / "index.html"
    return FileResponse(index_path)


@app.post("/api/generate")
async def generate_campaign(brief: CampaignBrief):
    try:
        response_payload = create_campaign_concept(brief)
        return JSONResponse(content=response_payload)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


def create_campaign_concept(brief: CampaignBrief) -> dict:
    instructions = (
        "You are a campaign concept studio assistant. Given the campaign brief, target audience, "
        "product details, tone, and channels, generate a concise campaign concept, three headline/body "
        "copy variants, a launch checklist, and three image prompts for campaign direction. Return "
        "structured JSON only."
    )

    response_payload = {
        "model": "gpt-4.1-mini",
        "input": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": instructions},
                    {
                        "type": "text",
                        "text": (
                            f"Campaign Brief: {brief.campaign_brief}\n"
                            f"Target Audience: {brief.target_audience}\n"
                            f"Product Details: {brief.product_details}\n"
                            f"Tone: {brief.tone}\n"
                            f"Channels: {brief.channels}\n"
                        ),
                    },
                    {
                        "type": "text",
                        "text": (
                            "Respond with JSON only under the keys: campaignConcept, variants, checklist, "
                            "imagePrompts. campaignConcept is a short summary. variants is an array of 3 objects "
                            "with headline and body. checklist is an array of tasks. imagePrompts is an array of 3 strings."
                        ),
                    },
                ],
            }
        ],
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": "campaign_concept_schema",
                "schema": {
                    "type": "object",
                    "properties": {
                        "campaignConcept": {"type": "string"},
                        "variants": {
                            "type": "array",
                            "minItems": 3,
                            "maxItems": 3,
                            "items": {
                                "type": "object",
                                "properties": {
                                    "headline": {"type": "string"},
                                    "body": {"type": "string"},
                                },
                                "required": ["headline", "body"],
                            },
                        },
                        "checklist": {
                            "type": "array",
                            "items": {"type": "string"},
                        },
                        "imagePrompts": {
                            "type": "array",
                            "minItems": 3,
                            "maxItems": 3,
                            "items": {"type": "string"},
                        },
                    },
                    "required": ["campaignConcept", "variants", "checklist", "imagePrompts"],
                },
            },
        },
        "max_output_tokens": 800,
        "temperature": 0.8,
    }

    with tracer.start_as_current_span("create_campaign_concept") as span:
        span.set_attribute("campaign.brief_length", len(brief.campaign_brief))
        span.set_attribute("campaign.audience", brief.target_audience[:50])

        try:
            response = requests.post(
                "https://api.openai.com/v1/responses",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=response_payload,
                timeout=60,
            )
            response.raise_for_status()
            data = response.json()

            output = parse_responses_output(data)
            if output is None:
                raise RuntimeError("Failed to parse structured response from OpenAI.")

            image_urls = [generate_image(prompt) for prompt in output.get("imagePrompts", [])[:3]]
            campaigns_generated.add(1)
            span.set_attribute("campaign.variants_count", len(output.get("variants", [])))

            return {
                "campaignConcept": output.get("campaignConcept", ""),
                "variants": output.get("variants", []),
                "checklist": output.get("checklist", []),
                "imagePrompts": output.get("imagePrompts", []),
                "images": image_urls,
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


def generate_image(prompt: str) -> dict:
    response = requests.post(
        "https://api.openai.com/v1/images/generations",
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": "gpt-image-1.5",
            "prompt": prompt,
            "size": "1024x1024",
            "background": "white",
            "n": 1,
        },
        timeout=60,
    )
    response.raise_for_status()
    data = response.json()
    image_data = data["data"][0]
    return {
        "prompt": prompt,
        "url": image_data.get("url"),
    }
