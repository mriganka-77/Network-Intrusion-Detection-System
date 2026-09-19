"""
Main entrypoint for AI-NIDS FastAPI backend server.
Configures middleware, lifecycle hooks, and routes.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.db.session import init_db
from backend.inference.service import InferenceService
from backend.api.routes import router as api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and pre-load ML model & SHAP explainer
    print("AI-NIDS: Initializing database schema...")
    init_db()
    print("AI-NIDS: Pre-loading ML Inference Engine and SHAP TreeExplainer...")
    InferenceService.get_instance()
    print("AI-NIDS: Backend ready to accept requests.")
    yield
    print("AI-NIDS: Backend shutting down...")


app = FastAPI(
    title="AI-NIDS: Explainable Network Intrusion Detection System",
    description="Production-ready REST API for flow classification, threat alerting, and SHAP explainability.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend dashboard (Vite/React dev server and production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
