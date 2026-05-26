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
      <div className="bg-white rounded-xl shadow-2xl border border-gray-300 overflow-hidden">
        {/* Header - Humana Navy */}
        <div className="bg-gradient-to-r from-[#2C3E50] to-[#34495E] px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-[#5EA908] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-white">Provider Data Assistant</h3>
              <p className="text-xs sm:text-sm text-gray-300">Ask me about specific providers by NPI</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[500px] sm:h-[600px] overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-[#5EA908] text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
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
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-2 shadow-sm">
                <svg className="animate-spin h-4 w-4 text-[#5EA908]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-gray-600">Validating...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input - BLACK TEXT */}
        <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 sm:p-4 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a provider (e.g., 'Check NPI 1234567890')"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#5EA908] focus:border-transparent 
                text-sm text-black placeholder-gray-500 bg-white"
              style={{ color: '#000000' }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 sm:px-6 py-3 bg-[#5EA908] text-white rounded-lg 
                hover:bg-[#4E8807] disabled:bg-gray-300 disabled:cursor-not-allowed 
                transition-colors font-semibold text-sm shadow-md hover:shadow-lg
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