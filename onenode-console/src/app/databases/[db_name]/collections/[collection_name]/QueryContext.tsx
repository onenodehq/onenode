"use client";
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface QueryContextType {
  queryText: string;
  setQueryText: (text: string) => void;
  isQueryMode: boolean;
  setIsQueryMode: (mode: boolean) => void;
  clearQuery: () => void;
}

const QueryContext = createContext<QueryContextType | null>(null);

export function useQueryContext(): QueryContextType {
  const context = useContext(QueryContext);
  if (context === null) {
    throw new Error('useQueryContext must be used within a QueryProvider');
  }
  return context;
}

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps): JSX.Element {
  const [queryText, setQueryText] = useState<string>('');
  const [isQueryMode, setIsQueryMode] = useState<boolean>(false);

  const clearQuery = useCallback(() => {
    setQueryText('');
    setIsQueryMode(false);
  }, []);

  const value: QueryContextType = {
    queryText,
    setQueryText,
    isQueryMode,
    setIsQueryMode,
    clearQuery
  };

  return (
    <QueryContext.Provider value={value}>
      {children}
    </QueryContext.Provider>
  );
} 