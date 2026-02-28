'use client';
import React, { ReactNode } from 'react';
import TOC from './TOC';

interface DocLayoutProps {
  children: ReactNode;
}

export default function DocLayout({ children }: DocLayoutProps) {
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Main content - takes 4/5 of the space on large screens */}
      <div className="lg:col-span-4">
        <div className="docs-content content-bg px-6 py-5 pt-4 rounded-xl shadow-sm">
            {children}
        </div>
      </div>
      
      {/* TOC - takes 1/5 of the space on large screens */}
      <div className="lg:col-span-1">
        <TOC />
      </div>
    </div>
  );
} 