'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ResultsDisplay from '@/components/ResultsDisplay';

export default function Home() {
  const [validationResults, setValidationResults] = useState(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
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
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Multi-Agent AI Data Validation
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Intelligent analysis of healthcare provider data using coordinated AI agents
            to identify inconsistencies and ensure data quality.
          </p>
        </div>

        {/* Upload Section */}
        <FileUpload onValidationComplete={setValidationResults} />

        {/* Results Section */}
        <ResultsDisplay results={validationResults} />
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 mt-16 py-6 bg-white">
        <div className="container mx-auto px-6 text-center text-sm text-gray-500">
          Powered by AI • Built for Humana
        </div>
      </div>
    </main>
  );
}