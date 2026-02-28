"use client";

import React, { createContext, useContext } from "react";

// Define the type of the context data
interface MessageContextType {
  user: UserProfile | undefined;
}

// Create the context with initial undefined value
const AuthContext = createContext<MessageContextType | undefined>(undefined);

// Custom hook to use the context
export const useAuthContext = (): MessageContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuthContext must be used within a MessageProvider (Error generated at useAuthContext"
    );
  }
  return context;
};

// Provider component
export function AuthContextProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserProfile | undefined;
}) {
  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}
