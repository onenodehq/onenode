"use client";

import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useApiKeyContext } from "./ApiKeyContext";
import { toast } from "react-toastify";
import deleteApiKey from "@/app/utils/api-keys/deleteApiKey";
import Loader from "@/app/components/Loader";
import { useAppContext } from "@/app/contexts/AppContext";

export default function DeleteConfirmModal() {
  const {
    setApiKeyMetadatas,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    selectedKey,
    setSelectedKey,
  } = useApiKeyContext();

  const [isDeleting, setIsDeleting] = useState(false);
  const { currentOrg, currentProject } = useAppContext();

  const handleClose = () => {
    setIsDeleteConfirmOpen(false);
    setSelectedKey(undefined);
  };

  const handleDelete = async () => {
    if (!isDeleting) {
      try {
        setIsDeleting(true);
        await deleteApiKey({
          orgId: currentOrg?._id.$oid as string,
          projectId: currentProject?._id.$oid as string,
          hashValue: selectedKey?.hashValue as string,
        });
        setIsDeleteConfirmOpen(false);
        setApiKeyMetadatas((prevItems) =>
          prevItems.filter((key) => key.hashValue !== selectedKey?.hashValue)
        );
        toast.success("API key deleted successfully.");
      } catch (error) {
        toast.error("Failed to delete the API key. Please try again.");
      }
      setIsDeleting(false);
    }
  };
  return (
    <Dialog
      open={isDeleteConfirmOpen}
      onClose={handleClose}
      className="relative z-10"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-xl bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="absolute right-0 top-0 pr-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <TrashIcon
                  aria-hidden="true"
                  className="h-6 w-6 text-red-600"
                />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <DialogTitle
                  as="h3"
                  className="text-lg font-semibold leading-6 text-gray-900"
                >
                  Delete API Key
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this API key? This action cannot be undone and the key will immediately become invalid.
                  </p>
                  
                  {selectedKey && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700 mr-2">Name:</span>
                        <span className="text-sm text-gray-900">{selectedKey.name || "Secret key"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex w-full justify-center rounded-full bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto disabled:opacity-75 disabled:cursor-not-allowed transition-colors duration-200"
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
                className="mt-3 inline-flex w-full justify-center rounded-full bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto disabled:opacity-75 disabled:cursor-not-allowed transition-colors duration-200"
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
