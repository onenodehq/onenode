import React from 'react';
import Skeleton, { SkeletonCard } from './index';

interface DocumentListSkeletonProps {
  count?: number;
}

const DocumentListSkeleton: React.FC<DocumentListSkeletonProps> = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {/* Document list header (if any) */}
      <div className="flex justify-between items-center mb-2">
        <Skeleton height="1.5rem" width="200px" />
        <div className="flex space-x-2">
          <Skeleton height="2rem" width="100px" borderRadius="0.375rem" />
          <Skeleton height="2rem" width="100px" borderRadius="0.375rem" />
        </div>
      </div>

      {/* Document cards */}
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 relative">
          <div className="p-4">
            <Skeleton height="2rem" className="mb-4" />
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Skeleton width="80px" height="1rem" />
                <Skeleton width="120px" height="1rem" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton width="100px" height="1rem" />
                <Skeleton width="150px" height="1rem" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton width="70px" height="1rem" />
                <Skeleton width="180px" height="1rem" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentListSkeleton; 