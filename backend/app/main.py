from fastapi import FastAPI
from starlette.responses import Response
from fastapi.middleware.cors import CORSMiddleware

from app.routes import video,chat

app = FastAPI(title="YtMate AI Backend 🚀")

# ✅ CORS (for React connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ytmate-ai.vercel.app",
        "https://www.ytmate-ai.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure preflight requests always succeed on serverless platforms.
@app.options("/{path:path}")
def preflight_handler(path: str):
    return Response(status_code=200)

# ✅ Include routes
app.include_router(video.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

# ✅ Health check
@app.get("/")
def home():
    return {"message": "Backend is running 🚀"}