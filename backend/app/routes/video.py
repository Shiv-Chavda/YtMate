from fastapi import APIRouter
from app.models.schema import VideoRequest
from app.services.rag_service import process_video

router = APIRouter()

@router.post("/process-video")
def process(data: VideoRequest):
    return process_video(data.video_id)