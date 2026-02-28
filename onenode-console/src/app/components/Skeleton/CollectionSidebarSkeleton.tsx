import React from 'react';
import Skeleton, { SkeletonText } from './index';

const CollectionSidebarSkeleton: React.FC = () => {
  return (
    <div className="flex-shrink-0 sticky top-0">
      <div className="bg-white dark:bg-black rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20">
          <Skeleton height="1rem" width="100px" className="mb-1" />
          <Skeleton height="1.25rem" className="mt-2" />
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Search filter section skeleton */}
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <Skeleton height="1.5rem" className="mb-2" />
            <div className="space-y-2">
              <Skeleton height="2rem" />
              <Skeleton height="2rem" />
            </div>
          </div>

          {/* Refresh and API button skeleton */}
          <div className="grid grid-cols-2 gap-2">
            <Skeleton height="2.25rem" borderRadius="0.375rem" />
            <Skeleton height="2.25rem" borderRadius="0.375rem" />
          </div>

          {/* Document count and filter indicator skeleton */}
          <div className="flex justify-between items-center">
            <Skeleton height="1rem" width="100px" />
            <Skeleton height="1.5rem" width="40px" borderRadius="9999px" />
          </div>

          {/* Pagination controls skeleton */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton height="1rem" width="80px" />
              <Skeleton height="1.5rem" width="80px" />
            </div>
            <div className="grid grid-cols-2 gap-1">
              <Skeleton height="2rem" borderRadius="0.375rem" />
              <Skeleton height="2rem" borderRadius="0.375rem" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionSidebarSkeleton; 