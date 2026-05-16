from fastapi import APIRouter

router = APIRouter()

@router.post("/process-video")
def process(data: VideoRequest):
    return process_video(data.video_id)
