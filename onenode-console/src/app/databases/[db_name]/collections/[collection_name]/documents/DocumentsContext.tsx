"use client";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { Document } from "mongodb";

interface DocumentContextType {
  selectedDocuments: Document[];
  setSelectedDocuments: Dispatch<SetStateAction<Document[]>>;
  isDeleteConfirmOpen: boolean;
  setIsDeleteConfirmOpen: Dispatch<SetStateAction<boolean>>;
}

const defaultValue: DocumentContextType = {
  selectedDocuments: [],
  setSelectedDocuments: () => {},
  isDeleteConfirmOpen: false,
  setIsDeleteConfirmOpen: () => {},
};

const DocumentContext = createContext<DocumentContextType>(defaultValue);

interface DocumentProviderProps {
  children: ReactNode;
}

export const DocumentProvider: React.FC<DocumentProviderProps> = ({
  children,
}) => {
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>(
    []
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  return (
    <DocumentContext.Provider
      value={{
        selectedDocuments,
        setSelectedDocuments,
        isDeleteConfirmOpen,
        setIsDeleteConfirmOpen,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

// Custom hook for easier context usage
export const useDocumentContext = (): DocumentContextType => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error(
      "useDocumentContext must be used within a DocumentProvider"
    );
  }
  return context;
};
