"use client";
import ApiKeyCreationModal from "./ApiKeyCreationModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { ApiKeyProvider } from "./ApiKeyContext";
import ApiKeyCreateButton from "./ApiKeyCreateButton";
import ApiKeyTable from "./ApiKeyTable";
import { useEffect, useState } from "react";
import { useAppContext } from "@/app/contexts/AppContext";
import { useRouter } from "next/navigation";
import { KeyIcon } from "@heroicons/react/24/outline";
import CodeBlock from "@/app/components/button/CodeBlock";
import PageLoader from "@/app/components/PageLoader";

export default function Page() {
  const { currentOrg, currentProject } = useAppContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Add a small delay to ensure context has time to load
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Only redirect if org/project are still missing after loading
      if (!(currentOrg && currentProject)) {
        router.push("/dashboard");
      }
    }, 1000); // 1 second delay
    
    return () => clearTimeout(timer);
  }, [currentOrg, currentProject, router]);
  
  // Show loading state during initial load
  if (isLoading) {
    return <PageLoader />;
  }
  
  return (
    <div className="min-h-screen bg-slate-50/50">
      <ApiKeyProvider>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ApiKeyCreationModal />
          <DeleteConfirmModal />
          
          {/* Header Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-black rounded-lg">
                  <KeyIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    API Secrets
                  </h1>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Manage authentication keys for your applications
                  </p>
                </div>
              </div>
              <div className="[&_button]:bg-black [&_button]:hover:bg-gray-800 [&_button]:text-white [&_button]:border-black">
                <ApiKeyCreateButton />
              </div>
            </div>
          </div>
          
          {/* Project ID Section */}
          {currentProject?._id?.$oid && (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Project ID</h3>
                  <p className="text-xs text-slate-500">
                    Reference this ID in your API requests to identify your project
                  </p>
                </div>
                <div className="ml-4">
                  <CodeBlock 
                    code={currentProject._id.$oid}
                    variant="default"
                  />
                </div>
              </div>
            </div>
          )}

          {/* API Keys Section */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <ApiKeyTable />
          </div>
        </div>
      </ApiKeyProvider>
    </div>
  );
}
