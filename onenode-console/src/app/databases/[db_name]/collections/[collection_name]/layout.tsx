"use client";
import { QueryProvider } from "./QueryContext";
import { CollectionProvider } from "./CollectionContext";
import { useAppContext } from "@/app/contexts/AppContext";
import CollectionSidebar from "./CollectionSidebar";
import { Project } from "@/app/types/project";
import { useEffect, useState } from "react";

// Add TypeScript definitions for the window pagination handlers
declare global {
  interface Window {
    handleDocumentPageChange?: (newPage: number) => void;
    handleDocumentPageSizeChange?: (newSize: number) => void;
    handleDocumentRefresh?: () => void;
  }
}

export default function Layout({
  params,
  children,
}: Readonly<{
  params: { db_name: string; collection_name: string };
  children: React.ReactNode;
}>) {
  const { currentProject } = useAppContext();
  
  // State to hold the current page change handlers
  const [pageChangeHandler, setPageChangeHandler] = useState<((page: number) => void) | undefined>(undefined);
  const [pageSizeChangeHandler, setPageSizeChangeHandler] = useState<((size: number) => void) | undefined>(undefined);
  const [refreshHandler, setRefreshHandler] = useState<(() => void) | undefined>(undefined);
  
  // Effect to register handlers from window object
  useEffect(() => {
    const registerHandlers = () => {
      setPageChangeHandler(() => window.handleDocumentPageChange);
      setPageSizeChangeHandler(() => window.handleDocumentPageSizeChange);
      setRefreshHandler(() => window.handleDocumentRefresh);
    };
    
    // Register handlers initially
    registerHandlers();
    
    // Check again after a short delay to ensure document page is initialized
    const timeoutId = setTimeout(registerHandlers, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <CollectionProvider
      dbName={params.db_name}
      collectionName={params.collection_name}
    >
      <QueryProvider>
        <div className="w-full relative max-w-7xl mx-auto">
          <div className="flex gap-4">
            <div className="w-72">
              <CollectionSidebar 
                dbName={params.db_name}
                collectionName={params.collection_name}
                currentProject={currentProject as Project | null}
                onPageChange={pageChangeHandler}
                onPageSizeChange={pageSizeChangeHandler}
                onRefresh={refreshHandler}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {children}
            </div>
          </div>
        </div>
      </QueryProvider>
    </CollectionProvider>
  );
}
