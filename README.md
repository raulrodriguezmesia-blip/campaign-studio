# Campaign Studio

[![CI](https://github.com/user/campaign-studio/workflows/ci/badge.svg)](https://github.com/user/campaign-studio/actions)
[![Security](https://github.com/user/campaign-studio/workflows/security/badge.svg)](https://github.com/user/campaign-studio/actions)

AI-powered campaign concept generator using OpenAI LLMs and image models.

## 📌 Project Overview

Campaign Studio is an enterprise-ready full-stack application that transforms marketing briefs into complete campaign concepts. Built with FastAPI backend and OpenAI integration, it generates text variants, checklists, and campaign direction visuals automatically.

## 🚀 Features

- **Campaign Concept Generation** - Creates marketing campaigns from briefs
- **Multi-format Output** - Headlines, body copy, checklists, and image prompts
- **AI Image Generation** - Visual campaign direction with DALL·E
- **Real-time API** - FastAPI async endpoints
- **Observability** - OpenTelemetry tracing and metrics
- **Enterprise CI/CD** - GitHub Actions with automated testing
- **Containerized** - Docker + Kubernetes manifests

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | FastAPI 0.110+, Python 3.11 |
| AI Models | gpt-4.1-mini, gpt-image-1.5 |
| Frontend | HTML5, Vanilla JS, CSS3 |
| Observability | OpenTelemetry, Jaeger, OTLP |
| Container | Docker, Kubernetes |
| CI/CD | GitHub Actions |

## ⚙️ Architecture

```
Client → FastAPI → OpenAI Responses API → JSON Response
                              ↓
                        Images API (DALL·E)
```

## 🔍 Observability & Metrics

| Metric | Description |
|--------|-------------|
| `campaigns_generated_total` | Total campaigns created |
| `images_generated_total` | Total images generated |
| `openai_api_errors_total` | API error count |

```bash
# View traces
kubectl port-forward svc/jaeger-query 16686:16686
# Open http://localhost:16686
```

## 🔄 CI/CD Pipeline

```yaml
jobs:
  - lint: Code quality with flake8
  - test: Unit tests with pytest
  - build: Multi-stage Docker build
  - deploy: Kubernetes deployment
  - rollback: Automatic on failure
```

## 🧪 Testing

```bash
pytest tests/ -v --cov=src
```

## 📦 Deployment

### Docker

```bash
# Build
docker build -t ghcr.io/user/campaign-studio:v1.0.0 -f backend/Dockerfile .

# Run
docker run -p 8000:8000 -e OPENAI_API_KEY=sk-... campaign-studio:latest
```

### Kubernetes

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

## 📑 Documentation

- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Setup and deployment guide
- [CASE-STUDY.md](CASE-STUDY.md) - Business impact and architecture evolution

## Quick Start

```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Set environment
echo "OPENAI_API_KEY=sk-..." > .env

# 3. Run server
uvicorn src.main:app --reload --port 8000

# 4. Open browser
http://localhost:8000
```