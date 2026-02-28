import { useEffect } from "react";
import { useApiKeyContext } from "./ApiKeyContext";
import getHashedApiKeys from "@/app/utils/api-keys/getHashedApiKeys";
import { useAppContext } from "@/app/contexts/AppContext";
import { TrashIcon, KeyIcon } from "@heroicons/react/24/outline";

export default function ApiKeyTable() {
  const {
    apiKeyMetadatas,
    setApiKeyMetadatas,
    setIsDeleteConfirmOpen,
    setSelectedKey,
  } = useApiKeyContext();
  const { currentOrg, currentProject } = useAppContext();

  useEffect(() => {
    const func = async () => {
      const apiKeyMetadatas = await getHashedApiKeys({
        orgId: currentOrg?._id.$oid as string,
        projectId: currentProject?._id.$oid as string,
      });
      setApiKeyMetadatas(apiKeyMetadatas);
    };
    func();
  }, [currentOrg?._id.$oid, currentProject?._id.$oid, setApiKeyMetadatas]);
  
  if (!apiKeyMetadatas || apiKeyMetadatas.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 mb-4">
          <KeyIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No API Keys</h3>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          You haven&apos;t created any API keys yet. Click the &quot;Add API Key&quot; button to create your first key.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Your API Keys</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-6 pr-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Value
              </th>
              <th 
                scope="col" 
                className="relative py-3.5 pl-3 pr-6 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {apiKeyMetadatas?.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                  <div className="flex items-center">
                    <KeyIcon className="h-4 w-4 text-gray-400 mr-2" />
                    {item.name || "Secret key"}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono">
                  ••••••••••••••••••••••••••••••
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                  <button
                    className="inline-flex items-center text-sm text-red-600 hover:text-red-900 transition-colors duration-150"
                    onClick={() => {
                      setIsDeleteConfirmOpen(true);
                      setSelectedKey(item);
                    }}
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                    <span className="sr-only">, {item.name}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
