import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { LiaRobotSolid } from "react-icons/lia";
import { SlUser } from "react-icons/sl";
import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const API_URL = "/api/v1";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const fetchAnswerFromBackend = useCallback(async (userQuestion) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/guest`, {
        params: {
          question: userQuestion,
        },
      });

      if (response.status === 200) {
        const aiMessage = { text: response.data.ans, sender: "ai" };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } else {
        const errorMessage = {
          text: "Sorry, I'm having trouble processing your request right now.",
          sender: "ai",
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    } catch (error) {
      console.error("Network or server error:", error);
      const errorMessage = {
        text: "Sorry, I'm unable to connect to the server right now. Please try again later.",
        sender: "ai",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (inputMessage.trim() !== "") {
      const userMessage = { text: inputMessage, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      await fetchAnswerFromBackend(inputMessage);
      setInputMessage("");
    }
  }, [inputMessage, fetchAnswerFromBackend]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const timeoutId = setTimeout(() => {
        const aiMessage = {
          text: "Hello! How can I assist you today?",
          sender: "ai",
        };
        setMessages([aiMessage]);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [messages.length]);

  const markdownComponents = {
    p: ({ children }) => (
      <p className="mb-3 last:mb-0 text-slate-100 leading-relaxed">
        {children}
      </p>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
    code: ({ children }) => (
      <code className="bg-emerald-50 dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded text-sm font-mono border">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-sm my-3 border border-slate-600 shadow-inner">
        {children}
      </pre>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 ml-3 text-slate-100">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 ml-3 text-slate-100">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-sm text-slate-100 leading-relaxed">{children}</li>
    ),
    h1: ({ children }) => (
      <h1 className="text-xl font-bold mb-3 text-white">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg font-semibold mb-2 text-white">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-semibold mb-1 text-white">{children}</h3>
    ),
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      {/* Chat Messages Container */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/3 left-0 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-1/3 right-0 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div
          className="h-full overflow-y-auto p-6 space-y-6 scroll-smooth scrollbar-hide relative z-10"
          style={{
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* Welcome section for first message */}
          {messages.length === 1 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3">
                  <LiaRobotSolid className="text-3xl text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full animate-bounce"></div>
              </div>
              <h2 className="text-2xl font-bold text-slate-100 mb-3">
                Welcome to InteliTalk! 👋
              </h2>
              <p className="text-slate-300 max-w-md leading-relaxed">
                I&apos;m your AI learning companion. Ask me about courses,
                campus life, academic support, or anything university-related!
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {["📚 Courses", "🏫 Campus", "📝 Admissions", "🎓 Support"].map(
                  (tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm border border-slate-600/30"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start ${
                message.sender === "ai" ? "justify-start" : "justify-end"
              }`}
            >
              {message.sender === "ai" ? (
                <div className="flex items-start space-x-4 max-w-[85%] group">
                  {/* AI Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-105">
                      <LiaRobotSolid className="text-lg text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-800"></div>
                  </div>

                  {/* Message bubble */}
                  <div className="relative">
                    <div className="rounded-2xl rounded-tl-md bg-slate-700/90 backdrop-blur-sm border border-slate-600/50 px-5 py-4 shadow-xl hover:shadow-2xl transition-all duration-200">
                      {/* Message tail */}
                      <div className="absolute left-0 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-slate-700/90 -translate-x-2"></div>

                      <div className="prose prose-sm max-w-none text-slate-100 leading-relaxed">
                        <ReactMarkdown components={markdownComponents}>
                          {message.text}
                        </ReactMarkdown>
                      </div>

                      {/* Message timestamp */}
                      <div className="mt-2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-4 justify-end max-w-[85%] ml-auto group">
                  {/* User message bubble */}
                  <div className="relative">
                    <div className="rounded-2xl rounded-tr-md bg-gradient-to-br from-emerald-600 to-teal-600 text-white px-5 py-4 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-sm">
                      {/* Message tail */}
                      <div className="absolute right-0 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-emerald-600 translate-x-2"></div>

                      <p className="leading-relaxed font-medium">
                        {message.text}
                      </p>

                      {/* Message timestamp */}
                      <div className="mt-2 text-xs text-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        {new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-105">
                      <SlUser className="text-lg text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start justify-start max-w-[85%] group">
              <div className="flex items-start space-x-4">
                {/* AI Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <LiaRobotSolid className="text-lg text-white animate-pulse" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-800 animate-pulse"></div>
                </div>

                {/* Typing indicator */}
                <div className="relative">
                  <div className="rounded-2xl rounded-tl-md bg-slate-700/90 backdrop-blur-sm border border-slate-600/50 px-5 py-4 shadow-xl">
                    {/* Message tail */}
                    <div className="absolute left-0 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-slate-700/90 -translate-x-2"></div>

                    <div className="flex items-center space-x-3">
                      <div className="text-emerald-400 font-medium animate-pulse">
                        AI is thinking
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Input Container */}
      <div className="flex-shrink-0 border-t border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-900 p-6 shadow-2xl relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Quick actions for new users */}
          {messages.length <= 1 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "📚 Tell me about courses",
                  "🏫 Campus facilities info",
                  "📝 Admission requirements",
                  "🎓 Academic support",
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(suggestion.substring(2))}
                    disabled={isLoading}
                    className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl text-sm border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200 backdrop-blur-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative">
              <Input
                name="question"
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your university experience..."
                className="w-full rounded-2xl border-2 border-slate-600/50 focus:border-emerald-500/70 focus:ring-emerald-500/30 bg-slate-700/30 backdrop-blur-sm text-slate-100 placeholder-slate-400 px-6 py-4 text-base shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              />

              {/* Input decorations */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-200"></div>

              {/* Character count */}
              {inputMessage.length > 0 && (
                <div className="absolute -bottom-6 right-0 text-xs text-slate-400">
                  {inputMessage.length} characters
                </div>
              )}
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-600 disabled:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-white font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Send</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
