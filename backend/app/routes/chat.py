from fastapi import APIRouter
from app.models.schema import ChatRequest
from app.services.rag_service import chat_with_video

router = APIRouter()

@router.post("/chat")
def chat(data: ChatRequest):
    return chat_with_video(data.video_id, data.question)