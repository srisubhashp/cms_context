'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ResultsDisplay from '@/components/ResultsDisplay';
import ChatInterface from '@/components/ChatInterface';
import BulkUpload from '@/components/BulkUpload';

type Mode = 'upload' | 'bulk' | 'chat';

export default function Home() {
  const [validationResults, setValidationResults] = useState(null);
  const [mode, setMode] = useState<Mode>('bulk'); // Start with bulk mode

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#5EA908] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  CMS Provider Data Validator
                </h1>
                <p className="text-sm text-gray-600">Humana Healthcare Data Intelligence</p>
              </div>
            </div>
            
            {/* Mode Toggle Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setMode('bulk')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  mode === 'bulk'
                    ? 'bg-[#5EA908] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Bulk Upload
              </button>
              <button
                onClick={() => setMode('upload')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  mode === 'upload'
                    ? 'bg-[#5EA908] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Upload & Validate
              </button>
              <button
                onClick={() => setMode('chat')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  mode === 'chat'
                    ? 'bg-[#5EA908] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {mode === 'bulk' && (
          <>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Bulk Data Upload
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload large CSV files efficiently. Data is saved to the database and marked for validation.
              </p>
            </div>
            <BulkUpload />
          </>
        )}

        {mode === 'upload' && (
          <>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Upload & Validate
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload CSV and validate the first 10 rows immediately
              </p>
            </div>
            <FileUpload onValidationComplete={setValidationResults} />
            <ResultsDisplay results={validationResults} />
          </>
        )}

        {mode === 'chat' && (
          <>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Provider Data Assistant
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Ask questions about specific providers using natural language
              </p>
            </div>
            <ChatInterface />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 mt-16 py-6 bg-white">
        <div className="container mx-auto px-6 text-center text-sm text-gray-500">
          Powered by Claude Code
        </div>
      </div>
    </main>
  );
}