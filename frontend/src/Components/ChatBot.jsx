import React, { useState } from 'react';
import { Send, Sparkles, History, Settings, Play, ChevronRight, Video, Activity, Menu, X, Globe, Zap } from 'lucide-react';
import axios from 'axios';

function ChatBot() {
  const [videoId, setVideoId] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Welcome to YtMate AI. I am ready to give answer with your video content. Please provide a Video ID to begin session." }
  ]);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  const YouTubeBrandIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" fill="#E11D48" />
      <path d="m9.67 15.02 6.21-3.27-6.21-3.27v6.54z" fill="white" />
    </svg>
  );

  // const fetchTranscript = async (id) => {
  //   const url = `https://youtubetranscript.com/?format=json&video_id=${encodeURIComponent(id)}`;
  //   const { data } = await axios.get(url, { timeout: 15000 });

  //   if (!Array.isArray(data)) {
  //     throw new Error("Transcript not available for this video.");
  //   }

  //   const transcript = data.map((item) => item.text).join(" ").trim();

  //   if (!transcript) {
  //     throw new Error("Transcript is empty for this video.");
  //   }

  //   return transcript;
  // };

  const handleAnalyze = async () => {
    if (!videoId) {
      alert("Please enter video ID");
      return;
    }

    try {
      setIsProcessing(true);

      // const transcript = await fetchTranscript(videoId);

      // const res = await axios.post(`${apiBaseUrl}/api/process-transcript`, {
      //   video_id: videoId,
      //   transcript,
      // });
      const res = await axios.post(
        `${apiBaseUrl}/api/process-video`,
        {
          video_id: videoId   // 👈 same as backend expects
        }
      );

      console.log(res.data);

      if (res.data.status === "success") {
        alert("Video processed ✅");
      } else {
        alert(res.data.message);
      }

      // alert(res.data.message || "Processing failed.");
    } catch (error) {
      console.error(error);
      // const message =
      //   error?.response?.data?.message ||
      //   error?.message ||
      //   "Transcript fetch failed.";
      // alert(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuestion = async () => {
    if (!question.trim()) return;
    if (!videoId.trim()) {
      alert("Please enter and analyze a video first");
      return;
    }

    const userMessage = {
      role: "user",
      content: question,
    };

    // show user message instantly
    setMessages((prev) => [...prev, userMessage]);

    setQuestion("");

    try {
      setLoading(true);

      const { data } = await axios.post(
        `${apiBaseUrl}/api/chat`,
        {
          question: userMessage.content,
          video_id: videoId,
        }
      );

      const answerText =
        data?.status === "success"
          ? data?.answer
          : data?.message || "No response came back from the server.";

      const aiMessage = {
        role: "ai",
        content: typeof answerText === "string" && answerText.trim()
          ? answerText
          : "The server replied, but no answer text was returned.",
      };

      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Server error";

      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-200 font-sans antialiased overflow-hidden selection:bg-violet-500/30">

      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed lg:relative z-40 h-full w-72 border-r border-zinc-800/50 bg-[#09090b] flex flex-col p-6 
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="mb-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Zap size={20} className="text-white fill-current" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
                YtMate <span className="text-violet-500">AI</span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest leading-none">AI Video Analysis</p>
            </div>
          </div>
          <button className="lg:hidden p-1 text-zinc-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4 px-1">
              <YouTubeBrandIcon />
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Target Media</span>
            </div>

            <div className="aspect-video bg-black rounded-xl mb-4 border border-zinc-800 flex items-center justify-center group/thumb cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-violet-600/5 opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
              <Play size={28} className="text-zinc-700 group-hover/thumb:text-violet-500 transition-all scale-90 group-hover/thumb:scale-110" />
            </div>

            <input
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="Enter YouTube Video ID ..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-zinc-700 mb-3"
            />
            <button
              onClick={handleAnalyze}
              disabled={isProcessing}
              className={`w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] transition-all shadow-lg shadow-violet-900/20 active:scale-95 ${
                isProcessing
                  ? "bg-zinc-400 text-black cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-500 text-white"
              }`}>
              {isProcessing ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      opacity="0.25"
                    />
                    <path
                      d="M22 12a10 10 0 0 1-10 10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                "Analyze Video"
              )}
            </button>
          </div>

          <nav className="space-y-1">
            <div className="flex items-center gap-3 p-3 bg-violet-600/10 rounded-xl text-violet-400 border border-violet-500/10">
              <Video size={18} />
              <span className="text-sm font-bold tracking-tight">Active Stream</span>
            </div>
            <div className="flex items-center gap-3 p-3 hover:bg-zinc-900 rounded-xl text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer">
              <History size={18} />
              <span className="text-sm font-medium tracking-tight">Analysis History</span>
            </div>
          </nav>
        </div>

        <div className="mt-auto pt-4 border-t border-zinc-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Analysis Ready</span>
          </div>
          {/* <Settings size={18} className="text-zinc-600 hover:text-white cursor-pointer transition-colors" /> */}
        </div>
      </aside>

      {/* --- MAIN AREA --- */}
      <main className="flex-1 flex flex-col relative bg-[#09090b] w-full">

        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-10 border-b border-zinc-800/50 bg-[#09090b]/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-zinc-400 hover:bg-zinc-800 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse hidden sm:block shadow-[0_0_10px_#8b5cf6]"></div>
              <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">Video Insights </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Latency: <span className="text-emerald-500 italic">24ms</span></span>
             </div> */}
            <div className="w-9 h-9 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-500 border border-violet-500/20 shadow-inner">
              <Activity size={16} />
            </div>
          </div>
        </header>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-20 py-10 space-y-12 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`flex gap-4 lg:gap-6 max-w-[95%] lg:max-w-3xl ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-800 shadow-2xl ${m.role === 'user' ? 'bg-violet-600 border-violet-500' : 'bg-zinc-900'}`}>
                  {m.role === 'user' ? <span className="font-black  text-xs text-black">U</span> : <Sparkles size={18} className="text-violet-400" />}
                </div>
                <div className={`px-5 py-4 lg:px-6 lg:py-5 rounded-4xl text-[15px] leading-relaxed tracking-wide shadow-2xl ${m.role === 'user'
                    ? 'bg-violet-600 text-white rounded-tr-none'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none'
                  }`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-2 lg:p-5 bg-linear-to-t from-[#09090b] via-[#09090b] to-transparent">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-violet-600 to-indigo-600 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-20 transition-all duration-1000"></div>
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-4xl flex items-center p-1 shadow-2xl focus-within:border-violet-500/50 transition-all duration-300">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleQuestion();
                }}
                className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none text-white px-4 lg:px-6 py-2 lg:py-3 text-sm placeholder:text-zinc-600 font-medium"
                placeholder="Ask about the video ..."
              />
              <button
                onClick={handleQuestion}
                disabled={loading}
                className={`h-12 px-6 lg:px-8 rounded-3xl transition-all duration-500 flex items-center gap-3 group/btn shadow-xl
    ${loading
                    ? "bg-zinc-400 text-black cursor-not-allowed"
                    : "bg-violet-600 text-white"
                  }`}
              >
                <span className="text-[11px] font-black uppercase tracking-widest hidden sm:inline">
                  {loading ? "Sending..." : "Send"}
                </span>

                {loading ? (
                  // 🔄 Spinner
                  <svg
                    className="animate-spin"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      opacity="0.2"
                    />
                    <path
                      d="M22 12a10 10 0 00-10-10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                  </svg>
                ) : (
                  <ChevronRight
                    size={16}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                )}
              </button>
            </div>
          </div>

          {/* POWERED BY GEMINI FOOTER */}
          <div className="mt-10 flex items-center justify-center gap-4 opacity-70 hover:opacity-100 transition-opacity duration-500">
            <div className="h-px w-12 bg-linear-to-r from-transparent to-zinc-800"></div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em]">Powered by</span>
              <div className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-md">
                <div className="w-1.5 h-1.5 bg-violet-500 rounded-full shadow-[0_0_8px_#8b5cf6]"></div>
                <span className="text-[10px] font-black text-white tracking-widest uppercase">Gemini</span>
              </div>
            </div>
            <div className="h-px w-12 bg-linear-to-l from-transparent to-zinc-800"></div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ChatBot;
