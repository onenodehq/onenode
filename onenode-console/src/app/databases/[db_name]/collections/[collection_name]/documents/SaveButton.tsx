import { useCollectionContext } from "../CollectionContext";
import { Document } from "mongodb";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function SaveButton() {
  const { isEdited, documents, editedDocuments } = useCollectionContext();

  const compareDocuments = (
    documents: Document[],
    editedDocuments: Document[]
  ) => {
    const originalIds = new Set(documents.map((doc) => doc._id.$oid));
    const editedIds = new Set(editedDocuments.map((doc) => doc._id.$oid));

    // Find edited documents
    const editedDocs = editedDocuments.filter((doc) => {
      const originalDoc = documents.find((d) => d._id.$oid === doc._id.$oid);
      return originalDoc && JSON.stringify(originalDoc) !== JSON.stringify(doc);
    });

    // Find created documents
    const createdDocs = editedDocuments.filter(
      (doc) => !originalIds.has(doc._id.$oid)
    );

    // Find deleted documents
    const deletedDocs = documents.filter((doc) => !editedIds.has(doc._id.$oid));

    return { editedDocs, createdDocs, deletedDocs };
  };

  const handleSave = async () => {
    const { editedDocs, createdDocs, deletedDocs } = compareDocuments(
      documents,
      editedDocuments
    );
    // Implementation would go here
  };
  
  const handleDiscard = () => {
    // Implementation would go here
    window.location.reload();
  };
  
  if (!isEdited) {
    return null;
  }
  
  return (
    <div className="flex space-x-2">
      <button
        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        onClick={handleDiscard}
        title="Discard changes"
      >
        <XMarkIcon className="h-4 w-4 mr-1.5" />
        Discard
      </button>
      <button
        className="inline-flex items-center px-3 py-2 border border-emerald-300 dark:border-emerald-700 rounded-md shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
        onClick={handleSave}
        title="Save changes"
      >
        <CheckIcon className="h-4 w-4 mr-1.5" />
        Save Changes
      </button>
    </div>
  );
}
