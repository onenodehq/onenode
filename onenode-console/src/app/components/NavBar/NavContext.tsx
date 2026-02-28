"use client";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface NavContextType {
  isCreationModalOpen: boolean;
  setIsCreationModalOpen: Dispatch<SetStateAction<boolean>>;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: Dispatch<SetStateAction<boolean>>;
  isImportModalOpen: boolean;
  setIsImportModalOpen: Dispatch<SetStateAction<boolean>>;
  newDbName: string;
  setNewDbName: Dispatch<SetStateAction<string>>;
}

const defaultValue: NavContextType = {
  isCreationModalOpen: false,
  setIsCreationModalOpen: () => {},
  isDeleteModalOpen: false,
  setIsDeleteModalOpen: () => {},
  isImportModalOpen: false,
  setIsImportModalOpen: () => {},
  newDbName: "",
  setNewDbName: () => {},
};

const NavContext = createContext<NavContextType>(defaultValue);

interface NavProviderProps {
  children: ReactNode;
}

export const NavProvider: React.FC<NavProviderProps> = ({ children }) => {
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [newDbName, setNewDbName] = useState("");

  return (
    <NavContext.Provider
      value={{
        isCreationModalOpen,
        setIsCreationModalOpen,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        isImportModalOpen,
        setIsImportModalOpen,
        newDbName,
        setNewDbName,
      }}
    >
      {children}
    </NavContext.Provider>
  );
};

// Custom hook for easier context usage
export const useNavContext = (): NavContextType => {
  const context = useContext(NavContext);
  if (!context) {
    throw new Error("useNavContext must be used within a NavProvider");
  }
  return context;
};
