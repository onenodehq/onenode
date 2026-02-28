"use client";
import { useState, useEffect, useMemo } from "react";
import { useCollectionContext } from "./CollectionContext";
import { useQueryContext } from "./QueryContext";
import FilterBuilder from "./documents/FilterBuilder";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Declare the window interface with handleDocumentSearch
declare global {
  interface Window {
    handleDocumentRefresh?: () => void;
    handleDocumentSearch?: () => void;
  }
}

// Extracted components for better maintainability
const FilterIndicator = ({ 
  title, 
  onClear, 
  className,
  iconClassName 
}: { 
  title: string; 
  onClear: () => void; 
  className: string;
  iconClassName: string;
}) => (
  <div className={className}>
    <div className="flex items-center justify-between">
      <p className={`text-xs font-medium ${iconClassName}`}>
        {title}
      </p>
      <button 
        onClick={onClear}
        className={`p-0.5 rounded-full hover:${className.includes('blue') ? 'bg-blue-100 dark:hover:bg-blue-800/30' : 
          className.includes('green') ? 'bg-green-100 dark:hover:bg-green-800/30' : 
          'bg-purple-100 dark:hover:bg-purple-800/30'} transition`}
      >
        <XMarkIcon className={`h-3 w-3 ${iconClassName}`} />
      </button>
    </div>
  </div>
);

export default function SearchFilterSection() {
  const { 
    documents, 
    activeFilter,
    setActiveFilter,
    isFilterActive,
    setIsFilterActive,
    activeSort,
    setActiveSort,
    isSortActive,
    setIsSortActive
  } = useCollectionContext();
  
  const {
    queryText,
    setQueryText,
    isQueryMode,
    setIsQueryMode
  } = useQueryContext();

  // Add local state for input field
  const [localQueryText, setLocalQueryText] = useState('');

  // Initialize local state from context
  useEffect(() => {
    setLocalQueryText(queryText);
  }, [queryText]);
  
  // Extract unique field names from documents for filter suggestions
  const documentFields = useMemo(() => {
    const fields = new Set<string>();
    
    const extractFields = (obj: Record<string, any> | null, prefix = "") => {
      if (!obj || typeof obj !== "object") return;
      
      Object.keys(obj).forEach(key => {
        // Skip MongoDB internal _id field
        if (key === "_id" && prefix === "") return;
        
        const path = prefix ? `${prefix}.${key}` : key;
        fields.add(path);
        
        // Recursively extract nested fields, but limit depth to prevent infinite loops
        if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key]) && prefix.length < 30) {
          extractFields(obj[key], path);
        }
      });
    };
    
    documents.forEach(doc => extractFields(doc));
    return Array.from(fields);
  }, [documents]);

  // Trigger document refresh
  const triggerRefresh = () => {
    if (typeof window !== 'undefined' && window.handleDocumentRefresh) {
      window.handleDocumentRefresh();
    }
  };

  // Handle query text changes (only updates local state, not context)
  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQueryText(event.target.value);
  };

  // Handle query submit via Enter key
  const handleQueryKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle filter application
  const handleApplyFilter = (filter: Record<string, any>, sort?: Array<[string, number]>) => {
    // Apply filter
    setActiveFilter(filter);
    setIsFilterActive(Object.keys(filter).length > 0);
    
    // Apply sort if provided
    if (sort !== undefined) {
      setActiveSort(sort);
      setIsSortActive(sort.length > 0);
    }
    
    triggerRefresh();
  };

  // Clear all search and filter parameters
  const handleClearAll = () => {
    setIsQueryMode(false);
    setLocalQueryText("");
    setQueryText("");
    setActiveFilter({});
    setIsFilterActive(false);
    setActiveSort([]);
    setIsSortActive(false);
    
    triggerRefresh();
  };

  // Handle query clear
  const handleClearQuery = () => {
    setLocalQueryText(""); 
    setQueryText(""); 
    triggerRefresh();
  };

  // Handle search button click
  const handleSearch = () => {
    // Set query mode to true when search is triggered
    setIsQueryMode(true);
    // Only update the context state when search is explicitly triggered
    setQueryText(localQueryText);
    
    // Use the dedicated search handler instead of the generic triggerRefresh
    if (typeof window !== 'undefined' && window.handleDocumentSearch) {
      window.handleDocumentSearch();
    }
  };

  return (
    <>
      {/* Header section */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filters & Search</h3>
          {(isQueryMode || isFilterActive || isSortActive) && (
            <button
              onClick={handleClearAll}
              className="text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Remove Search Mode Toggle and always show search input */}
        
        {/* Active filters/search indicator */}
        {(isQueryMode || isFilterActive || isSortActive) && (
          <div className="flex flex-col space-y-2.5">
            {isFilterActive && (
              <FilterIndicator 
                title="Filter Active" 
                onClear={() => {
                  setActiveFilter({}); 
                  setIsFilterActive(false); 
                  triggerRefresh();
                }}
                className="w-full py-2 px-3 bg-green-50/70 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30 backdrop-blur-sm"
                iconClassName="text-green-800 dark:text-green-300"
              />
            )}
            
            {isSortActive && (
              <FilterIndicator 
                title="Sort Active" 
                onClear={() => {
                  setActiveSort([]); 
                  setIsSortActive(false);
                  triggerRefresh();
                }}
                className="w-full py-2 px-3 bg-purple-50/70 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/30 backdrop-blur-sm"
                iconClassName="text-purple-600 dark:text-purple-400"
              />
            )}
            
            {isQueryMode && (
              <FilterIndicator
                title="Search Active"
                onClear={() => {
                  setIsQueryMode(false);
                  setLocalQueryText("");
                  setQueryText("");
                  triggerRefresh();
                }}
                className="w-full py-2 px-3 bg-blue-50/70 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30 backdrop-blur-sm"
                iconClassName="text-blue-600 dark:text-blue-400"
              />
            )}
          </div>
        )}
        
        {/* Search input - always visible */}
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              className="w-full pl-9 pr-9 py-2 text-xs border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Search by keywords or meaning..."
              value={localQueryText}
              onChange={handleQueryChange}
              onKeyDown={handleQueryKeyPress}
            />
            {localQueryText && (
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                onClick={() => setLocalQueryText('')}
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="w-full px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </div>
        
      {/* Filter Builder - Moved outside the padding container */}
      <FilterBuilder 
        fields={documentFields} 
        onApplyFilter={handleApplyFilter}
        isQueryMode={isQueryMode}
      />
    </>
  );
} 