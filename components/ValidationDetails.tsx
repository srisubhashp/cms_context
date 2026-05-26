'use client';

interface ValidationDetailsProps {
  provider: {
    npi: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    type?: string;
  };
  validation: {
    coordination?: any;
    geographic?: {
      isValid: boolean;
      confidence: number;
      findings: string[];
      details: string;
    };
  };
}

export default function ValidationDetails({ provider, validation }: ValidationDetailsProps) {
  const geographic = validation.geographic;

  if (!geographic) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">No validation data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Provider Details Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#5EA908] to-emerald-600 px-4 py-3">
          <h3 className="text-white font-semibold">Provider Information</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap w-32">
                  NPI
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {provider.npi}
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap">
                  Name
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {provider.name}
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap">
                  Address
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {provider.address}
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap">
                  City
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {provider.city}
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap">
                  State
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                    geographic.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {provider.state}
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap">
                  ZIP Code
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                    geographic.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {provider.zip}
                  </span>
                </td>
              </tr>
              {provider.type && (
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap">
                    Provider Type
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {provider.type}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation Results Card */}
      <div className={`rounded-lg border overflow-hidden ${
        geographic.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
      }`}>
        <div className={`px-4 py-3 flex items-center gap-2 ${
          geographic.isValid ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {geographic.isValid ? (
            <>
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-green-900">✓ Valid (Confidence: {geographic.confidence}%)</h3>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-red-900">✗ Invalid (Confidence: {geographic.confidence}%)</h3>
            </>
          )}
        </div>

        <div className="p-4">
          <p className={`text-sm mb-3 ${geographic.isValid ? 'text-green-800' : 'text-red-800'}`}>
            {geographic.details}
          </p>

          {geographic.findings && geographic.findings.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase">AI Validation Findings:</p>
              <ul className="space-y-1">
                {geographic.findings.map((finding, idx) => (
                  <li key={idx} className={`text-sm flex items-start gap-2 ${
                    geographic.isValid ? 'text-green-700' : 'text-red-700'
                  }`}>
                    <span className="mt-1">•</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}