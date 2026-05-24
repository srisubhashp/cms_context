'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ResultsDisplay from '@/components/ResultsDisplay';

export default function Home() {
  const [validationResults, setValidationResults] = useState(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CMS Provider Data Validator
          </h1>
          <p className="text-gray-600">
            Multi-Agent AI System for Healthcare Data Validation
          </p>
        </div>

        <FileUpload onValidationComplete={setValidationResults} />
        <ResultsDisplay results={validationResults} />
      </div>
    </main>
  );
}
