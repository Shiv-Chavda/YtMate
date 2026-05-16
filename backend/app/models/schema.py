from pydantic import BaseModel

class VideoRequest(BaseModel):
    video_id: str

# chat
class ChatRequest(BaseModel):
    video_id: str
    question: str