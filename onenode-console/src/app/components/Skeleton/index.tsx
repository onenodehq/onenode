import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
  animation?: 'pulse' | 'shimmer' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  borderRadius = '0.25rem',
  animation = 'pulse'
}) => {
  const animationClass = 
    animation === 'pulse' ? 'animate-pulse' : 
    animation === 'shimmer' ? 'animate-shimmer' : '';

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 ${animationClass} ${className}`}
      style={{
        width,
        height,
        borderRadius
      }}
    />
  );
};

export interface SkeletonTextProps extends SkeletonProps {
  lines?: number;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 1,
  className = '',
  width = '100%',
  height = '0.75rem',
  borderRadius = '0.25rem',
  animation = 'pulse'
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={className}
          width={typeof width === 'string' ? width : (index === lines - 1 && lines > 1 ? '80%' : width)}
          height={height}
          borderRadius={borderRadius}
          animation={animation}
        />
      ))}
    </div>
  );
};

export interface SkeletonCardProps {
  className?: string;
  headerHeight?: string;
  contentLines?: number;
  footerHeight?: string;
  animation?: 'pulse' | 'shimmer' | 'none';
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  headerHeight = '2.5rem',
  contentLines = 3,
  footerHeight = '2rem',
  animation = 'pulse'
}) => {
  return (
    <div className={`flex flex-col space-y-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm ${className}`}>
      {/* Header */}
      <Skeleton 
        height={headerHeight}
        animation={animation}
      />
      
      {/* Content */}
      <SkeletonText 
        lines={contentLines}
        animation={animation}
      />
      
      {/* Footer */}
      {footerHeight && (
        <Skeleton 
          height={footerHeight}
          animation={animation}
        />
      )}
    </div>
  );
};

export default Skeleton; 