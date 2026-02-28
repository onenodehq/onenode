'use client';
import React from 'react';
import { useDownloadModal } from '@/context/DownloadModalContext';

const DownloadDocsButton = () => {
  const { openModal } = useDownloadModal();

  return (
    <button
      onClick={openModal}
      className="group flex items-center px-4 py-1.5 rounded-lg border transition-all duration-200 text-app-secondary border-app-primary hover:border-red-200 hover:bg-red-50"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="text-sm font-medium">Download Docs</span>
    </button>
  );
};

export default DownloadDocsButton; 