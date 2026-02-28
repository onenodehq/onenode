import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import styles from '../styles.module.css';

interface ErrorNotificationProps {
  error: string | null;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className={styles.error}>
      <ExclamationCircleIcon className="w-4 h-4" />
      {error}
    </div>
  );
};

export default ErrorNotification; 