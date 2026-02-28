import React, { createContext, useContext, ReactNode } from 'react';
import { FieldOperations } from '../hooks/useFieldOperations';
import { ValueEditing } from '../hooks/useValueEditing';

interface JsonFormContextType {
  readOnly: boolean;
  fieldOperations: FieldOperations;
  valueEditing?: ValueEditing;
  path: (string | number)[];
  handleKeyPress: (e: React.KeyboardEvent) => void;
}

const JsonFormContext = createContext<JsonFormContextType | undefined>(undefined);

export const JsonFormProvider: React.FC<{
  children: ReactNode;
  value: JsonFormContextType;
}> = ({ children, value }) => {
  return (
    <JsonFormContext.Provider value={value}>
      {children}
    </JsonFormContext.Provider>
  );
};

export const useJsonForm = (): JsonFormContextType => {
  const context = useContext(JsonFormContext);
  if (context === undefined) {
    throw new Error('useJsonForm must be used within a JsonFormProvider');
  }
  return context;
}; 