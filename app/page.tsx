'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ResultsDisplay from '@/components/ResultsDisplay';
import ChatInterface from '@/components/ChatInterface';
import BulkUpload from '@/components/BulkUpload';

type Mode = 'upload' | 'bulk' | 'chat';

export default function Home() {
  const [validationResults, setValidationResults] = useState(null);
  const [mode, setMode] = useState<Mode>('chat');

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-300 via-orange-200 to-purple-200">
      {/* Header - Humana Green */}
      <div className="bg-white border-b border-gray-200 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#5EA908] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  CMS Provider Data Validator
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">Humana Healthcare Data Intelligence</p>
              </div>
            </div>
            
            {/* Mode Toggle Buttons */}
            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => setMode('bulk')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                  mode === 'bulk'
                    ? 'bg-[#5EA908] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Bulk Upload
              </button>
              <button
                onClick={() => setMode('upload')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                  mode === 'upload'
                    ? 'bg-[#5EA908] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Upload & Validate
              </button>
              <button
                onClick={() => setMode('chat')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 text-sm ${
                  mode === 'chat'
                    ? 'bg-[#5EA908] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {mode === 'bulk' && (
          <>
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Bulk Data Upload
              </h2>
              <p className="text-base sm:text-lg text-gray-800 max-w-2xl mx-auto">
                Upload large CSV files efficiently. Data is saved to the database and marked for validation.
              </p>
            </div>
            <BulkUpload />
          </>
        )}

        {mode === 'upload' && (
          <>
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Upload & Validate
              </h2>
              <p className="text-base sm:text-lg text-gray-800 max-w-2xl mx-auto">
                Upload CSV and validate the first 10 rows immediately
              </p>
            </div>
            <FileUpload onValidationComplete={setValidationResults} />
            <ResultsDisplay results={validationResults} />
          </>
        )}

        {mode === 'chat' && (
          <>
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Provider Data Assistant
              </h2>
              <p className="text-base sm:text-lg text-gray-800 max-w-2xl mx-auto">
                Ask questions about specific providers using natural language
              </p>
            </div>
            <ChatInterface />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 mt-16 py-6 bg-white/70">
        <div className="container mx-auto px-4 sm:px-6 text-center text-sm text-gray-700">
          Powered by AI • Built for Humana
        </div>
      </div>
    </main>
  );
}