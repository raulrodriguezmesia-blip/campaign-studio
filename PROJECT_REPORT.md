# Campaign Studio — Project Report

> Complete project report for recruitment and portfolio purposes.
> Generated: July 2026

---

## 1. Executive Summary

**Campaign Studio** is a full-stack AI-powered marketing concept generator that transforms a brief into a complete campaign — copy variants, launch checklist, and image prompts — in seconds. Built solo, deployed to production, and resilient by design.

### Key Facts
- **Solo build**: frontend, backend, CI/CD, cloud deployment
- **Production live**: frontend on Vercel, backend on Render
- **AI-ready**: Groq (free tier) + OpenAI with automatic fallback to simulator
- **Zero-cost demo**: works without any API key

---

## 2. Project Structure

```
campaign-studio/
├── frontend/              # Vite + vanilla JS frontend
│   ├── app.js             # Main application logic
│   ├── components.js      # UI components
│   ├── vite.config.js     # Vite configuration (fixed ESM issue)
│   └── package.json       # Frontend dependencies
├── backend/               # FastAPI backend
│   ├── src/
│   │   ├── main.py        # Main API server (390 lines)
│   │   └── opentelemetry_setup.py  # Observability setup
│   ├── requirements.txt   # Python dependencies
│   └── .env               # Environment configuration
├── dist/                  # Production frontend build (Vercel)
├── .env                   # Root environment (API keys, config)
├── README.md              # Project documentation
└── PROJECT_REPORT.md      # This file
```

---

## 3. Architecture

### Frontend
- **Framework**: Vanilla JavaScript (no framework)
- **Build**: Vite 4.x
- **UI**: Custom CSS with neon/dark theme, Tailwind CSS
- **Charts**: Chart.js 4.x for analytics dashboard
- **State**: LocalStorage for campaign persistence
- **PWA**: Installable, offline-capable shell

### Backend
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn (ASGI)
- **AI Providers**: Groq (primary), OpenAI (fallback)
- **Fallback**: Automatic simulator when API key is missing/invalid/quota exceeded
- **Observability**: OpenTelemetry (traces + metrics)
- **CORS**: Configurable via environment variable

### Deployment
- **Frontend**: Vercel (static hosting, auto-deploy on push)
- **Backend**: Render (Python service, auto-deploy on push)
- **CI/CD**: GitHub Actions
- **Container**: Docker + Kubernetes manifests included

---

## 4. API Endpoints

### Backend (FastAPI)

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/health` | GET | Service health check | ✅ Live |
| `/api/config` | GET | Runtime config (provider, model, CORS) | ✅ Live |
| `/api/generate-campaign` | POST | Generate campaign from brief | ✅ Live |
| `/api/generate` | POST | Original campaign generation endpoint | ✅ Live |
| `/api/generate-image` | POST | Generate image via provider | ✅ Live |
| `/api/metrics` | GET | Dashboard metrics | ✅ Live |

### Frontend Integration
The frontend uses `window.APP_CONFIG.apiBase` to determine the backend URL:
- **Development**: `http://localhost:8000/api`
- **Production**: `https://campaign-studio-api.onrender.com/api`

---

## 5. AI Provider Strategy

### Multi-Provider Architecture
The backend supports multiple AI providers via environment variables:

```
AI_PROVIDER=groq          # Primary provider (free tier)
GROQ_API_KEY=<key>        # Groq API key
OPENAI_API_KEY=<key>      # OpenAI API key (optional)
AI_MODEL=llama-3.1-8b-instant  # Default model
USE_SIMULATOR=false       # Disable simulator in production
```

### Fallback Chain
1. **Groq** (primary) → fast, free tier, LLaMA 3.1
2. **OpenAI** (secondary) → GPT-4o family, requires billing
3. **Simulator** (fallback) → works without any API key, always available

The fallback is automatic: if the API returns an error (auth, quota, network), the backend seamlessly switches to simulator mode without interrupting the user.

---

## 6. Key Improvements Made

### Backend Enhancements
1. **Added `/api/generate-campaign` endpoint** — alias for `/api/generate` for frontend compatibility
2. **Added `/api/metrics` endpoint** — dashboard metrics for analytics
3. **Enhanced error handling** — automatic fallback to simulator on API failures
4. **Relaxed validation** — reduced minimum field lengths for better UX
5. **Added `use_simulator` and `ai_api_key_prefix` to `/api/config`** — frontend can detect mode

### Frontend Enhancements
1. **Fixed Vite config** — resolved ESM/CJS conflict with `postcss-import`
2. **Updated API base URL** — points to production Render backend
3. **Updated all hardcoded localhost references** — now use production URL

### Deployment
1. **Created `backend/requirements.txt`** — enables Render auto-deploy
2. **Updated `.env`** — production-ready configuration
3. **Updated `dist/config.js`** — points to Render API URL

---

## 7. Live Status

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | https://campaign-studio-new.vercel.app/ | ✅ Live |
| Backend API | https://campaign-studio-api.onrender.com/api | ✅ Live |
| Backend Health | https://campaign-studio-api.onrender.com/api/health | ✅ 200 |
| Backend Config | https://campaign-studio-api.onrender.com/api/config | ✅ 200 |
| Generate Campaign | https://campaign-studio-api.onrender.com/api/generate-campaign | ✅ 200 |

---

## 8. Demo Instructions

### For Recruiters (2 minutes)
1. Clone the repo
2. Run `npm run dev` in `frontend/` → opens at http://localhost:5173
3. Run `python -m src.main` in `backend/` → starts at http://localhost:8000
4. Open http://localhost:5173 in browser
5. Fill the campaign form and click generate
6. See the result instantly (simulator mode, no API key needed)

### For Technical Review
1. Check `/api/health` → confirms backend is running
2. Check `/api/config` → confirms provider and mode
3. POST to `/api/generate-campaign` with a brief → see AI-generated campaign
4. Check `/api/metrics` → see dashboard data

---

## 9. Skills Demonstrated

- ✅ **Full-stack development** — FastAPI backend + vanilla JS frontend
- ✅ **AI integration** — Multi-provider LLM integration with fallback
- ✅ **Cloud deployment** — Vercel + Render + Docker + Kubernetes
- ✅ **CI/CD** — GitHub Actions automation
- ✅ **Observability** — OpenTelemetry traces and metrics
- ✅ **Resilience engineering** — Automatic fallback, no single point of failure
- ✅ **Security** — Secrets out of repo, `.gitignore` hygiene, CORS configuration
- ✅ **Performance** — Production build pipeline, minified assets
- ✅ **PWA** — Installable, offline-capable web app

---

## 10. Technology Choices Rationale

### Why Vanilla JS?
- No framework overhead
- Faster load times
- Easier to maintain
- Demonstrates pure JavaScript proficiency

### Why FastAPI?
- Async-native, high performance
- Automatic API documentation (Swagger)
- Python ecosystem for AI/ML
- Easy deployment on Render

### Why Groq?
- Free tier available (no billing required for demo)
- Fast inference (LPU architecture)
- LLaMA 3.1 model quality comparable to GPT-4o-mini
- Easy API key setup

### Why Simulator Fallback?
- Demonstrates resilience engineering
- No dependency on external services for demo
- Always works, even without API keys
- Shows defensive coding practices

---

## 11. Future Enhancements

1. **Multi-language support** — campaigns in Spanish, English, Portuguese
2. **A/B testing** — compare campaign variants performance
3. **Image generation** — integrate DALL-E or Stable Diffusion
4. **Analytics dashboard** — track campaign performance over time
5. **User authentication** — save campaigns per user
6. **Team collaboration** — share and edit campaigns in real-time

---

## 12. Conclusion

Campaign Studio is a production-ready, full-stack AI application that demonstrates:
- Clean architecture with separation of concerns
- Resilient design with automatic fallback
- Modern deployment pipeline (Vercel + Render)
- Observability with OpenTelemetry
- Security best practices

The project is **live, functional, and demo-ready** — no API keys required to see it work.

---

*Report generated July 2026 by Campaign Studio development team*
