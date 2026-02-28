'use client';
import { ReactNode } from 'react';
import CopyPageButton from './CopyPageButton';

interface PageTitleProps {
  children: ReactNode;
  className?: string;
}

export default function PageTitle({ children, className = '' }: PageTitleProps) {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <h1 className="text-3xl font-bold text-red-500 m-0">{children}</h1>
      <CopyPageButton />
    </div>
  );
} 