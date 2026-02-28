import React, { useState, useEffect } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Document } from "mongodb";
import {
  convertExtendedJsonToReadable,
  convertReadableToExtendedJson,
} from "@/app/components/JsonForm/utils";
import updateDocs from "@/app/utils/document/updateDocs";
import { useAppContext } from "@/app/contexts/AppContext";
import { useCollectionContext } from "../CollectionContext";
import { useDocumentContext } from "./DocumentsContext";
import JsonForm from "@/app/components/JsonForm";
import { toast } from "react-toastify";

interface JsonContainerProps {
  index: number;
  document: Document;
  onDelete: (id: string) => void;
  readOnly?: boolean;
}

const JsonContainer = ({
  index,
  document,
  onDelete,
  readOnly = false,
}: JsonContainerProps) => {
  const [jsonContent, setJsonContent] = useState<string>("");
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isModified, setIsModified] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { setIsDeleteConfirmOpen, setSelectedDocuments } = useDocumentContext();
  const { currentProject, currentOrg } = useAppContext();
  const { dbName, collectionName } = useCollectionContext();

  useEffect(() => {
    // Convert the incoming document from Extended JSON to readable JSON
    const readableJson = convertExtendedJsonToReadable([document])[0];
    setJsonContent(JSON.stringify(readableJson, null, 2));
    setParsedJson(readableJson);
  }, [document]);

  // Handle changes in the JsonForm
  const handleJsonChange = (newData: any) => {
    setParsedJson(newData);
    setJsonContent(JSON.stringify(newData, null, 2));
    setIsModified(true);
    setIsValid(true);
    setError("");
  };

  const handleSave = async () => {
    if (!isValid || !isModified) return;
    
    setIsSaving(true);
    setError("");
    
    try {
      // Convert readable JSON back to Extended JSON
      const extendedJson = convertReadableToExtendedJson(parsedJson);
      
      // Get the document ID for the filter
      const docId = document._id;
      if (!docId) {
        throw new Error("Document ID not found");
      }
      
      // Create filter and update objects
      const filter = { _id: docId };
      const update = { $set: extendedJson };
      
      // Validate required fields
      if (!currentOrg?._id.$oid || !currentProject?._id.$oid || !dbName || !collectionName) {
        throw new Error("Missing required fields for update");
      }
      
      const result = await updateDocs({
        orgId: currentOrg._id.$oid,
        projectId: currentProject._id.$oid,
        dbName,
        collectionName,
        filter,
        update,
      });
      
      setIsModified(false);
      toast.success("Document updated successfully");
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(`Failed to update document: ${errorMessage}`);
      toast.error(`Failed to update document: ${errorMessage}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    setIsDeleteConfirmOpen(true);
    setSelectedDocuments([document]);
  };

  // Extract document ID for display
  const documentId = document._id?.$oid || document._id?.toString() || `doc-${index}`;
  const shortId = typeof documentId === 'string' ? 
    (documentId.length > 8 ? `${documentId.substring(0, 8)}...` : documentId) : 
    `doc-${index}`;
  
  // Check if this document has query match information
  const hasQueryInfo = '_query_score' in document;
  const score = hasQueryInfo ? document._query_score : null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {hasQueryInfo && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Score: {score}
            </span>
          )}
        </div>
        {error && (
          <div className="text-sm text-red-500 dark:text-red-400">
            {error}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 relative group">
        {!readOnly && (
          <button
            className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white/70 dark:bg-black/30 hover:bg-white/90 dark:hover:bg-black/50 backdrop-blur-sm rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100 focus:outline-none focus:ring-0"
            onClick={handleDelete}
            title="Delete document"
            aria-label="Delete document"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}

        <div className="p-4">
          <JsonForm
            data={parsedJson}
            onChange={handleJsonChange}
            readOnly={readOnly}
            onSave={handleSave}
            showSaveButton={!readOnly && isModified}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
};

export default JsonContainer; 