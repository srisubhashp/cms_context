'use client';

import { useState } from 'react';

export default function BulkUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      setUploadResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#5EA908] to-emerald-600 px-6 py-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Bulk Upload to Database
          </h3>
          <p className="text-sm text-green-50 mt-1">
            Upload large CSV files efficiently (handles 100k+ rows)
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* File Input */}
          <div className="mb-6">
            <label htmlFor="bulk-upload" className="block text-sm font-semibold text-gray-700 mb-3">
              Select CSV File
            </label>
            <div className="relative">
              <input
                id="bulk-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-600
                  file:mr-4 file:py-3 file:px-6
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#5EA908] file:text-white
                  hover:file:bg-emerald-700
                  file:cursor-pointer cursor-pointer
                  file:transition-all file:duration-200
                  border-2 border-dashed border-gray-300 rounded-lg p-4
                  hover:border-[#5EA908] transition-colors"
              />
            </div>
            
            {file && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-[#5EA908]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Success Result */}
          {uploadResult && (
            <div className={`mb-6 p-4 rounded-lg border-l-4 ${
              uploadResult.errors > 0 
                ? 'bg-yellow-50 border-yellow-500' 
                : 'bg-green-50 border-green-500'
            }`}>
              <h4 className="text-sm font-bold text-gray-900 mb-2">Upload Complete!</h4>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Total Rows:</span> {uploadResult.totalRows.toLocaleString()}
                </p>
                <p className="text-green-700">
                  <span className="font-medium">✓ Saved:</span> {uploadResult.savedToDatabase.toLocaleString()}
                </p>
                {uploadResult.errors > 0 && (
                  <p className="text-yellow-700">
                    <span className="font-medium">⚠ Errors:</span> {uploadResult.errors.toLocaleString()}
                  </p>
                )}
              </div>
              {uploadResult.errorDetails && uploadResult.errorDetails.length > 0 && (
                <details className="mt-3">
                  <summary className="text-xs font-semibold text-gray-700 cursor-pointer">
                    View Error Details
                  </summary>
                  <ul className="mt-2 text-xs text-red-600 space-y-1">
                    {uploadResult.errorDetails.map((err: string, i: number) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full bg-gradient-to-r from-[#5EA908] to-emerald-600 text-white py-4 px-6 rounded-lg
              hover:from-emerald-700 hover:to-emerald-800
              disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
              transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl
              transform hover:-translate-y-0.5 disabled:transform-none
              flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Uploading to Database...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload to Database</span>
              </>
            )}
          </button>

          {/* Info Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">How it works:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Uploads data in batches of 100 rows</li>
                  <li>• Shows real-time progress in terminal</li>
                  <li>• All rows marked as "pending" for validation</li>
                  <li>• Use Chat Mode to validate specific providers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}