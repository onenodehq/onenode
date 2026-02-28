'use client';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useDownloadModal } from '@/context/DownloadModalContext';
import Image from 'next/image';

const DownloadModal = () => {
  const { isModalOpen, closeModal } = useDownloadModal();
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'typescript'>('python');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMarkdownFile = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/download-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: selectedLanguage }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate documentation');
      }
      
      // Handle zip file download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `onenode-docs-${selectedLanguage}-${new Date().toISOString().split('T')[0]}.zip`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Documentation folder downloaded successfully! Extract the zip file to access individual markdown files.');
      closeModal();
    } catch (error) {
      console.error('Error generating markdown file:', error);
      toast.error('Failed to generate documentation file. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-app-primary border border-app-primary rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-app-primary/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-app-primary">
                Download Documentation
              </h2>
            </div>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-app-secondary rounded-lg transition-colors duration-200 text-app-secondary hover:text-app-primary"
              disabled={isGenerating}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-app-secondary text-sm leading-relaxed mb-6">
            Get the complete OneNode documentation as organized markdown files. Perfect for offline use and AI code editors.
          </p>
          
          {/* Feature list */}
          <div className="bg-app-secondary/30 border border-app-primary/20 rounded-xl p-4 mb-6">
            <div className="flex items-center mb-3">
              <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mr-2">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="font-medium text-app-primary text-sm">What's included:</h4>
            </div>
            <ul className="text-xs text-app-secondary space-y-1.5 ml-7">
              <li>• Individual markdown files for each section</li>
              <li>• Complete code examples in your chosen language</li>
              <li>• README with package overview</li>
              <li>• Clean folder structure for easy navigation</li>
            </ul>
          </div>
          
          {/* Language Selection */}
          <div className="space-y-3 mb-8">
            <h3 className="text-sm font-medium text-app-primary mb-3">
              Choose your language:
            </h3>
            
            <div className="space-y-2">
              <label className={`relative flex items-center p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                selectedLanguage === 'python'
                  ? 'border-blue-500/50 bg-blue-500/5 shadow-sm'
                  : 'border-app-primary/20 hover:border-app-primary/40 hover:bg-app-secondary/30'
              }`}>
                <input
                  type="radio"
                  name="language"
                  value="python"
                  checked={selectedLanguage === 'python'}
                  onChange={(e) => setSelectedLanguage(e.target.value as 'python')}
                  disabled={isGenerating}
                  className="sr-only"
                />
                <div className="flex items-center flex-1">
                  <div className="w-8 h-8 mr-3 flex items-center justify-center">
                    <Image 
                      src="/images/python.svg" 
                      alt="Python" 
                      width={24} 
                      height={24} 
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div>
                    <div className="font-medium text-app-primary text-sm">Python</div>
                    <div className="text-xs text-app-secondary">Complete Python SDK examples</div>
                  </div>
                </div>
                {selectedLanguage === 'python' && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </label>
              
              <label className={`relative flex items-center p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                selectedLanguage === 'typescript'
                  ? 'border-blue-500/50 bg-blue-500/5 shadow-sm'
                  : 'border-app-primary/20 hover:border-app-primary/40 hover:bg-app-secondary/30'
              }`}>
                <input
                  type="radio"
                  name="language"
                  value="typescript"
                  checked={selectedLanguage === 'typescript'}
                  onChange={(e) => setSelectedLanguage(e.target.value as 'typescript')}
                  disabled={isGenerating}
                  className="sr-only"
                />
                <div className="flex items-center flex-1">
                  <div className="w-8 h-8 mr-3 flex items-center justify-center">
                    <Image 
                      src="/images/javascript.svg" 
                      alt="JavaScript/TypeScript" 
                      width={24} 
                      height={24} 
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div>
                    <div className="font-medium text-app-primary text-sm">JavaScript/TypeScript</div>
                    <div className="text-xs text-app-secondary">Complete JS/TS SDK examples</div>
                  </div>
                </div>
                {selectedLanguage === 'typescript' && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-app-secondary/30 border-t border-app-primary/20 flex justify-end space-x-3">
          <button
            onClick={closeModal}
            disabled={isGenerating}
            className="px-4 py-2 text-sm font-medium text-app-secondary hover:text-app-primary border border-app-primary/20 rounded-lg hover:bg-app-secondary/50 transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={generateMarkdownFile}
            disabled={isGenerating}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Documentation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal; 