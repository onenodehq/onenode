"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import MaskedApiKey from "./MaskedApiKey";
import { useApiKeyContext } from "./ApiKeyContext";
import { toast } from "react-toastify";
import createApiKey from "@/app/utils/api-keys/createApiKey";
import { useAppContext } from "@/app/contexts/AppContext";
import { KeyIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function ApiKeyCreationModal() {
  const [keyName, setKeyName] = useState("");
  const [newApiKey, setNewApiKey] = useState<apiKey>();
  const {
    apiKeyMetadatas,
    setApiKeyMetadatas,
    isCreationModalOpen,
    setIsCreationModalOpen,
  } = useApiKeyContext();
  const { currentOrg, currentProject } = useAppContext();

  const onSubmit = async () => {
    try {
      if (!currentProject?._id.$oid) {
        toast.error("Oops, something went wrong. Please try again later.");
      } else {
        const apiKey = await createApiKey({
          orgId: currentOrg?._id.$oid as string,
          keyName: keyName,
          projectId: currentProject?._id.$oid,
        });
        setNewApiKey(apiKey);
        setApiKeyMetadatas([
          ...(apiKeyMetadatas || []),
          { name: apiKey.name, hashValue: apiKey.hashValue },
        ]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Remove selected key after closing modal for better UI transform
    if (isCreationModalOpen) {
      setNewApiKey(undefined);
      setKeyName("");
    }
  }, [isCreationModalOpen]);

  return (
    <Dialog
      open={isCreationModalOpen}
      onClose={setIsCreationModalOpen}
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
            className="relative transform overflow-hidden rounded-xl bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-md sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="absolute right-0 top-0 pr-4 pt-4">
              <button
                type="button"
                onClick={() => setIsCreationModalOpen(false)}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2 mr-3">
                <KeyIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {newApiKey ? "API Key Created" : "Create New API Key"}
              </h2>
            </div>
            
            {newApiKey ? (
              <div className="mt-4">
                <div className="rounded-md bg-yellow-50 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Important security notice</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Please save this secret key somewhere safe and accessible. For security reasons, <strong>you won&apos;t be able to view it again</strong>. If you lose this API key, you&apos;ll need to generate a new one.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key Name
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                    {newApiKey.name || "Secret key"}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key Value
                  </label>
                  <MaskedApiKey apiKey={newApiKey.value} />
                </div>
                
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCreationModalOpen(false)}
                    className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <div className="mb-4">
                  <label htmlFor="api-key-name" className="block text-sm font-medium text-gray-700 mb-1">
                    API Key Name (optional)
                  </label>
                  <input
                    id="api-key-name"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                    placeholder="e.g., Production API Key"
                    type="text"
                    value={keyName}
                    onChange={(event) => {
                      setKeyName(event.target.value);
                    }}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Give your API key a descriptive name to help you identify its purpose later.
                  </p>
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreationModalOpen(false)}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onSubmit}
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create API Key
                  </button>
                </div>
              </div>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
