import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { Send, User, Bot, Loader2 } from "lucide-react"; 
import ReactMarkdown from "react-markdown";

// Mock UI components (Replace these with your actual shadcn/ui or custom components if you are using them)
const Button = ({ children, className, ...props }) => (
  <button className={`p-3 rounded-lg font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);
// Modified Input component for border changes
const Input = ({ className, ...props }) => (
  // Removed 'border' and related classes from the base style
  <input className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 ${className}`} {...props} />
);

const API_URL = "/api/v1";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll logic remains the same
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Backend logic (Same)
  const fetchAnswerFromBackend = useCallback(async (userQuestion) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/guest`, {
        params: { question: userQuestion },
      });

      if (response.status === 200) {
        setMessages((prev) => [
          ...prev,
          { text: response.data.ans, sender: "ai" },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            text: "Sorry, I'm having trouble processing your request right now.",
            sender: "ai",
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I'm unable to connect to the server right now.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send message logic (Same)
  const handleSendMessage = useCallback(async () => {
    if (inputMessage.trim() !== "") {
      const userMessage = { text: inputMessage, sender: "user" };
      setMessages((prev) => [...prev, userMessage]);
      await fetchAnswerFromBackend(inputMessage);
      setInputMessage("");
    }
  }, [inputMessage, fetchAnswerFromBackend]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !isLoading) handleSendMessage();
    },
    [handleSendMessage, isLoading]
  );

  // Initial welcome message (Same)
  useEffect(() => {
    if (messages.length === 0) {
      const id = setTimeout(() => {
        setMessages([
          {
            text: "Hello! How can I assist you today?",
            sender: "ai",
          },
        ]);
      }, 800);
      return () => clearTimeout(id);
    }
  }, [messages.length]);

  // Markdown component rendering for dark theme (Same)
  const markdownComponents = {
    p: ({ children }) => <p className="mb-2 text-gray-100 last:mb-0">{children}</p>,
    code: ({ children }) => (
      <code className="bg-slate-700 text-yellow-300 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
    ),
    pre: ({ children }) => (
      <pre className="bg-slate-800 border border-slate-700 p-3 rounded-lg overflow-x-auto text-sm my-3">
        {children}
      </pre>
    ),
    ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2 pl-4">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2 pl-4">{children}</ol>,
    li: ({ children }) => <li className="text-gray-100">{children}</li>,
  };

  return (
    <div className="flex flex-col h-full bg-[#121218] rounded-xl shadow-2xl max-w-4xl mx-auto">

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        
        {/* Welcome Block (Same) */}
        {messages.length === 1 && (
          <div className="text-center py-10 px-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center mb-4">
              <Bot className="text-3xl text-white" />
            </div>

            <h2 className="text-3xl text-white font-extrabold mb-2">
              InteliTalk 🤖
            </h2>
            <p className="text-gray-400 text-lg">
              Ask me anything about courses, campus, admissions, or support.
            </p>
          </div>
        )}

        {/* Chat Messages (Same) */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === "ai" ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`flex items-start gap-3 max-w-[85%] sm:max-w-[70%] ${
                msg.sender === "ai" ? "" : "flex-row-reverse"
              }`}
            >
              {/* AVATAR (Same) */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                  msg.sender === "ai"
                    ? "bg-emerald-600"
                    : "bg-indigo-600 text-white"
                }`}
              >
                {msg.sender === "ai" ? (
                  <Bot className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>

              {/* BUBBLE (Same) */}
              <div
                className={`p-3 sm:p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === "ai"
                    ? "bg-[#1f1f27] text-gray-100 border border-gray-700 rounded-tl-none" 
                    : "bg-indigo-600 text-white rounded-tr-none" 
                }`}
              >
                <ReactMarkdown components={markdownComponents}>
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {/* LOADING STATE (Same) */}
        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex justify-center items-center">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="bg-[#1f1f27] border border-gray-700 p-3 sm:p-4 rounded-xl rounded-tl-none text-gray-300 text-sm">
              Thinking…
            </div>
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      {/* 3. INPUT AREA: Input border removed. */}
      <div className="flex-shrink-0 p-4 border-t border-gray-800 bg-[#121218]">
        <div className="flex gap-3 items-center">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isLoading ? "Please wait for the response..." : "Ask your question..."}
            disabled={isLoading}
            // IMPORTANT CHANGE: Removed 'border border-gray-700' from this class list
            className="flex-1 bg-[#1f1f27] text-white rounded-xl px-4 py-3 placeholder-gray-500 disabled:opacity-75"
          />

          <Button
            onClick={handleSendMessage}
            disabled={isLoading || inputMessage.trim() === ""}
            className={`text-white rounded-xl px-6 py-3 shadow-lg flex items-center justify-center gap-1 transition-all duration-200 ${
              isLoading || inputMessage.trim() === ""
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500"
            }`}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;