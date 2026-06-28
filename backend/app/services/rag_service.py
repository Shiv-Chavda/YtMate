import os
import re
import tempfile
from urllib.parse import parse_qs, urlparse

from dotenv import load_dotenv

from youtube_transcript_api import YouTubeTranscriptApi

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

load_dotenv()

YOUTUBE_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{11}$")


def normalize_video_id(video_input: str) -> str:
    value = (video_input or "").strip()
    if not value:
        raise ValueError("Please enter a YouTube video URL or video ID.")

    if YOUTUBE_ID_PATTERN.fullmatch(value):
        return value

    if "://" not in value:
        value = f"https://{value}"

    parsed = urlparse(value)
    host = parsed.netloc.lower().replace("www.", "")

    if host == "youtu.be":
        candidate = parsed.path.strip("/").split("/")[0]
        if YOUTUBE_ID_PATTERN.fullmatch(candidate):
            return candidate

    if host in {"youtube.com", "m.youtube.com", "music.youtube.com"}:
        query_video_id = parse_qs(parsed.query).get("v", [""])[0]
        if YOUTUBE_ID_PATTERN.fullmatch(query_video_id):
            return query_video_id

        parts = [part for part in parsed.path.split("/") if part]
        if len(parts) >= 2 and parts[0] in {"embed", "shorts", "live"}:
            candidate = parts[1]
            if YOUTUBE_ID_PATTERN.fullmatch(candidate):
                return candidate

    raise ValueError("Invalid YouTube link. Please paste a valid YouTube URL or 11-character video ID.")


def build_transcript_error(video_id: str, error: Exception) -> str:
    raw_message = str(error).strip() or "Transcript could not be retrieved."
    normalized = raw_message.lower()

    if "blocking requests from your ip" in normalized or "cloud provider" in normalized:
        return (
            f"Transcript retrieval is being blocked for video {video_id} from the deployed server. "
            "Please try again in a moment, or paste a YouTube URL so the app can try a browser-side fallback."
        )

    if "no transcripts were found" in normalized:
        return f"No transcript is available for video {video_id}."

    if "transcriptsdisabled" in normalized:
        return f"Transcripts are disabled for video {video_id}."

    if "video unavailable" in normalized:
        return f"Video {video_id} is unavailable or private."

    return raw_message


def build_vector_store(video_id: str, transcript: str):
    cleaned_transcript = (transcript or "").strip()
    if not cleaned_transcript:
        raise ValueError("Transcript is empty for this video.")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200,
        chunk_overlap=150
    )
    documents = splitter.create_documents([cleaned_transcript])

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    persist_directory = get_persist_directory(video_id)

    Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        persist_directory=persist_directory
    )

    return documents


def get_persist_directory(video_id: str) -> str:
    persist_directory = os.path.join(tempfile.gettempdir(), "ytmate_chroma_db", video_id)
    os.makedirs(persist_directory, exist_ok=True)
    return persist_directory


# ---------------- Step: 1 => Indexing ---------------------------------
def process_video(video_input: str):
    try:
        video_id = normalize_video_id(video_input)

        api = YouTubeTranscriptApi()
        transcript_list = api.fetch(
            video_id,
            languages=["hi", "en"]
        )
        transcript = " ".join([item.text for item in transcript_list])

        documents = build_vector_store(video_id, transcript)

        return {
            "status": "success",
            "video_id": video_id,
            "chunks": len(documents)
        }

    except ValueError as error:
        return {
            "status": "error",
            "message": str(error)
        }
    except Exception as error:
        video_id = (video_input or "").strip()
        try:
            video_id = normalize_video_id(video_input)
        except Exception:
            pass

        return {
            "status": "error",
            "message": build_transcript_error(video_id, error)
        }


def process_transcript(video_input: str, transcript: str):
    try:
        video_id = normalize_video_id(video_input)
        documents = build_vector_store(video_id, transcript)

        return {
            "status": "success",
            "video_id": video_id,
            "chunks": len(documents)
        }
    except Exception as error:
        return {
            "status": "error",
            "message": str(error)
        }


# ------------------------- Step: 2 => Retrival --------------------------
def chat_with_video(video_input: str, question: str):
    try:
        video_id = normalize_video_id(video_input)

        embeddings = HuggingFaceEmbeddings(
            model_name = "sentence-transformers/all-MiniLM-L6-v2"
        )

        db = Chroma(
            persist_directory=get_persist_directory(video_id),
            embedding_function=embeddings
        )

        # 2️⃣ Retrieve relevant chunks
        retriever = db.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 4}
        )

        docs = retriever.invoke(question)

        # 3️⃣ Combine context
        context = "\n".join([doc.page_content for doc in docs])

        # 4️⃣ Gemini LLM
        llm = ChatGoogleGenerativeAI(
            model='gemini-2.5-flash',
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )

        # 5️⃣ Prompt
        prompt = PromptTemplate(
                template="""
            You are an AI assistant that answers questions based only on the provided video transcript.
            Rules:
            - Answer ONLY from the context
            - Do NOT make up information
            - If answer is not found, say: "Sorry, I don't know based on this video"

            Context:
            {context}

            Question:
            {question}

            Answer:
            """,
            input_variables=["context", "question"]
        )

        final_prompt = prompt.invoke({"context":context,"question":question})

        # Text generation
        response = llm.invoke(final_prompt)

        return {
            "status": "success",
            "answer": response.content
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
