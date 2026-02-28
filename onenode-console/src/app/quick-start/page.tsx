"use client";
import { useState, useEffect, useRef } from "react";
import { KeyIcon, ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import CodeBlock from "@/app/components/button/CodeBlock";
import { useAppContext } from "@/app/contexts/AppContext";
import createApiKey from "@/app/utils/api-keys/createApiKey";
import { toast } from "react-toastify";
import { CopyToClipboard } from "react-copy-to-clipboard";
interface apiKey {
  name?: string;
  value: string;
  hashValue: string;
}

interface StepProps {
  number: number;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

function Step({ number, title, description, children }: StepProps) {
  const stepRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (stepRef.current) {
      observer.observe(stepRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={stepRef}
      className={`flex gap-8 py-12 border-b border-gray-100 last:border-b-0 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-red-300 text-white">
          {number}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-red-400 mb-2">{title}</h3>
        {description && <p className="text-gray-600 mb-6">{description}</p>}
        {children}
      </div>
    </div>
  );
}

// API Key Creation Component
function EmbeddedApiKeyCreation({ onKeyCreated }: { onKeyCreated: (apiKey: apiKey) => void }) {
  const [isCreating, setIsCreating] = useState(false);
  const { currentOrg, currentProject } = useAppContext();

  const handleCreateKey = async () => {
    if (!currentOrg || !currentProject) {
      toast.error("Please make sure you're logged in and have a project selected.");
      return;
    }

    setIsCreating(true);
    try {
      const apiKey = await createApiKey({
        orgId: currentOrg._id.$oid as string,
        keyName: "Quick Start API Key",
        projectId: currentProject._id.$oid as string,
      });
      
      onKeyCreated(apiKey);
      toast.success("API key created successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create API key. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <button
      onClick={handleCreateKey}
      disabled={isCreating}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isCreating
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-gray-900 hover:bg-gray-800 text-white'
      }`}
    >
      <KeyIcon className="w-4 h-4" />
      {isCreating ? 'Creating...' : 'Create API Key'}
    </button>
  );
}

// API Key Display Component
function ApiKeyDisplay({ apiKey }: { apiKey: apiKey }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">
          <strong>Save this API key</strong> — you won&apos;t be able to view it again.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 overflow-x-auto">
          {apiKey.value}
        </div>
        <CopyToClipboard text={apiKey.value} onCopy={handleCopy}>
          <button className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            copied 
              ? 'border-green-200 bg-green-50 text-green-700' 
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}>
            {copied ? (
              <>
                <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" />
                Copied
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                Copy
              </>
            )}
          </button>
        </CopyToClipboard>
      </div>

      <p className="text-sm text-gray-500">
        You can also manage API keys from the{' '}
        <Link href="/api-keys" className="text-gray-900 hover:text-gray-700 underline">
          API Keys page
        </Link>
      </p>
    </div>
  );
}

// Project ID Display Component
function ProjectIdDisplay({ projectId }: { projectId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">
          <strong>Store this Project ID</strong> as an environment variable for your application.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 overflow-x-auto">
            {projectId}
          </div>
          <CopyToClipboard text={projectId} onCopy={handleCopy}>
            <button className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              copied 
                ? 'border-green-200 bg-green-50 text-green-700' 
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}>
              {copied ? (
                <>
                  <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </button>
          </CopyToClipboard>
        </div>

      </div>
    </div>
  );
}

// SDK Command Display Component
function SdkCommandDisplay({ command, label }: { command: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <h5 className="text-sm font-medium text-gray-700">{label}</h5>
      <div className="flex items-center gap-3">
        <div className="flex-1 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 overflow-x-auto">
          {command}
        </div>
        <CopyToClipboard text={command} onCopy={handleCopy}>
          <button className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            copied 
              ? 'border-green-200 bg-green-50 text-green-700' 
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}>
            {copied ? (
              <>
                <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" />
                Copied
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                Copy
              </>
            )}
          </button>
        </CopyToClipboard>
      </div>
    </div>
  );
}

export default function QuickStartPage() {
  const [createdApiKey, setCreatedApiKey] = useState<apiKey | null>(null);
  const { currentProject } = useAppContext();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Quick Start</h1>
        <p className="text-lg text-gray-600">
          Get started with OneNode in minutes. Follow these steps to set up your first project.
        </p>
      </div>

      <div className="bg-white">
        <Step
          number={1}
          title="Set up Project Credentials"
          description="Copy your Project ID and create an API key to authenticate your requests to OneNode."
        >
          <div className="space-y-8">
            {/* Project ID Section */}
            {currentProject && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Project ID</h4>
                <ProjectIdDisplay projectId={currentProject._id.$oid as string} />
              </div>
            )}

            {/* API Key Section */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">API Key</h4>
              {!createdApiKey ? (
                <EmbeddedApiKeyCreation onKeyCreated={setCreatedApiKey} />
              ) : (
                <ApiKeyDisplay apiKey={createdApiKey} />
              )}
            </div>
          </div>
        </Step>

        <Step
          number={2}
          title="Install OneNode SDK"
          description="Choose your preferred language and install the OneNode SDK."
        >
          <div className="space-y-6">
            <SdkCommandDisplay 
              command="pip install onenode" 
              label="Python" 
            />
            <SdkCommandDisplay 
              command="npm install onenode" 
              label="JavaScript/Node.js" 
            />
          </div>
        </Step>

        <Step
          number={3}
          title="You're Ready to Start Coding!"
          description="Everything is set up and ready to go. Check out our documentation for detailed syntax and examples."
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              You now have everything you need to start building with OneNode. Use your API key and Project ID to authenticate your requests.
            </p>
            
            <Link 
              href="https://docs.onenode.ai" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
            >
              View Complete Documentation
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </Step>
      </div>

      <div className="mt-16 pt-12 border-t border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-8">Need Help?</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Link 
            href="/feedback" 
            className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <h3 className="font-medium text-gray-900 mb-2">Send Feedback</h3>
            <p className="text-sm text-gray-600">Share your thoughts or report issues</p>
          </Link>
          
          <a 
            href="mailto:founders@onenode.ai" 
            className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <h3 className="font-medium text-gray-900 mb-2">Email Support</h3>
            <p className="text-sm text-gray-600">Get help from our team</p>
          </a>
        </div>
      </div>
    </div>
  );
} 