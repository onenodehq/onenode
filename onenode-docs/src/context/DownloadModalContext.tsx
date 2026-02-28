'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DownloadModalContextType {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const DownloadModalContext = createContext<DownloadModalContextType | undefined>(undefined);

export const useDownloadModal = () => {
  const context = useContext(DownloadModalContext);
  if (context === undefined) {
    throw new Error('useDownloadModal must be used within a DownloadModalProvider');
  }
  return context;
};

interface DownloadModalProviderProps {
  children: ReactNode;
}

export const DownloadModalProvider: React.FC<DownloadModalProviderProps> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <DownloadModalContext.Provider value={{ isModalOpen, openModal, closeModal }}>
      {children}
    </DownloadModalContext.Provider>
  );
}; 