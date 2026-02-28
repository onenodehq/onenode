// components/MaskedApiKey.tsx
import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

interface MaskedApiKeyProps {
  apiKey: string;
}

const MaskedApiKey: React.FC<MaskedApiKeyProps> = ({ apiKey }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-2">
      <div className="flex-grow w-full sm:w-auto font-mono text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-2.5 text-gray-700 overflow-x-auto">
        {apiKey}
      </div>
      <CopyToClipboard text={apiKey} onCopy={handleCopy}>
        <button 
          className={`inline-flex items-center px-3 py-2 border ${copied ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-700'} rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200`}
        >
          {copied ? (
            <>
              <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1.5" />
              Copied!
            </>
          ) : (
            <>
              <ClipboardDocumentIcon className="h-4 w-4 mr-1.5" />
              Copy to clipboard
            </>
          )}
        </button>
      </CopyToClipboard>
    </div>
  );
};

export default MaskedApiKey;
