import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function CopyInput({ value = '', className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        <label htmlFor="copy-input" className="sr-only">Copy</label>
        <input
          id="copy-input"
          type="text"
          value={value}
          readOnly
          disabled
          className="col-span-6 bg-gray-50 border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
        <button
          onClick={handleCopy}
          className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 inline-flex items-center justify-center transition"
          title={copied ? "Copied!" : "Copy to clipboard"}
        >
          {copied ? (
            <CheckIcon className="w-4 h-4 text-blue-700 dark:text-blue-500" />
          ) : (
            <ClipboardIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
