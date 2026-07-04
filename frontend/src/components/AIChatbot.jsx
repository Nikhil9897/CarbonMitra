import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { MessageSquare, Send, X, Sparkles, AlertCircle } from 'lucide-react';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'CHATBOT',
      text: 'Hello! I am your AI Eco-Assistant. 🌍 Ask me any questions about sustainability, reducing your emissions, or eco-friendly tips!'
    }
  ]);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Clear input
    if (!textToSend) setInput('');

    // Append user message
    const newMessages = [...messages, { role: 'USER', text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Map to Cohere API structure
      // Remove first greeting message from history to prevent cluttering
      const chatHistory = newMessages.slice(1, -1).map(msg => ({
        role: msg.role,
        message: msg.text
      }));

      const response = await api.post('/api/ai/chat', {
        message: text,
        chatHistory: chatHistory
      });

      if (response.data.success) {
        setMessages(prev => [...prev, {
          role: 'CHATBOT',
          text: response.data.data.text
        }]);
      } else {
        throw new Error('API returned unsuccessful status');
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'CHATBOT',
        text: 'Sorry, I failed to process your message. Please check if the Cohere API key is configured correctly in the backend application.yml properties.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const quickPrompts = [
    { label: 'Green Commuting 🚗', text: 'What are some practical tips to lower my transit carbon footprint?' },
    { label: 'Eco Eating 🥗', text: 'Recommend a low-carbon footprint recipe for lunch.' },
    { label: 'Home Energy 💡', text: 'How can I save electricity and lower my home carbon footprint?' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 no-print">
      {/* FLOATING TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-2xl transition duration-300 flex items-center justify-center relative group animate-bounce"
          style={{ animationDuration: '3s' }}
        >
          <MessageSquare size={24} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          {/* Tooltip */}
          <div className="absolute right-14 bg-slate-800 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap font-medium shadow-md">
            Eco-Assistant Online
          </div>
        </button>
      )}

      {/* CHAT WINDOW PANELS */}
      {isOpen && (
        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl shadow-2xl w-[350px] sm:w-[400px] h-[500px] flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Sparkles size={16} className="text-emerald-200 fill-emerald-200/20" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-wide">AI Eco-Assistant</h3>
                <p className="text-[10px] text-emerald-200 font-semibold uppercase tracking-wider">CarbonTrack Helper</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-dark-950/20">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm
                    ${msg.role === 'USER'
                      ? 'bg-primary-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-dark-800 border border-slate-100 dark:border-dark-700/60 text-slate-800 dark:text-slate-200 rounded-tl-none'
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-dark-800 border border-slate-100 dark:border-dark-700/60 rounded-2xl rounded-tl-none px-4 py-3 flex space-x-1.5 items-center">
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Container */}
          {messages.length === 1 && !loading && (
            <div className="px-4 py-2 border-t border-slate-50 dark:border-dark-800/40 bg-white dark:bg-dark-900 space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Suggested Topics</span>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt.text)}
                    className="text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30 px-2.5 py-1.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition duration-150"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input Form */}
          <div className="p-3 border-t border-slate-100 dark:border-dark-800 bg-white dark:bg-dark-900 flex space-x-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about sustainability..."
              disabled={loading}
              className="flex-1 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-100 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;
