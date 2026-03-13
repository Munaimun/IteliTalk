import { Bot, Loader2, Send, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import axiosApiInstance from "../interceptor";

const API_URL = "/api/v1";

const Student = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const details = JSON.parse(localStorage.getItem("studentUser") || "{}");
  const userId = details?._id;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Fetch message history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) return;
      try {
        const response = await axiosApiInstance.get(
          `${API_URL}/student/message/${userId}`
        );
        if (response.status === 200) {
          const formatted = response.data.chats.flatMap((msg) => [
            { text: msg.question, sender: "history-user" },
            { text: msg.answer, sender: "history-ai" },
          ]);
          setMessages(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };
    fetchHistory();
  }, [userId]);

  // Initial greeting (only when no history loaded)
  useEffect(() => {
    if (messages.length === 0) {
      const id = setTimeout(() => {
        setMessages([
          {
            text: `Hello${details?.name ? `, ${details.name}` : ""}! How can I assist you today?`,
            sender: "ai",
          },
        ]);
      }, 800);
      return () => clearTimeout(id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAnswer = useCallback(
    async (question) => {
      setIsLoading(true);
      try {
        const response = await axiosApiInstance.get(`${API_URL}/student`, {
          params: { question },
        });
        if (response.status === 200) {
          setMessages((prev) => [
            ...prev,
            { text: response.data.ans.text, sender: "ai" },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            text: "Unable to connect to the server. Please try again.",
            sender: "ai",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSend = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;
    const question = inputMessage.trim();
    setMessages((prev) => [...prev, { text: question, sender: "user" }]);
    setInputMessage("");
    await fetchAnswer(question);
  }, [inputMessage, isLoading, fetchAnswer]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) handleSend();
    },
    [handleSend]
  );

  const isAi = (sender) => sender === "ai" || sender === "history-ai";

  const markdownComponents = {
    p: ({ children }) => (
      <p className="mb-2 text-gray-100 last:mb-0 leading-relaxed">{children}</p>
    ),
    code: ({ children }) => (
      <code className="bg-slate-700 text-yellow-300 px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-slate-800 border border-slate-700 p-3 rounded-lg overflow-x-auto text-sm my-2">
        {children}
      </pre>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-1 mb-2 pl-2">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-1 mb-2 pl-2">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-gray-100 text-sm">{children}</li>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    h1: ({ children }) => (
      <h1 className="text-xl font-bold mb-2 text-white">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg font-semibold mb-2 text-white">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-semibold mb-1 text-white">{children}</h3>
    ),
  };

  const quickTags = [
    "📚 Course Help",
    "📝 Assignments",
    "🏫 Campus Info",
    "🎓 Academic Support",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] sm:h-[calc(100vh-7rem)] md:h-[calc(100vh-8rem)] bg-[#121218] rounded-xl shadow-2xl max-w-4xl mx-auto">
      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Welcome screen — shown when only the greeting message exists */}
        {messages.length === 1 && isAi(messages[0].sender) && (
          <div className="text-center py-8 px-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#a78bfa] to-[#6d28d9] flex items-center justify-center mb-4 shadow-lg">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome{details?.name ? `, ${details.name}` : ""}! 👋
            </h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-4">
              I&apos;m your personal AI assistant. Ask me anything about your
              courses, campus, or academics.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setInputMessage(tag.slice(2).trim())}
                  className="px-3 py-1.5 bg-[#1c1c27] text-[#a78bfa] rounded-full text-xs border border-[#2c2c3a] hover:bg-[#2c2c3a] transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${isAi(msg.sender) ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`flex items-start gap-2 sm:gap-3 max-w-[88%] sm:max-w-[75%] ${
                !isAi(msg.sender) ? "flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow ${
                  isAi(msg.sender)
                    ? "bg-gradient-to-br from-[#a78bfa] to-[#6d28d9]"
                    : "bg-gradient-to-br from-slate-600 to-slate-700"
                }`}
              >
                {isAi(msg.sender) ? (
                  <Bot className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  isAi(msg.sender)
                    ? "bg-[#1f1f2e] text-gray-100 border border-[#2c2c3a] rounded-tl-sm"
                    : "bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white rounded-tr-sm"
                }`}
              >
                {isAi(msg.sender) ? (
                  <ReactMarkdown components={markdownComponents}>
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  <p>{msg.text}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#a78bfa] to-[#6d28d9] flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="bg-[#1f1f2e] border border-[#2c2c3a] px-4 py-3 rounded-2xl rounded-tl-sm text-gray-300 text-sm flex items-center gap-2">
              <span className="text-[#a78bfa]">Thinking</span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 border-t border-[#2c2c3a] bg-[#12121a] p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3 items-center max-w-4xl mx-auto">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isLoading
                ? "Waiting for response..."
                : "Ask anything about your studies..."
            }
            disabled={isLoading}
            className="flex-1 bg-[#1c1c27] border border-[#2c2c3a] text-[#f1f0ff] placeholder:text-[#64748b] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20 transition-all disabled:opacity-60"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputMessage.trim()}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg transition-all duration-200 ${
              isLoading || !inputMessage.trim()
                ? "bg-[#2c2c3a] cursor-not-allowed text-[#64748b]"
                : "bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea]"
            }`}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Student;