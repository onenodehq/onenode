"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../contexts/AppContext";
import PageLoader from "../components/PageLoader";
import { PlusIcon, ServerIcon, ArrowRightIcon, CircleStackIcon, EllipsisVerticalIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useNavContext } from "../components/NavBar/NavContext";
import Link from "next/link";

interface Database {
  name: string;
  collections: any[];
}

export default function DatabasesPage() {
  const { collections } = useAppContext();
  const { setIsCreationModalOpen, setNewDbName } = useNavContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [databases, setDatabases] = useState<Database[]>([]);

  useEffect(() => {
    if (collections.length) {
      let dbMap: { [key: string]: Database } = {};

      collections.forEach((collection) => {
        let dbName = collection.db_name;
        if (!dbMap[dbName]) {
          dbMap[dbName] = { name: dbName, collections: [] };
        }
        dbMap[dbName].collections.push(collection);
      });

      // Convert the map to an array
      const databases = Object.values(dbMap);
      setDatabases(databases);
      setIsLoading(false);
    } else {
      // If no collections are found after a short delay, show empty state
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [collections]);

  const handleCreateCollection = (dbName: string) => {
    setNewDbName(dbName);
    setIsCreationModalOpen(true);
  };

  const handleCreateFirstDatabase = () => {
    setNewDbName("");
    setIsCreationModalOpen(true);
  };

  const handleDeleteDatabase = (dbName: string) => {
    // TODO: Implement database deletion logic
    console.log("Delete database:", dbName);
  };

  const handleRowClick = (dbName: string) => {
    router.push(`/databases/${dbName}`);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-black rounded-lg">
                <CircleStackIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Databases
                </h1>
                <p className="text-slate-600 text-xs mt-0.5">
                  {databases.length === 0 ? 'No databases found' : `${databases.length} database${databases.length !== 1 ? 's' : ''} available`}
                </p>
              </div>
            </div>
            {databases.length > 0 && (
              <button
                onClick={handleCreateFirstDatabase}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg shadow-sm hover:bg-gray-800 transition-all duration-300 hover:-translate-y-0.5"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Database
              </button>
            )}
          </div>
        </div>
        
        {databases.length > 0 ? (
          <div className="bg-white shadow-sm rounded-xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Your Databases</h2>
            </div>
            <div className="overflow-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-6 pr-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Database
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Collections
                    </th>
                    <th 
                      scope="col" 
                      className="relative py-3.5 pl-3 pr-6"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {databases.map((database) => (
                    <tr 
                      key={database.name} 
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                      onClick={() => handleRowClick(database.name)}
                    >
                      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <span className="hover:text-black transition-colors font-medium">
                            {database.name}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {database.collections.length} collection{database.collections.length !== 1 ? 's' : ''}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                        <Menu as="div" className="relative inline-block text-left">
                          <MenuButton 
                            className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 transition-colors duration-150"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="sr-only">Open options</span>
                            <EllipsisVerticalIcon className="h-5 w-5" />
                          </MenuButton>
                          <MenuItems
                            transition
                            className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                          >
                            <div className="py-1">
                              <MenuItem>
                                {({ focus }) => (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteDatabase(database.name);
                                    }}
                                    className={`${
                                      focus ? 'bg-red-50 text-red-900' : 'text-red-700'
                                    } group flex w-full items-center px-4 py-2 text-sm transition-colors duration-150`}
                                  >
                                    <TrashIcon className="mr-3 h-4 w-4" />
                                    Delete
                                  </button>
                                )}
                              </MenuItem>
                            </div>
                          </MenuItems>
                        </Menu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 mb-4">
              <CircleStackIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No Databases</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              You haven&apos;t created any databases yet. Click the &quot;Create Your First Database&quot; button to get started.
            </p>
            <button
              onClick={handleCreateFirstDatabase}
              className="mt-6 inline-flex items-center px-6 py-3 text-base font-medium text-white bg-black rounded-lg shadow-sm hover:bg-gray-800 transition-all duration-300 hover:-translate-y-0.5"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Your First Database
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 