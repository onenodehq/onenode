import { useAppContext } from "@/app/contexts/AppContext";
import { useApiKeyContext } from "./ApiKeyContext";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function ApiKeyCreateButton() {
  const { setIsCreationModalOpen } = useApiKeyContext();
  const { currentOrg, currentProject } = useAppContext();

  if (!currentOrg || !currentProject) {
    return null;
  }

  return (
    <div className="mt-4 sm:mt-0">
      <button
        type="button"
        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors duration-200"
        onClick={() => {
          setIsCreationModalOpen(true);
        }}
      >
        <PlusIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
        Add API Key
      </button>
    </div>
  );
}
