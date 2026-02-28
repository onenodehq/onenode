import React from 'react';
import styles from './Loader.module.css';

interface LoaderProps {
  color?: string;
  size?: 'small' | 'medium' | 'large';
  type?: 'dots' | 'pulse' | 'bounce' | 'spinner';
  text?: string;
  variant?: 'default' | 'button';
}

export default function Loader({ 
  color = '#3B82F6', 
  size = 'medium',
  type = 'dots',
  text,
  variant = 'default'
}: LoaderProps) {
  // Size classes
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };
  
  // Text size classes
  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };
  
  // Render different loader types
  const renderLoader = () => {
    // For button variant, always use dots with smaller size
    if (variant === 'button' && type === 'dots') {
      return (
        <div className={styles.loaderButton}>
          <div style={{ background: color }} className={`${styles.loaderButtonDot} ${styles.first}`}></div>
          <div style={{ background: color }} className={`${styles.loaderButtonDot} ${styles.second}`}></div>
          <div style={{ background: color }} className={`${styles.loaderButtonDot}`}></div>
        </div>
      );
    }
    
    switch (type) {
      case 'dots':
        return (
          <div className={styles.loader}>
            <div style={{ background: color }} className={`${styles.loaderBounce} ${styles.first}`}></div>
            <div style={{ background: color }} className={`${styles.loaderBounce} ${styles.second}`}></div>
            <div style={{ background: color }} className={`${styles.loaderBounce}`}></div>
          </div>
        );
        
      case 'bounce':
        return (
          <div className={styles.loader}>
            <div style={{ background: color }} className={`${styles.loaderBounce} ${styles.first}`}></div>
            <div style={{ background: color }} className={`${styles.loaderBounce} ${styles.second}`}></div>
            <div style={{ background: color }} className={`${styles.loaderBounce}`}></div>
          </div>
        );
        
      case 'spinner':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-transparent" style={{ borderTopColor: color, borderBottomColor: color }}></div>
            <div className="absolute inset-0 rounded-full border-l-2 border-r-2 border-transparent animate-spin" style={{ borderLeftColor: color, borderRightColor: color }}></div>
          </div>
        );
        
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div 
              className="absolute inset-0 rounded-full animate-ping opacity-75" 
              style={{ backgroundColor: color }}
            ></div>
            <div 
              className="relative rounded-full h-full w-full" 
              style={{ backgroundColor: color }}
            ></div>
          </div>
        );
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      {renderLoader()}
      {text && variant !== 'button' && (
        <p className={`mt-4 text-gray-600 dark:text-gray-300 font-medium ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
}