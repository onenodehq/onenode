import CodeBlock from "@/app/components/button/CodeBlock";
import { ServerIcon, FolderIcon, CodeBracketIcon, ArrowLeftIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { FunnelIcon } from "@heroicons/react/24/solid";
import { Project } from "@/app/types/project";
import Link from "next/link";
import { useCollectionContext } from "./CollectionContext";
import SearchFilterSection from "./SearchFilterSection";
import CollectionSidebarSkeleton from "@/app/components/Skeleton/CollectionSidebarSkeleton";
import { useEffect, useState } from "react";

interface CollectionSidebarProps {
  dbName: string;
  collectionName: string;
  currentProject: Project | null;
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  onRefresh?: () => void;
}

// Extracted Button component for pagination controls
const PaginationButton = ({ 
  onClick, 
  disabled, 
  children 
}: { 
  onClick: () => void; 
  disabled: boolean; 
  children: React.ReactNode 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-1 text-xs rounded-full transition flex justify-center items-center ${
      disabled 
        ? 'bg-gray-100 text-gray-400 dark:bg-gray-900 dark:text-gray-600 cursor-not-allowed' 
        : 'bg-white hover:bg-gray-50 dark:bg-black dark:hover:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
    }`}
  >
    {children}
  </button>
);

export default function CollectionSidebar({ 
  dbName, 
  collectionName, 
  currentProject,
  onPageChange,
  onPageSizeChange,
  onRefresh
}: CollectionSidebarProps) {
  const { documents, paginationInfo, isFilterActive, activeFilter } = useCollectionContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Consider the sidebar loaded when paginationInfo is available
    if (paginationInfo) {
      setIsLoading(false);
    }
  }, [paginationInfo]);

  // Show skeleton while loading
  if (isLoading) {
    return <CollectionSidebarSkeleton />;
  }

  // Handler for select change
  const handlePageSizeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onPageSizeChange) {
      const newSize = parseInt(e.target.value, 10);
      onPageSizeChange(newSize);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handlePreviousPage = () => {
    if (onPageChange && paginationInfo && (paginationInfo.has_prev ?? paginationInfo.current_page > 1)) {
      setIsLoading(true);
      onPageChange(paginationInfo.current_page - 1);
    }
  };

  const handleNextPage = () => {
    if (onPageChange && paginationInfo && (paginationInfo.has_next ?? paginationInfo.current_page < paginationInfo.total_pages)) {
      setIsLoading(true);
      onPageChange(paginationInfo.current_page + 1);
    }
  };

  // Check if previous/next buttons should be disabled
  const isPrevDisabled = !paginationInfo || !(paginationInfo.has_prev ?? paginationInfo.current_page > 1);
  const isNextDisabled = !paginationInfo || !(paginationInfo.has_next ?? paginationInfo.current_page < paginationInfo.total_pages);

  return (
    <div className="flex-shrink-0 sticky top-0">
      <div className="bg-white dark:bg-black rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
        {/* Header with navigation back to database */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20">
          <Link 
            href={`/databases/${dbName}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-1 transition"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5 mr-1" />
            Back to Database
          </Link>
          <div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                {dbName}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {collectionName}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-3 space-y-2.5">
          {/* Active Filter Indicator */}
          {isFilterActive && (
            <div className="p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-900/10 backdrop-blur-sm border border-blue-100 dark:border-blue-900/30">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center">
                  <FunnelIcon className="h-3 w-3 text-blue-600 dark:text-blue-400 mr-1.5" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                    Filter Active
                  </span>
                </div>
                <div className="mt-1 max-h-[60px] overflow-auto">
                  <CodeBlock 
                    code={JSON.stringify(activeFilter, null, 2)} 
                    variant="compact" 
                    maxWidth="100%"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Pagination Information */}
          {paginationInfo && (
            <div className="p-2.5 rounded-lg bg-gray-50/80 dark:bg-gray-900/30 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
              <div className="flex flex-col space-y-2">
                {/* Document count and refresh button */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {paginationInfo.total_count > 0 
                      ? `${paginationInfo.total_count.toLocaleString()} document${paginationInfo.total_count !== 1 ? 's' : ''}`
                      : 'No documents'
                    }
                    {isFilterActive && " (filtered)"}
                  </span>
                  
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center p-1 text-xs rounded-full border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                    title="Refresh documents"
                  >
                    <ArrowPathIcon className="h-3 w-3" />
                  </button>
                </div>
                
                <div className="flex flex-col space-y-2">
                  {/* Page number and page size selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {paginationInfo.total_count > 0 
                        ? `Page ${paginationInfo.current_page} of ${paginationInfo.total_pages}`
                        : 'No results'
                      }
                    </span>
                    
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Show</span>
                      <select
                        value={paginationInfo.page_size ?? 20}
                        onChange={handlePageSizeSelectChange}
                        className="text-xs rounded-md border-gray-200 dark:border-gray-800 bg-white dark:bg-black py-0.5 pl-2 pr-6 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Pagination buttons */}
                  <div className="grid grid-cols-2 gap-1">
                    <PaginationButton 
                      onClick={handlePreviousPage}
                      disabled={isPrevDisabled}
                    >
                      Previous
                    </PaginationButton>
                    <PaginationButton 
                      onClick={handleNextPage}
                      disabled={isNextDisabled}
                    >
                      Next
                    </PaginationButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Search Filter Section */}
        <SearchFilterSection />
      </div>
    </div>
  );
} 