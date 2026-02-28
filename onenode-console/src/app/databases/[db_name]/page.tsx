"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppContext } from "@/app/contexts/AppContext";
import PageLoader from "@/app/components/PageLoader";
import { PlusIcon, FolderIcon, ArrowLeftIcon, CircleStackIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useNavContext } from "@/app/components/NavBar/NavContext";
import Link from "next/link";
import { Collection } from "@/app/interface/navigationItem";

export default function DatabasePage() {
  const { currentProject, collections } = useAppContext();
  const { setIsCreationModalOpen, setNewDbName } = useNavContext();
  const router = useRouter();
  const params = useParams();
  const dbName = params.db_name as string;
  
  const [dbCollections, setDbCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (collections.length) {
      // Filter collections by database name
      const filteredCollections = collections.filter(
        (collection) => collection.db_name === dbName
      );
      setDbCollections(filteredCollections);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [collections, dbName]);

  const handleCreateCollection = () => {
    setNewDbName(dbName);
    setIsCreationModalOpen(true);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumb navigation */}
        <nav className="mb-4">
          <Link 
            href="/databases"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors group"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Databases
          </Link>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="p-3 bg-black rounded-lg mr-4">
              <CircleStackIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 mb-1">
                {dbName}
              </h1>
              <p className="text-gray-600 text-sm">
                {dbCollections.length === 0 ? 'No collections found' : `${dbCollections.length} collection${dbCollections.length !== 1 ? 's' : ''} available`}
              </p>
              {currentProject && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Project: {currentProject.name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleCreateCollection}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg shadow-sm hover:bg-gray-800 transition-all duration-300 hover:-translate-y-0.5"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Collection
          </button>
        </div>
        
        {dbCollections.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dbCollections.map((collection) => (
              <Link
                key={collection.name}
                href={`/databases/${dbName}/collections/${collection.name}/documents`}
                className="group block"
              >
                <div className="bg-white rounded-lg border border-gray-200 p-4 transition-all duration-300 hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-black rounded-lg">
                      <FolderIcon className="h-5 w-5 text-white" />
                    </div>
                    <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-black transition-all duration-300 group-hover:translate-x-1" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1 group-hover:text-black transition-colors">
                      {collection.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Click to view documents
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
              <FolderIcon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No collections yet
            </h3>
            <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto">
              Create your first collection in <span className="font-medium">{dbName}</span> to start storing data.
            </p>
            <button
              onClick={handleCreateCollection}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg shadow-sm hover:bg-gray-800 transition-all duration-300 hover:-translate-y-0.5"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create First Collection
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 