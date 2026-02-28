"use client";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { Document } from "mongodb";
import getOrgs from "../utils/org/getOrgs";
import { useAuthContext } from "./AuthContext";
import createDefaultOrg from "../utils/org/createDefaultOrg";
import { Collection } from "../interface/navigationItem";

interface AppContextType {
  orgs: Document[] | undefined;
  setOrgs: Dispatch<SetStateAction<Document[] | undefined>>;
  currentOrg: Document | undefined;
  setCurrentOrg: Dispatch<SetStateAction<Document | undefined>>;
  currentProject: Document | undefined;
  setCurrentProject: Dispatch<SetStateAction<Document | undefined>>;
  collections: Collection[];
  setCollections: Dispatch<SetStateAction<Collection[]>>;
  reloadOrgs: boolean;
  setReloadOrgs: Dispatch<SetStateAction<boolean>>;
  collectionToDelete: Collection | undefined;
  setCollectionToDelete: Dispatch<SetStateAction<Collection | undefined>>;
}

const defaultValue: AppContextType = {
  orgs: [],
  setOrgs: () => {},
  currentOrg: {},
  setCurrentOrg: () => {},
  currentProject: {},
  setCurrentProject: () => {},
  collections: [],
  setCollections: () => {},
  reloadOrgs: false,
  setReloadOrgs: () => {},
  collectionToDelete: undefined,
  setCollectionToDelete: () => {},
};

const AppContext = createContext<AppContextType>(defaultValue);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { user } = useAuthContext();

  const [reloadOrgs, setReloadOrgs] = useState(false);
  const [orgs, setOrgs] = useState<Document[]>();
  const [currentOrg, setCurrentOrg] = useState<Document>();
  const [currentProject, setCurrentProject] = useState<Document>();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionToDelete, setCollectionToDelete] = useState<
    Collection | undefined
  >();

  useEffect(() => {
    const asyncFunc = async () => {
      let orgs = await getOrgs();
      if (!orgs.length) {
        await createDefaultOrg();
        orgs = await getOrgs();
      }

      setOrgs(orgs);
      const defaultOrg = orgs[0];
      setCurrentOrg(defaultOrg);

      const defaultProject = defaultOrg.projects[0];
      setCurrentProject(defaultProject);
    };

    if (user) asyncFunc();
  }, [user]);

  useEffect(() => {
    if (currentProject) {
      const collections = currentProject.collections;
      setCollections(collections);
    }
  }, [currentProject]);

  useEffect(() => {
    const asyncFunc = async () => {
      let orgs = await getOrgs();
      if (!orgs.length) {
        await createDefaultOrg();
        orgs = await getOrgs();
      }

      setOrgs(orgs);
      if (!orgs.some((org) => org == currentOrg)) {
        setCurrentOrg(orgs[0]);
        setCurrentProject(orgs[0].projects[0]);
      }
    };

    if (reloadOrgs && user) {
      setReloadOrgs(false);
      asyncFunc();
    }
  }, [reloadOrgs, user, currentOrg]);

  return (
    <AppContext.Provider
      value={{
        orgs,
        setOrgs,
        currentOrg,
        setCurrentOrg,
        currentProject,
        setCurrentProject,
        collections,
        setCollections,
        reloadOrgs,
        setReloadOrgs,
        collectionToDelete,
        setCollectionToDelete,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for easier context usage
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within a MyProvider");
  }
  return context;
};
