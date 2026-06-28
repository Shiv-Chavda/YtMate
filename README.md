# 🚀 YtMate AI – Chat with YouTube Videos

> Turn any YouTube video into an AI-powered assistant using Retrieval-Augmented Generation (RAG)

---

## 🧠 Overview

YtMate AI allows users to input a YouTube video ID and interact with its content using natural language.

Instead of watching long videos, users can:
- 💬 Ask questions
- ⚡ Get instant answers
- 🧾 Understand content quickly

The system uses a RAG pipeline to ensure answers are accurate and based only on the video content.

---

## ✨ Features

- 🎥 Input any YouTube Video ID  
- 🧾 Automatic transcript extraction  
- ✂️ Smart text chunking  
- 🧠 Semantic search using embeddings  
- 💬 Chat interface like ChatGPT  
- 🔒 Answers strictly based on video transcript  
- ⚡ Fast and relevant responses  

---

## 🏗️ System Architecture

User Input (Video ID)  
↓  
Transcript Extraction (YouTube API)  
↓  
Convert Transcript → Document  
↓  
Text Chunking  
↓  
Embeddings Generation  
↓  
Store in Vector DB (ChromaDB)  
↓  
User Question  
↓  
Query Embedding  
↓  
Retriever (Top-K Similar Chunks)  
↓  
LLM (Gemini)  
↓  
Final Answer  

---

## ⚙️ How It Works

### 🔹 Step 1: Indexing (Video Processing)

1. User enters YouTube Video ID  
2. Backend fetches transcript  
3. Transcript is converted into a document  
4. Document is split into smaller chunks  
5. Each chunk is converted into embeddings  
6. Stored in ChromaDB  

---

### 🔹 Step 2: Retrieval (Question Answering)

1. User asks a question  
2. Question is converted into embedding  
3. Retriever finds most relevant chunks  
4. Context + Question is sent to LLM  
5. LLM generates final answer  

---

## 🛠️ Tech Stack

Frontend:
- React.js  
- Tailwind CSS  
- Axios  

Backend:
- FastAPI  
- LangChain  
- ChromaDB  

AI / ML:
- Google Gemini (LLM)  
- HuggingFace Embeddings  

---

## 📁 Project Structure

project/
│
├── frontend/         # React UI  
├── backend/          # FastAPI Server  
│   ├── main.py  
│   ├── services/  
│   └── chroma_db/  
│
├── .env  
├── requirements.txt  
└── README.md  

---

## 🚀 Getting Started

### 1️⃣ Clone Repository

git clone https://github.com/Shiv-Chavda/YtMate.git
cd ytmate-ai  

---

### 2️⃣ Backend Setup

cd backend  
pip install -r requirements.txt  

Create `.env` file:

GOOGLE_API_KEY=your_api_key  

Run backend:

uvicorn main:app --reload  

---

### 3️⃣ Frontend Setup

cd frontend  
npm install  
npm run dev  

---

## 🌐 API Endpoints

### 🔹 Process Video

POST /api/process-video  

Body:

{
  "video_id": "VIDEO_ID"
}

---

### 🔹 Chat with Video

POST /api/chat  

Body:

{
  "video_id": "VIDEO_ID",
  "question": "Your question"
}

---

## 💡 Example Use Cases

- 📚 Learn from lectures quickly  
- 🎓 Understand tutorials instantly  
- 🎙️ Extract insights from podcasts  
- 🧠 Build AI-powered learning tools  

---

## ⚠️ Limitations

- NOTE: The live website may not work reliably for transcript analysis because YouTube can block transcript/comment requests coming from deployed cloud servers due to authentication, rate limits, or anti-bot protections.
- NOTE: Some videos do not provide public transcripts, captions, or accessible comments, so analysis may fail even if the video itself is playable on YouTube.
- Transcript must be available  
- ChromaDB is local (not persistent in cloud)  
- Accuracy depends on embedding model  

---

## Recomendation
- Run this project locally that will be best for its use.

---

## 🚀 Future Improvements

- 🔍 Multi-video search  
- 🧠 Chat memory  
- 📌 Timestamp-based answers  
- ☁️ Cloud vector database  
- 🎤 Voice input  

---

## 👨‍💻 Author

Shiv Chavda    
Full Stack Developer  

---

## ⭐ Support

If you like this project:

Give it a ⭐ on GitHub  
Share with others  

---

## 🔥 Tagline

"Turn any YouTube video into an AI-powered knowledge assistant"
