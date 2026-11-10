# Krishok Seba 🌾

A farmer-friendly crop health and advisory MVP based on [plan.md](plan.md). The project uses React, Tailwind CSS, FastAPI, and PostgreSQL.

## Features

- Responsive English/Bangla farmer dashboard
- Farmer registration and JWT login API
- Farmer profile and crop records
- Leaf-photo diagnosis endpoint with a clearly disclosed demo fallback when Gemini is not configured
- Current conditions and a 3-day forecast from Open-Meteo (no API key required)
- Market news search via Google News RSS with a schema-validated, cautious Gemini outlook when configured
- Diagnosis history persisted in PostgreSQL
- Browser voice input/output support in the frontend

## Run locally

1. Copy `backend/.env.example` to `backend/.env` and set a strong `SECRET_KEY`. Add `GEMINI_API_KEY` to enable AI crop diagnosis and structured market analysis. Keep API keys in the ignored backend `.env` file or a deployment secret manager; never commit or share them.
2. Start PostgreSQL with `docker compose up -d db` from the repository root.
3. In one terminal, create a Python environment and install `backend/requirements.txt`, then run `cd backend && uvicorn app.main:app --reload` from the repository root.
4. In another terminal, run `cd frontend && npm install && npm run dev`.
5. Open the Vite URL (normally http://localhost:5173). API documentation is at http://localhost:8000/docs.

The frontend expects the API at `http://localhost:8000/api/v1` by default. Set `VITE_API_URL` to override it. The dashboard has useful sample content without requiring login; register or sign in to save records and use protected endpoints.

## Notes

- Diagnosis and treatment guidance are informational, not a substitute for a local agricultural extension officer. Confirm any chemical and dosage advice against the product label and local regulations.
- The weather forecast uses Open-Meteo and needs no API key. Forecasts are informational and local conditions can differ.
- Market analysis searches Google News RSS headlines; it does not receive a verified live market-price feed. Gemini provides a qualitative, structured outlook only when configured. Treat it as uncertain context, not a numeric price forecast or guarantee; review linked sources.
- Uploaded images are currently stored on the backend filesystem under `backend/uploads`; use private object storage and retention controls for production.
- Before deployment, use HTTPS, configure CORS for the production frontend, use managed secrets, add migrations, rate limiting, and an SMS/phone verification flow.
