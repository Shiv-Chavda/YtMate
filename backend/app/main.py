from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import video,chat

app = FastAPI(title="YtMate AI Backend 🚀")

# ✅ CORS (for React connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ytmate-ai.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include routes
app.include_router(video.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

# ✅ Health check
@app.get("/")
def home():
    return {"message": "Backend is running 🚀"}