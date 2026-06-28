from fastapi import APIRouter

from app.models.schema import TranscriptRequest, VideoRequest
from app.services.rag_service import process_transcript, process_video

router = APIRouter()

@router.post("/process-video")
def process(data: VideoRequest):
    return process_video(data.video_id)


@router.post("/process-transcript")
def process_with_transcript(data: TranscriptRequest):
    return process_transcript(data.video_id, data.transcript)
