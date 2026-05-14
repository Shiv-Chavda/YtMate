import os
from dotenv import load_dotenv

from youtube_transcript_api import YouTubeTranscriptApi

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

load_dotenv()

# ---------------- Step: 1 => Indexing ---------------------------------
def process_video(video_id: str):
    try:
        # 1️⃣ Fetch transcript
        # 1️⃣ Fetch transcript
        api = YouTubeTranscriptApi()

        transcript_list = api.fetch(
            video_id,
            languages=["hi", "en"]
        )

        transcript = " ".join([t.text for t in transcript_list])
        # 2️⃣ Split into chunks
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1200,
            chunk_overlap=150
        )
        documents = splitter.create_documents([transcript])

        # 3️⃣ Create embeddings (Gemini)

        embeddings = HuggingFaceEmbeddings(
            model_name = "sentence-transformers/all-MiniLM-L6-v2"
        )

        # 4️⃣ Store in Chroma
        db = Chroma.from_documents(
            documents=documents,
            embedding=embeddings,
            persist_directory=f"chroma_db/{video_id}"
        )

        return {
            "status": "success",
            "video_id": video_id,
            "chunks": len(documents)
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
    


# ------------------------- Step: 2 => Retrival --------------------------
def chat_with_video(video_id: str, question: str):
    try:
        # 1️⃣ Load existing DB

        embeddings = HuggingFaceEmbeddings(
            model_name = "sentence-transformers/all-MiniLM-L6-v2"
        )

        db = Chroma(
            persist_directory=f"chroma_db/{video_id}",
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