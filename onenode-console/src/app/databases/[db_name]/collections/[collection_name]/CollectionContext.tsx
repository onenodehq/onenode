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
import { PaginationMetadata } from "@/app/utils/document/getDocuments";

interface CollectionContextType {
  documents: Document[];
  setDocuments: Dispatch<SetStateAction<Document[]>>;
  editedDocuments: Document[];
  setEditedDocuments: Dispatch<SetStateAction<Document[]>>;
  isEdited: boolean;
  setIsEdited: Dispatch<SetStateAction<boolean>>;
  paginationInfo: PaginationMetadata | null;
  setPaginationInfo: Dispatch<SetStateAction<PaginationMetadata | null>>;
  dbName: string;
  collectionName: string;
  activeFilter: Record<string, any>;
  setActiveFilter: Dispatch<SetStateAction<Record<string, any>>>;
  isFilterActive: boolean;
  setIsFilterActive: Dispatch<SetStateAction<boolean>>;
  activeSort: Array<[string, number]>;
  setActiveSort: Dispatch<SetStateAction<Array<[string, number]>>>;
  isSortActive: boolean;
  setIsSortActive: Dispatch<SetStateAction<boolean>>;
}

const defaultValue: CollectionContextType = {
  documents: [],
  setDocuments: () => {},
  editedDocuments: [],
  setEditedDocuments: () => {},
  isEdited: false,
  setIsEdited: () => {},
  paginationInfo: null,
  setPaginationInfo: () => {},
  dbName: "",
  collectionName: "",
  activeFilter: {},
  setActiveFilter: () => {},
  isFilterActive: false,
  setIsFilterActive: () => {},
  activeSort: [],
  setActiveSort: () => {},
  isSortActive: false,
  setIsSortActive: () => {},
};

const CollectionContext = createContext<CollectionContextType>(defaultValue);

interface CollectionProviderProps {
  children: ReactNode;
  dbName: string;
  collectionName: string;
}

export const CollectionProvider: React.FC<CollectionProviderProps> = ({
  children,
  dbName,
  collectionName,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [editedDocuments, setEditedDocuments] = useState<Document[]>([]);
  const [isEdited, setIsEdited] = useState(false);
  const [paginationInfo, setPaginationInfo] = useState<PaginationMetadata | null>(null);
  const [activeFilter, setActiveFilter] = useState<Record<string, any>>({});
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [activeSort, setActiveSort] = useState<Array<[string, number]>>([]);
  const [isSortActive, setIsSortActive] = useState(false);

  return (
    <CollectionContext.Provider
      value={{
        documents,
        setDocuments,
        editedDocuments,
        setEditedDocuments,
        isEdited,
        setIsEdited,
        paginationInfo,
        setPaginationInfo,
        dbName,
        collectionName,
        activeFilter,
        setActiveFilter,
        isFilterActive,
        setIsFilterActive,
        activeSort,
        setActiveSort,
        isSortActive,
        setIsSortActive,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
};

// Custom hook for easier context usage
export const useCollectionContext = (): CollectionContextType => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error(
      "useCollectionContext must be used within a CollectionProvider"
    );
  }
  return context;
};
