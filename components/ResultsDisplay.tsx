'use client';

interface ValidationResult {
  rowData: any;
  coordination: {
    needsGeographicValidation: boolean;
    reasoning: string;
    dataQuality: string;
  };
  geographic: {
    isValid: boolean;
    confidence: number;
    findings: string[];
    details: string;
  } | null;
}

interface ResultsDisplayProps {
  results: {
    success: boolean;
    totalRows: number;
    processedRows: number;
    results: ValidationResult[];
  } | null;
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (!results) return null;

  const issueCount = results.results.filter(
    (r) => r.geographic && !r.geographic.isValid
  ).length;

  return (
    <div className="max-w-6xl mx-auto mt-12">
      {/* Summary Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-[#5EA908] to-emerald-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Validation Results
          </h2>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-700 mb-1">Total Rows</p>
            <p className="text-3xl font-bold text-blue-900">{results.totalRows}</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm font-medium text-purple-700 mb-1">Processed</p>
            <p className="text-3xl font-bold text-purple-900">{results.processedRows}</p>
          </div>

          <div className={`rounded-lg p-4 border ${
            issueCount > 0 
              ? 'bg-red-50 border-red-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <p className={`text-sm font-medium mb-1 ${
              issueCount > 0 ? 'text-red-700' : 'text-green-700'
            }`}>
              Issues Found
            </p>
            <p className={`text-3xl font-bold ${
              issueCount > 0 ? 'text-red-900' : 'text-green-900'
            }`}>
              {issueCount}
            </p>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.results.map((result, index) => {
          const hasIssues = result.geographic && !result.geographic.isValid;
          
          return (
            <div 
              key={index} 
              className={`bg-white rounded-xl shadow-md border-2 overflow-hidden transition-all hover:shadow-lg ${
                hasIssues ? 'border-red-300' : 'border-green-300'
              }`}
            >
              {/* Provider Header */}
              <div className={`px-6 py-4 ${
                hasIssues 
                  ? 'bg-gradient-to-r from-red-50 to-orange-50' 
                  : 'bg-gradient-to-r from-green-50 to-emerald-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      hasIssues ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      {hasIssues ? (
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Provider #{index + 1}: {result.rowData.provider_name || 'Unknown Provider'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        NPI: {result.rowData.npi || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    hasIssues 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {hasIssues ? '⚠️ Issues Detected' : '✓ Valid'}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                {/* Coordinator Analysis */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900 mb-2">
                        Coordinator Agent Analysis
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-gray-600">Data Quality:</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          result.coordination.dataQuality === 'Complete'
                            ? 'bg-green-100 text-green-800'
                            : result.coordination.dataQuality === 'Partial'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.coordination.dataQuality}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {result.coordination.reasoning}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Geographic Validation */}
                {result.geographic && (
                  <div className={`rounded-lg p-4 border ${
                    result.geographic.isValid
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        result.geographic.isValid ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <svg className={`w-5 h-5 ${
                          result.geographic.isValid ? 'text-green-600' : 'text-red-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-bold text-gray-900">
                            Geographic Agent Validation
                          </h4>
                          <span className={`text-xs font-semibold ${
                            result.geographic.isValid ? 'text-green-700' : 'text-red-700'
                          }`}>
                            Confidence: {result.geographic.confidence}%
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">
                          {result.geographic.details}
                        </p>

                        {result.geographic.findings.length > 0 && (
                          <div className="mt-3 bg-white rounded p-3 border-l-4 border-red-500">
                            <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Issues Identified:
                            </p>
                            <ul className="space-y-1">
                              {result.geographic.findings.map((finding, i) => (
                                <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                                  <span className="text-red-500 font-bold">•</span>
                                  <span>{finding}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Raw Data Accordion */}
                <details className="group">
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        View Raw Provider Data
                      </span>
                      <svg className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </summary>
                  <div className="mt-2">
                    <pre className="p-4 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto font-mono">
                      {JSON.stringify(result.rowData, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}