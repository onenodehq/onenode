"use client";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useCollectionContext } from "../CollectionContext";
import { useQueryContext } from "../QueryContext";
import PageLoader from "@/app/components/PageLoader";
import getDocuments, { DocumentsResponse } from "@/app/utils/document/getDocuments";
import findDocuments from "@/app/utils/document/findDocuments";
import queryDocuments from "@/app/utils/document/queryDocuments";
import { useAppContext } from "@/app/contexts/AppContext";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { DocumentProvider } from "./DocumentsContext";
import SaveButton from "./SaveButton";
import JsonContainer from "./JsonContainer";
import { useMonaco } from "@monaco-editor/react";
import { bsonJsonLanguage, bsonJsonTheme } from "@/app/components/JsonForm/utils";
import deleteDocs from "@/app/utils/document/deleteDocs";
import DocumentListSkeleton from "@/app/components/Skeleton/DocumentListSkeleton";

interface NoDocumentsFoundProps {
  isQueryMode: boolean;
  queryText: string;
  isFilterActive: boolean;
  isSortActive: boolean;
}

// Extracted out for readability
const NoDocumentsFound: React.FC<NoDocumentsFoundProps> = ({ isQueryMode, queryText, isFilterActive, isSortActive }) => (
  <div className="text-center py-12 px-4">
    <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No documents found</h3>
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
      {isQueryMode && queryText
        ? "No documents match your semantic search query."
        : isFilterActive || isSortActive 
          ? "No documents match the current filters."
          : "This collection doesn't have any documents yet."}
    </p>
  </div>
);

// Extend Window interface to include our pagination handlers
declare global {
  interface Window {
    handleDocumentPageChange?: (newPage: number) => void;
    handleDocumentPageSizeChange?: (newSize: number) => void;
    handleDocumentSearch?: () => void;
    handleDocumentRefresh?: () => void;
  }
}

export default function Page() {
  const { 
    documents, 
    setDocuments, 
    setEditedDocuments,
    paginationInfo, 
    setPaginationInfo,
    dbName, 
    collectionName,
    activeFilter,
    isFilterActive,
    activeSort,
    isSortActive
  } = useCollectionContext();
  
  const {
    queryText,
    isQueryMode
  } = useQueryContext();
  
  const { currentProject, currentOrg } = useAppContext();
  const [isFetching, setIsFetching] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const monaco = useMonaco();
  const previousIsQueryModeRef = useRef<boolean>();

  useEffect(() => {
    if (!monaco) return;

    // Register our custom language
    monaco.languages.register({ id: "bson-json" });

    // Register the tokenizer
    monaco.languages.setMonarchTokensProvider("bson-json", bsonJsonLanguage);

    // Define the custom theme
    monaco.editor.defineTheme("bsonTheme", bsonJsonTheme);
  }, [monaco]);

  // Helper function to update state after fetch/find/query
  const handleFetchResponse = useCallback((response: DocumentsResponse, limit: number) => {
    setDocuments(response.documents);
    setPaginationInfo({
      ...response.pagination,
      page_size: limit,
      has_next: response.pagination.has_next ?? 
        (response.pagination.current_page < response.pagination.total_pages),
      has_prev: response.pagination.has_prev ?? 
        (response.pagination.current_page > 1)
    });
    if (setEditedDocuments) {
      setEditedDocuments(response.documents);
    }
  }, [setDocuments, setPaginationInfo, setEditedDocuments]);

  // Helper function to handle fetch errors
  const handleFetchError = useCallback((error: unknown, action: string) => {
    console.error(`Error ${action} documents:`, error);
    setDocuments([]);
    setPaginationInfo({
      total_count: 0,
      total_pages: 1,
      current_page: 1,
      page_size: pageSize,
      has_next: false,
      has_prev: false
    });
    setFetchError(`Failed to ${action.toLowerCase()} documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }, [pageSize, setDocuments, setPaginationInfo, setFetchError]);

  // --- Refactored Fetching Functions ---

  // Function to fetch initial/default documents
  const fetchInitialDocuments = useCallback(async (page = currentPage, limit = pageSize) => { 
    if (!currentOrg || !currentProject || !collectionName) return;
    
    setIsFetching(true);
    setFetchError(null);
    try {
      const response = await getDocuments({
        orgId: currentOrg._id.$oid as string,
        projectId: currentProject._id.$oid as string,
        dbName: dbName,
        collectionName: collectionName,
        page: page,
        limit: limit
      });
      handleFetchResponse(response, limit);
    } catch (error) {
      handleFetchError(error, "fetching");
    } finally {
      setIsFetching(false);
    }
  }, [currentOrg, currentProject, collectionName, dbName, currentPage, pageSize, handleFetchError, handleFetchResponse]); 

  // Function to fetch filtered/sorted documents
  const fetchFilteredDocuments = useCallback(async (page = currentPage, limit = pageSize) => {
    if (!currentOrg || !currentProject || !collectionName || (!isFilterActive && !isSortActive)) return;

    setIsFetching(true);
    setFetchError(null);
    try {
      const response = await findDocuments({
        orgId: currentOrg._id.$oid as string,
        projectId: currentProject._id.$oid as string,
        dbName: dbName,
        collectionName: collectionName,
        filter: activeFilter,
        sort: activeSort.length > 0 ? activeSort : undefined,
        limit: limit,
        page: page
      });
      handleFetchResponse(response, limit);
    } catch (error) {
      handleFetchError(error, "finding");
    } finally {
      setIsFetching(false);
    }
  }, [currentOrg, currentProject, collectionName, dbName, isFilterActive, activeFilter, isSortActive, activeSort, currentPage, pageSize, handleFetchError, handleFetchResponse]); 

  // Function to fetch query results (Effect remains for triggering, function for direct calls)
  const handleQuerySearch = useCallback(async () => {
    if (!currentOrg || !currentProject || !collectionName || !queryText.trim()) return;
    
    setIsFetching(true);
    setFetchError(null);
    
    try {
      const response = await queryDocuments({
        orgId: currentOrg._id.$oid as string,
        projectId: currentProject._id.$oid as string,
        dbName: dbName,
        collectionName: collectionName,
        query: queryText,
        filter: isFilterActive ? activeFilter : undefined,
        top_k: 50
      });
      
      setDocuments(response.documents);
      setPaginationInfo({
        ...response.pagination,
        page_size: pageSize,
      });
      
      if (setEditedDocuments) {
        setEditedDocuments(response.documents);
      }
    } catch (error) {
      handleFetchError(error, "querying");
    } finally {
      setIsFetching(false);
    }
  }, [currentOrg, currentProject, collectionName, dbName, queryText, isFilterActive, activeFilter, pageSize, handleFetchError]);

  // --- useEffect Hooks for Triggering Fetches ---

  // Effect for initial/default document fetching (no query, no filter/sort)
  useEffect(() => {
    const wasQueryMode = previousIsQueryModeRef.current;
    previousIsQueryModeRef.current = isQueryMode;

    // Prevent fetch if in query/filter/sort mode or just toggled query off
    if (isQueryMode || isFilterActive || isSortActive || (wasQueryMode === true && !isQueryMode)) {
      return;
    }
    // Call the standalone fetch function
    fetchInitialDocuments(currentPage, pageSize); 
    
  // Dependencies now trigger THIS effect, which calls the fetch function
  }, [isQueryMode, isFilterActive, isSortActive, currentPage, pageSize, fetchInitialDocuments]); 

  // Effect for filtered/sorted document fetching (no query)
  useEffect(() => {
    // Prevent fetch if in query mode or no filters/sorts are active
    if (isQueryMode || (!isFilterActive && !isSortActive)) return;

    // Call the standalone fetch function
    fetchFilteredDocuments(currentPage, pageSize);

  // Dependencies now trigger THIS effect, which calls the fetch function
  }, [isQueryMode, isFilterActive, isSortActive, activeFilter, activeSort, currentPage, pageSize, fetchFilteredDocuments]); 

  // Effect for query mode (Triggers handleQuerySearch)
  useEffect(() => {
    if (isQueryMode && queryText.trim()) {
      handleQuerySearch();
    }
  }, [isQueryMode, queryText, handleQuerySearch]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const handleDelete = (id: string | object) => {
    deleteDocs({
      orgId: currentOrg?._id.$oid as string,
      projectId: currentProject?._id.$oid as string,
      dbName: dbName,
      collectionName: collectionName,
      doc_ids: [id],
    });

    // For demonstration, remove the document from the list
    setDocuments((prevDocs) => prevDocs.filter((doc) => doc._id !== id));
  };

  // Update the collection context with page change handlers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.handleDocumentPageChange = handlePageChange;
      window.handleDocumentPageSizeChange = handlePageSizeChange;
      
      // Add a dedicated search handler
      window.handleDocumentSearch = () => {
        setCurrentPage(1); // Reset to first page
        handleQuerySearch(); // Directly call query search function
      };
      
      window.handleDocumentRefresh = () => {
        setCurrentPage(1); // Reset to first page
        // Call the correct fetch function based only on filter/sort state
        if (isFilterActive || isSortActive) {
          fetchFilteredDocuments(1, pageSize); // Fetch page 1 of filtered/sorted
        } else {
          fetchInitialDocuments(1, pageSize); // Fetch page 1 of default
        }
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.handleDocumentPageChange;
        delete window.handleDocumentPageSizeChange;
        delete window.handleDocumentSearch;
        delete window.handleDocumentRefresh;
      }
    };
    // Update dependencies: fetch functions are now stable due to useCallback
  }, [pageSize, isFilterActive, activeFilter, isSortActive, activeSort, handleQuerySearch, handlePageChange, handlePageSizeChange, fetchInitialDocuments, fetchFilteredDocuments]); 

  return (
    <>
      <DocumentProvider>
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4">
            {isFetching ? (
              <div className="w-full max-w-4xl mx-auto">
                <DocumentListSkeleton count={Math.min(pageSize, 5)} />
              </div>
            ) : (
              <div className="w-full max-w-4xl mx-auto">
                {fetchError && (
                  <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-800 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-300 rounded-md">
                    {fetchError}
                  </div>
                )}
                
                {documents.length === 0 ? (
                  <NoDocumentsFound 
                    isQueryMode={isQueryMode}
                    queryText={queryText}
                    isFilterActive={isFilterActive}
                    isSortActive={isSortActive}
                  />
                ) : (
                  <>
                    {monaco && documents.map((doc, index) => (
                      <JsonContainer
                        key={doc._id?.$oid || doc._id?.toString() || `doc-${index}`}
                        index={index}
                        document={doc}
                        onDelete={handleDelete}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <DeleteConfirmModal />
      </DocumentProvider>
    </>
  );
}
