'use client';

import { useState } from 'react';
import ValidationDetails from './ValidationDetails';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  provider?: {
    npi: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    type?: string;
  };
  validation?: {
    coordination?: any;
    geographic?: {
      isValid: boolean;
      confidence: number;
      findings: string[];
      details: string;
    };
  };
  found?: boolean;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I can help you check provider data. Try asking: 'Check NPI 1164955043' or share a provider's NPI number.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        provider: data.provider,
        validation: data.validation,
        found: data.found,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-purple-200/30 overflow-hidden">
        {/* Header - Purple to Orange Gradient */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-orange-500 px-4 sm:px-6 py-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow">Provider Data Assistant</h3>
              <p className="text-xs sm:text-sm text-purple-100">Ask me about specific providers by NPI</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[500px] sm:h-[600px] overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-br from-purple-50 to-orange-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white'
                    : 'bg-white/90 border border-purple-200/30 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>

                {/* Show validation details if available */}
                {msg.provider && msg.validation && (
                  <div className="mt-4">
                    <ValidationDetails 
                      provider={msg.provider} 
                      validation={msg.validation} 
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/90 backdrop-blur-sm border border-purple-200/30 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-lg">
                <svg className="animate-spin h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-gray-700">Validating...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input - Modern Style */}
        <form onSubmit={handleSubmit} className="border-t border-purple-200/30 p-4 sm:p-4 bg-white/80 backdrop-blur-sm">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a provider (e.g., 'Check NPI 1234567890')"
              className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl 
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                text-sm text-black placeholder-gray-500 bg-white shadow-sm
                transition-all duration-200"
              style={{ color: '#000000' }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-xl 
                hover:from-purple-700 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 
                disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm 
                shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none
                flex-shrink-0"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}