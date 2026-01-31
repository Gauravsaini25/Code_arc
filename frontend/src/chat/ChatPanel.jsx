import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

const ChatPanel = ({ onQuery }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Hello! I am your Code Archaeologist. Ask me anything about this repository.' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await onQuery(input);
      setMessages(prev => [...prev, { role: 'system', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', content: "Connection error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-4 left-4 bottom-16 w-64 sm:w-72 lg:w-80 pointer-events-none z-10">
      <div 
        className="w-full h-full rounded-3xl pointer-events-auto flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}
      >
        {/* Header */}
        <div 
          className="p-3 sm:p-4 flex items-center gap-3"
          style={{ 
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.08)' 
          }}
        >
          <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
            <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-xs sm:text-sm">Archaeologist AI</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-[9px] sm:text-[10px] text-white/40">GPT-4 Connected</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[90%] px-3 sm:px-4 py-2 sm:py-2.5 text-[12px] sm:text-[13px] leading-relaxed ${
                  msg.role === 'user' ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-bl-md'
                }`}
                style={msg.role === 'user' 
                  ? { background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)', boxShadow: '0 4px 12px rgba(0,122,255,0.3)' }
                  : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.05)' }
                }
              >
                <span className="text-white">{msg.content}</span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-2.5 rounded-2xl rounded-bl-md text-[13px] text-white/50 animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }}>
                Analyzing...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-2 sm:p-3" style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[12px] sm:text-[13px] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="Ask about impact or risk..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              type="submit" 
              className="w-9 sm:w-10 h-9 sm:h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-40 hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)', boxShadow: '0 4px 12px rgba(0,122,255,0.4)' }}
              disabled={loading}
            >
              <Send className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;




