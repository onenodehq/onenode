import { useState } from 'react';
import { parseValue, updateNestedValue, addArrayItem as addArrayItemHelper } from  "../helper";

interface UseFieldOperationsProps {
  data: any;
  isObject: boolean;
  isArray: boolean;
  onChange?: (newValue: any) => void;
  onParentUpdate?: (newValue: any) => void;
  parentData?: any;
}

export interface FieldOperations {
  data: any;
  newFieldName: string;
  newFieldValue: string;
  showAddField: boolean;
  showAddFieldBetween: string | null;
  error: string | null;
  setNewFieldName: (value: string) => void;
  setNewFieldValue: (value: string) => void;
  setShowAddField: (show: boolean) => void;
  addField: () => void;
  handleAddArrayItem: () => void;
  handleRemoveField: (key: string | number) => void;
  handleUpdateNestedValue: (key: string | number, value: any) => void;
  handleAddFieldBetween: (key: string) => void;
  handleInsertField: (key: string, newFieldName: string, newFieldValue: any) => void;
  setError: (error: string | null) => void;
  onChange?: (newValue: any) => void;
}

export const useFieldOperations = ({
  data,
  isObject,
  isArray,
  onChange,
  onParentUpdate,
  parentData,
}: UseFieldOperationsProps): FieldOperations => {
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [showAddField, setShowAddField] = useState(false);
  const [showAddFieldBetween, setShowAddFieldBetween] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addField = () => {
    if (!isObject || !onChange || !newFieldName.trim()) {
      setError('Please provide a valid field name');
      return;
    }
    
    if (Object.prototype.hasOwnProperty.call(data, newFieldName)) {
      setError('Field already exists');
      return;
    }
    
    try {
      const newData = { ...data };
      newData[newFieldName] = parseValue(newFieldValue, typeof newFieldValue);
      onChange(newData);
      setNewFieldName('');
      setNewFieldValue('');
      setShowAddField(false);
      setError(null);
    } catch (e) {
      setError('Failed to add field');
    }
  };

  const handleAddArrayItem = () => {
    if (!isArray || !onChange) return;
    
    try {
      const parsedValue = parseValue(newFieldValue, typeof newFieldValue);
      const newData = addArrayItemHelper(data, parsedValue);
      onChange(newData);
      setNewFieldValue('');
      setShowAddField(false);
      setError(null);
    } catch (e) {
      setError('Invalid value format');
    }
  };

  const handleRemoveField = (key: string | number) => {
    if (!onParentUpdate || !parentData) return;
    
    const newParentData = { ...parentData };
    if (Array.isArray(newParentData)) {
      newParentData.splice(Number(key), 1);
    } else {
      delete newParentData[key];
    }
    onParentUpdate(newParentData);
  };

  const handleUpdateNestedValue = (key: string | number, value: any) => {
    if (!onChange) return;
    const newData = updateNestedValue(data, key, value);
    onChange(newData);
  };
  
  const handleAddFieldBetween = (key: string) => {
    setShowAddFieldBetween(key);
    setNewFieldName('');
    setNewFieldValue('');
  };

  const handleInsertField = (key: string, newFieldName: string, newFieldValue: any) => {
    if (!onChange || (isObject && !newFieldName.trim())) {
      setError('Please provide a valid field name');
      return;
    }

    if (isObject && Object.prototype.hasOwnProperty.call(data, newFieldName)) {
      setError('Field already exists');
      return;
    }

    try {
      if (isArray) {
        // For arrays, insert at the specified index
        const newData = [...data];
        newData.splice(parseInt(key) + 1, 0, parseValue(newFieldValue, typeof newFieldValue));
        onChange(newData);
      } else {
        // For objects, maintain order by reconstructing with entries
        const newData = { ...data };
        const entries = Object.entries(newData);
        const newEntries = [];
        let inserted = false;
        
        for (const [k, v] of entries) {
          newEntries.push([k, v]);
          if (k === key) {
            newEntries.push([newFieldName, parseValue(newFieldValue, typeof newFieldValue)]);
            inserted = true;
          }
        }

        if (!inserted) {
          newEntries.push([newFieldName, parseValue(newFieldValue, typeof newFieldValue)]);
        }

        onChange(Object.fromEntries(newEntries));
      }
      
      setShowAddFieldBetween(null);
      setError(null);
    } catch (e) {
      setError('Failed to add field');
    }
  };

  return {
    data,
    newFieldName,
    newFieldValue,
    showAddField,
    showAddFieldBetween,
    error,
    setNewFieldName,
    setNewFieldValue,
    setShowAddField,
    addField,
    handleAddArrayItem,
    handleRemoveField,
    handleUpdateNestedValue,
    handleAddFieldBetween,
    handleInsertField,
    setError,
    onChange,
  };
}; 