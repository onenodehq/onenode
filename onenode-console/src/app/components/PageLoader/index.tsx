import React from 'react';
import Loader from '../Loader';

/**
 * PageLoader Component
 * 
 * A full-page loading component that provides a consistent loading experience across the app.
 * Use this for initial page loads or when the entire page content is loading.
 * 
 * For component-specific loading (modals, buttons, etc.), use the regular Loader component instead.
 * For list loading states, prefer skeleton loaders over PageLoader.
 * 
 * @param size - Size of the loader (default: 'large')
 * @param type - Type of animation (default: 'dots')
 * @param showBackground - Whether to show the background styling (default: true)
 */
interface PageLoaderProps {
  size?: 'small' | 'medium' | 'large';
  type?: 'dots' | 'pulse' | 'bounce' | 'spinner';
  showBackground?: boolean;
}

export default function PageLoader({ 
  size = 'large',
  type = 'dots',
  showBackground = true
}: PageLoaderProps) {
  const backgroundClass = showBackground 
    ? "min-h-screen bg-slate-50/50 dark:bg-gray-950" 
    : "min-h-screen";

  return (
    <div className={`${backgroundClass} flex items-center justify-center`}>
      <div className="flex flex-col items-center justify-center">
        <Loader 
          color="#000000" 
          size={size} 
          type={type} 
        />
      </div>
    </div>
  );
} 