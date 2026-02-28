import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function RefreshButton() {
  const handleRefresh = () => {
    window.location.reload();
  };
  
  return (
    <button
      className="inline-flex items-center px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-md shadow-sm text-sm font-medium text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      onClick={handleRefresh}
      title="Refresh documents"
    >
      <ArrowPathIcon className="h-4 w-4 mr-1.5" />
      Refresh
    </button>
  );
}
