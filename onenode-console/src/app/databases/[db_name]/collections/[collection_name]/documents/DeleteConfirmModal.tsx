"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import deleteDocs from "@/app/utils/document/deleteDocs";
import Loader from "@/app/components/Loader";
import { useAppContext } from "@/app/contexts/AppContext";
import { useCollectionContext } from "../CollectionContext";
import { useDocumentContext } from "./DocumentsContext";

export default function DeleteConfirmModal() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { currentOrg, currentProject } = useAppContext();
  const { dbName, collectionName, setDocuments } = useCollectionContext();
  const { selectedDocuments, setIsDeleteConfirmOpen, isDeleteConfirmOpen } =
    useDocumentContext();

  const handleClose = () => {
    setIsDeleteConfirmOpen(false);
  };

  const handleDelete = async () => {
    if (!isDeleting && selectedDocuments.length) {
      try {
        setIsDeleting(true);

        await deleteDocs({
          orgId: currentOrg?._id.$oid as string,
          projectId: currentProject?._id.$oid as string,
          dbName: dbName,
          collectionName: collectionName,
          doc_ids: selectedDocuments.map((document) => document._id),
        });

        // Remove the deleted documents from the list
        setDocuments((prevItems) =>
          prevItems.filter(
            (doc) =>
              !selectedDocuments.some((document) => document._id === doc._id)
          )
        );
        toast.success("Documents deleted successfully.");
        setIsDeleteConfirmOpen(false);
      } catch (error) {
        toast.error("Failed to delete the documents. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Dialog
      open={isDeleteConfirmOpen}
      onClose={handleClose}
      className="relative z-50"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-xl bg-white dark:bg-gray-900 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                className="rounded-md bg-white/70 dark:bg-gray-900/70 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                onClick={handleClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 sm:mx-0 sm:h-8 sm:w-8">
                <ExclamationTriangleIcon
                  className="h-5 w-5 text-red-500 dark:text-red-400"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <DialogTitle
                  as="h3"
                  className="text-base font-medium leading-6 text-gray-900 dark:text-white"
                >
                  Delete {selectedDocuments.length > 1 ? 'Documents' : 'Document'}
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete {selectedDocuments.length > 1 
                      ? `these ${selectedDocuments.length} documents` 
                      : 'this document'}? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex w-auto justify-center rounded-full bg-red-500 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-600 focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? (
                  <div className="flex items-center">
                    <Loader color="white" type="dots" variant="button" />
                    <span className="ml-2">Deleting...</span>
                  </div>
                ) : (
                  "Delete"
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isDeleting}
                className="inline-flex w-auto justify-center rounded-full bg-white dark:bg-gray-800 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
