import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Loader2, Send, MessageSquare } from "lucide-react";
import { User } from "../types";

export interface AIChatbotProps {
  user: User | null;
}

export default function AIChatbot({ user }: AIChatbotProps) {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; text: string }>>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-open chatbot after a brief delay on initial portal mount to ensure the user sees it
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChatOpen(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Set greeting message when chat opens or user updates
  useEffect(() => {
    const greetingName = user?.name ? user.name : "Scholar";
    const subtext = user?.role === "platform_admin" 
      ? "Ask me anything about system overrides, CSV cohort processing, or active contract statistics!"
      : user?.role === "customer_admin"
      ? "Ask me anything about project budgets, accuracy performance thresholds, or target languages!"
      : "Ask me anything about tasks, rewards, UPI withdrawals, SLA compliance, or tier progression!";
    
    setChatMessages([
      { 
        role: "model", 
        text: `Namaste, ${greetingName}! I am your 2UNE Workspace Companion. ${subtext}` 
      }
    ]);
  }, [user]);

  // Handle smooth auto-scroll to bottom of messages
  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

  // Send query to server API
  const handleSendChatMessage = async (msgText: string) => {
    const textToSend = msgText.trim();
    if (!textToSend || isSendingChat) return;

    const newMessage = { role: "user" as const, text: textToSend };
    const updatedMessages = [...chatMessages, newMessage];
    
    setChatMessages(updatedMessages);
    setChatInput("");
    setIsSendingChat(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: chatMessages
        })
      });

      if (!response.ok) {
        throw new Error("API server responded with error status");
      }

      const data = await response.json();
      setChatMessages((prev) => [...prev, { role: "model", text: data.reply }]);
    } catch (error) {
      console.error("AI Chatbot connection error:", error);
      setChatMessages((prev) => [
        ...prev,
        { 
          role: "model", 
          text: "I am facing a connection issue with our language compute backend clusters. Please check your network or try again." 
        }
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-[9999] flex flex-col items-end gap-3 font-sans" id="global-ai-chat-copilot-container">
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-brand-charcoal/95 border border-white/10 rounded-2xl w-[360px] md:w-[400px] h-[480px] shadow-2xl flex flex-col overflow-hidden backdrop-blur-md"
            id="global-ai-chat-bubble-window"
          >
            {/* Chat Window Header */}
            <div className="bg-brand-charcoal px-4 py-3 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-brand-teal/25 rounded-lg w-7 h-7 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-brand-teal animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white font-mono tracking-wide flex items-center gap-1.5">
                    2UNE AI ASSISTANT
                    <span className="flex h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse" />
                  </h3>
                  <p className="text-[9px] text-brand-slate uppercase font-mono tracking-wide">
                    Real-time Workspace Companion
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 hover:bg-white/5 rounded-lg text-brand-slate hover:text-white transition-all cursor-pointer"
                title="Minimize support companion"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body & Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3.5 bg-brand-black/40" id="global-chat-messages-scroller">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-brand-teal text-white rounded-tr-none font-sans shadow-md shadow-brand-teal/10"
                        : "bg-brand-charcoal/95 text-brand-slate border border-white/5 rounded-tl-none font-sans"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isSendingChat && (
                <div className="flex justify-start">
                  <div className="bg-brand-charcoal/95 text-brand-slate border border-white/5 rounded-xl rounded-tl-none px-3.5 py-2.5 text-xs flex items-center gap-2 font-mono">
                    <Loader2 className="w-3.5 h-3.5 text-brand-teal animate-spin" />
                    <span>validating response...</span>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Interactive Dynamic Helper Scroller tags */}
            <div className="bg-black/35 px-3 py-2 border-t border-white/5 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-hide">
              {user?.role === "platform_admin" ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleSendChatMessage("How do I clear or verify pending contributor KYC Aadhaar documents?")}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-mono text-brand-slate hover:text-white transition-all cursor-pointer select-none shrink-0"
                  >
                    🛡️ Verification Help
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendChatMessage("How do I resolve evaluation consensus conflicts in QA Queue?")}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-mono text-brand-slate hover:text-white transition-all cursor-pointer select-none shrink-0"
                  >
                    ⚖️ QA Consensus
                  </button>
                </>
              ) : user?.role === "customer_admin" ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleSendChatMessage("How do I launch a new pilot request for LLM evaluation?")}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-mono text-brand-slate hover:text-white transition-all cursor-pointer select-none shrink-0"
                  >
                    🚀 Request Pilot
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendChatMessage("How are turnaround hours and guaranteed accuracy calculated?")}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-mono text-brand-slate hover:text-white transition-all cursor-pointer select-none shrink-0"
                  >
                    ⚡ SLA Thresholds
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleSendChatMessage("How do I withdraw my earnings balance to UPI?")}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-mono text-brand-slate hover:text-white transition-all cursor-pointer select-none shrink-0"
                  >
                    ₹ Withdraw UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendChatMessage("How does real-time SLA consistency affect my tasks?")}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-mono text-brand-slate hover:text-white transition-all cursor-pointer select-none shrink-0"
                  >
                    ⚡ SLA Guidelines
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendChatMessage("What qualification targets are needed to fast-track scholar tiers?")}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-mono text-brand-slate hover:text-white transition-all cursor-pointer select-none shrink-0"
                  >
                    🏆 Fast-Track Tiers
                  </button>
                </>
              )}
            </div>

            {/* Message Input Box Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage(chatInput);
              }}
              className="bg-brand-charcoal p-3 border-t border-white/5 flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your question..."
                disabled={isSendingChat}
                className="bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-teal/80 flex-grow placeholder:text-brand-slate disabled:opacity-50"
                id="global-chat-text-input-field"
              />
              <button
                type="submit"
                disabled={isSendingChat || !chatInput.trim()}
                className="bg-brand-teal hover:bg-brand-teal/90 text-white rounded-xl p-2 w-8 h-8 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                title="Send instruction query"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Launch Trigger */}
      {!isChatOpen && (
        <motion.button
          onClick={() => setIsChatOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-brand-teal/95 hover:bg-brand-teal text-white px-4 py-3 rounded-full flex items-center gap-2 font-mono font-bold text-[10px] md:text-xs uppercase shadow-xl shadow-brand-teal/20 border border-brand-teal/20 cursor-pointer relative"
          id="global-ai-chatbot-floating-fab"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green animate-pulse"></span>
          </span>
          <MessageSquare className="w-4 h-4 ml-0.5" />
          <span>AI Co-pilot</span>
        </motion.button>
      )}
    </div>
  );
}
