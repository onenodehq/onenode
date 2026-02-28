"use client";
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

interface ApiKeyContextType {
  isCreationModalOpen: boolean;
  setIsCreationModalOpen: Dispatch<SetStateAction<boolean>>;
  apiKeyMetadatas: hashedApiKey[];
  setApiKeyMetadatas: Dispatch<SetStateAction<hashedApiKey[]>>;
  isDeleteConfirmOpen: boolean;
  setIsDeleteConfirmOpen: Dispatch<SetStateAction<boolean>>;
  selectedKey: hashedApiKey | undefined;
  setSelectedKey: Dispatch<SetStateAction<hashedApiKey | undefined>>;
}

const defaultValue: ApiKeyContextType = {
  isCreationModalOpen: false,
  setIsCreationModalOpen: () => {},
  apiKeyMetadatas: [],
  setApiKeyMetadatas: () => {},
  isDeleteConfirmOpen: false,
  setIsDeleteConfirmOpen: () => {},
  selectedKey: undefined,
  setSelectedKey: () => {},
};

const ApiKeyContext = createContext<ApiKeyContextType>(defaultValue);

interface ApiKeyProviderProps {
  children: ReactNode;
}

export const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({ children }) => {
  const [apiKeyMetadatas, setApiKeyMetadatas] = useState<hashedApiKey[]>([]);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<hashedApiKey>();

  return (
    <ApiKeyContext.Provider
      value={{
        isCreationModalOpen,
        setIsCreationModalOpen,
        apiKeyMetadatas,
        setApiKeyMetadatas,
        isDeleteConfirmOpen,
        setIsDeleteConfirmOpen,
        selectedKey,
        setSelectedKey,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
};

// Custom hook for easier context usage
export const useApiKeyContext = (): ApiKeyContextType => {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error("useApiKeyContext must be used within a MyProvider");
  }
  return context;
};
