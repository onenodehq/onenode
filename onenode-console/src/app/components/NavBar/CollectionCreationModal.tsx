import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import toastOops from "@/app/utils/tost/toastOops";
import Loader from "@/app/components/Loader";
import { useAppContext } from "@/app/contexts/AppContext";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import createCollection from "@/app/utils/collections/createCollection";
import { useNavContext } from "@/app/components/NavBar/NavContext";

export default function CollectionCreationModal() {
  const [newCollectionName, setNewCollectionName] = useState("");
  const {
    isCreationModalOpen,
    setIsCreationModalOpen,
    newDbName,
    setNewDbName,
  } = useNavContext();
  const { currentOrg, currentProject, collections, setReloadOrgs } =
    useAppContext();
  const [nameExists, setNameExists] = useState(false);
  const [isSavingCollection, setIsSavingCollection] = useState(false);
  const [showDatabaseTooltip, setShowDatabaseTooltip] = useState(false);
  const [showCollectionTooltip, setShowCollectionTooltip] = useState(false);

  const onSubmit = async () => {
    if (!isSavingCollection && canSubmit) {
      try {
        setIsSavingCollection(true);
        await createCollection({
          orgId: currentOrg?._id.$oid as string,
          projectId: currentProject?._id.$oid as string,
          dbName: newDbName,
          collectionName: newCollectionName,
        });
        setIsCreationModalOpen(false);
        setIsSavingCollection(false);
        setReloadOrgs(true);
      } catch (error) {
        toastOops();
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSubmit();
    }
  };

  const canSubmit = newDbName.trim() !== '' && newCollectionName.trim() !== '' && !nameExists;

  const checkName = useCallback(() => {
    let exists = false; // Assume name does not exist by default
    for (let collection of collections) {
      if (
        collection.db_name === newDbName &&
        collection.name === newCollectionName
      ) {
        exists = true;
        break; // Exit the loop if name collision is found
      }
    }
    setNameExists(exists); // Set the flag based on the result
  }, [collections, newDbName, newCollectionName]);

  useEffect(() => {
    checkName();
  }, [checkName]);

  useEffect(() => {
    if (isCreationModalOpen) {
      setNewCollectionName("");
      // Reset tooltip states when modal opens
      setShowDatabaseTooltip(false);
      setShowCollectionTooltip(false);
    }
  }, [isCreationModalOpen]);

  // Close tooltips when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-tooltip="database"]') && !target.closest('[data-tooltip="collection"]')) {
        setShowDatabaseTooltip(false);
        setShowCollectionTooltip(false);
      }
    };

    if (showDatabaseTooltip || showCollectionTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDatabaseTooltip, showCollectionTooltip]);

  return (
    <Dialog
      open={isCreationModalOpen}
      onClose={setIsCreationModalOpen}
      className="relative"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-visible rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-md sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <h1 className="font-bold">Create collection</h1>
            <div className="my-2">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-semibold text-sm">Database Name:</label>
                <div className="relative" data-tooltip="database">
                  <QuestionMarkCircleIcon
                    className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={() => setShowDatabaseTooltip(!showDatabaseTooltip)}
                  />
                  {showDatabaseTooltip && (
                    <div className="absolute z-10 w-64 p-3 text-xs bg-gray-900 text-white rounded-lg shadow-lg -top-2 left-6">
                      <div className="absolute -left-1 top-2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      <p className="font-medium mb-1">What is a Database?</p>
                      <p>A database is a container that organizes your collections. Think of it as a project or workspace that groups related collections together. For example, you might have an &quot;ecommerce&quot; database containing &quot;products&quot;, &quot;users&quot;, and &quot;orders&quot; collections.</p>
                    </div>
                  )}
                </div>
              </div>
              <input
                className="rounded-lg text-sm w-full h-8"
                placeholder="Database name"
                required
                type="text"
                value={newDbName}
                onChange={(event) => {
                  const value = event.target.value.replace(
                    /[^a-zA-Z0-9_]/g,
                    ""
                  );
                  setNewDbName(value);
                }}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="my-2">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-semibold text-sm">Collection Name:</label>
                <div className="relative" data-tooltip="collection">
                  <QuestionMarkCircleIcon
                    className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={() => setShowCollectionTooltip(!showCollectionTooltip)}
                  />
                  {showCollectionTooltip && (
                    <div className="absolute z-10 w-64 p-3 text-xs bg-gray-900 text-white rounded-lg shadow-lg -top-2 left-6">
                      <div className="absolute -left-1 top-2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      <p className="font-medium mb-1">What is a Collection?</p>
                      <p>A collection is where your actual data lives. It&apos;s like a table that stores documents (records) of similar type. For example, a &quot;products&quot; collection would contain individual product documents, each with properties like name, price, description, etc.</p>
                    </div>
                  )}
                </div>
              </div>
              <input
                className="rounded-lg text-sm w-full h-8"
                placeholder="Collection name"
                required
                type="text"
                value={newCollectionName}
                onChange={(event) => {
                  const value = event.target.value.replace(
                    /[^a-zA-Z0-9_]/g,
                    ""
                  );
                  setNewCollectionName(value);
                }}
                onKeyDown={handleKeyDown}
              />
            </div>
            {nameExists ? (
              <p className="text-red-500 text-sm font-bold flex items-center">
                <span className="w-4 mx-2 inline-block">
                  <ExclamationCircleIcon />
                </span>
                Collection name already exists.
              </p>
            ) : (
              <></>
            )}
            <div className="mt-6 flex justify-end gap-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreationModalOpen(false);
                }}
                className="flex w-14 h-7 justify-center items-center rounded-full bg-gray-600 text-xs font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
              >
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit || isSavingCollection}
                className={`flex w-14 h-7 justify-center items-center rounded-full text-xs font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors ${
                  canSubmit && !isSavingCollection
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSavingCollection ? (
                  <div className="w-full h-5 flex items-center justify-center">
                    <Loader color="white" type="dots" variant="button" />
                  </div>
                ) : (
                  <span>Create</span>
                )}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
