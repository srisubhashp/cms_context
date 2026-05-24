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

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Validation Results
      </h2>

      <div className="mb-6 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Total Rows:</span> {results.totalRows}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Processed:</span>{' '}
          {results.processedRows}
        </p>
      </div>

      <div className="space-y-6">
        {results.results.map((result, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                Row {index + 1}: {result.rowData.provider_name || 'Unknown Provider'}
              </h3>
            </div>

            {/* Coordinator Info */}
            <div className="mb-3 p-3 bg-gray-50 rounded">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                📋 Coordinator Analysis
              </h4>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Data Quality:</span>{' '}
                <span
                  className={`inline-block px-2 py-1 rounded text-xs ${
                    result.coordination.dataQuality === 'Complete'
                      ? 'bg-green-100 text-green-800'
                      : result.coordination.dataQuality === 'Partial'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {result.coordination.dataQuality}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {result.coordination.reasoning}
              </p>
            </div>

            {/* Geographic Validation */}
            {result.geographic && (
              <div className="p-3 bg-gray-50 rounded">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  🌍 Geographic Validation
                </h4>
                <div className="mb-2">
                  <span
                    className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                      result.geographic.isValid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {result.geographic.isValid ? '✓ Valid' : '✗ Invalid'}
                  </span>
                  <span className="ml-3 text-sm text-gray-600">
                    Confidence: {result.geographic.confidence}%
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  {result.geographic.details}
                </p>

                {result.geographic.findings.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Issues Found:
                    </p>
                    <ul className="list-disc list-inside text-sm text-red-600">
                      {result.geographic.findings.map((finding, i) => (
                        <li key={i}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Raw Data */}
            <details className="mt-3">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                View Raw Data
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                {JSON.stringify(result.rowData, null, 2)}
              </pre>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
