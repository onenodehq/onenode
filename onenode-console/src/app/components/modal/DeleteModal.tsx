"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import deleteCollection from "@/app/utils/collections/deleteCollection";
import Loader from "@/app/components/Loader";
import { useAppContext } from "@/app/contexts/AppContext";
import { useCollectionContext } from "@/app/databases/[db_name]/collections/[collection_name]/CollectionContext";
import { usePathname } from "next/navigation";

export default function DeleteModal() {
  const pathname = usePathname();
  const [isDeleting, setIsDeleting] = useState(false);
  const { dbName, collectionName } = useCollectionContext();
  const {
    currentProject,
    currentOrg,
    collectionToDelete,
    setCollectionToDelete,
  } = useAppContext();

  const handleClose = () => {
    setCollectionToDelete(undefined);
  };

  const handleDelete = async () => {
    if (!isDeleting && collectionToDelete) {
      try {
        setIsDeleting(true);
        await deleteCollection({
          orgId: currentOrg?._id.$oid as string,
          projectId: currentProject?._id.$oid as string,
          dbName: collectionToDelete.db_name,
          collectionName: collectionToDelete.name,
        });
        toast.success("Collection deleted successfully.");
        
        // Always navigate to databases page after successful deletion
        window.location.href = `/databases`;
        
        setCollectionToDelete(undefined);
      } catch (error) {
        console.log("error", error);
        toast.error("Failed to delete the collection. Please try again.");
      }
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (collectionToDelete) {
      setIsDeleting(false);
    }
  }, [collectionToDelete]);

  return (
    <Dialog
      open={!!collectionToDelete}
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
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <button
                type="button"
                onClick={() => setCollectionToDelete(undefined)}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon
                  aria-hidden="true"
                  className="h-6 w-6 text-red-600"
                />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <DialogTitle
                  as="h3"
                  className="text-base font-semibold leading-6 text-gray-900"
                >
                  Delete Collection
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete <b>{collectionName}</b>?
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-24"
              >
                {isDeleting ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader color="white" size="small" type="dots" variant="button" />
                  </div>
                ) : (
                  <>Delete</>
                )}
              </button>
              <button
                type="button"
                onClick={() => setCollectionToDelete(undefined)}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-24"
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
