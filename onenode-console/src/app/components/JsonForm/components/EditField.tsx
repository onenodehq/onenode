import React, { useState, useRef, useEffect } from "react";
import styles from "../styles.module.css";
import { useJsonForm } from "../context/JsonFormContext";
import { DataType } from "../hooks/useValueEditing";
import { parseValue } from "../helper";

// Import new sub-components
import BooleanInput from "./EditFieldComponents/BooleanInput";
import EmbTextInput from "./EditFieldComponents/EmbTextInput";
import EmbImageInput from "./EditFieldComponents/EmbImageInput";
import DefaultInput from "./EditFieldComponents/DefaultInput";
import NullDisplay from "./EditFieldComponents/NullDisplay";
import ActionButtons from "./EditFieldComponents/ActionButtons";
import TypeSelector from "./EditFieldComponents/TypeSelector";
import FieldNameInput from "./EditFieldComponents/FieldNameInput";

interface EditFieldProps {
  isObject: boolean;
  newFieldName: string;
  newFieldValue: string;
  onFieldNameChange: (value: string) => void;
  onFieldValueChange: (value: string) => void;
  onAdd: () => void;
  // For inline editing
  isInlineEditing?: boolean;
  dataType?: string;
  initialValue?: any;
  initialFieldName?: string;
  onSave?: (value: any, fieldName?: string) => void;
  onCancel?: () => void;
}

// Helper to get initial input value string based on type
const getInitialInputValue = (type: DataType, value: any): string => {
  if (value === null) return "null";
  switch (type) {
    case 'string':
      return String(value);
    case 'number':
    case 'boolean':
      return String(value);
    case 'object':
    case 'array':
      try {
        return JSON.stringify(value, null, 2); // Pretty print for editing
      } catch {
        return "{}"; // Fallback
      }
    case 'Text':
    case 'Image':
       try {
         // Store complex initial value for child components
         return JSON.stringify(value);
       } catch {
          return "";
       }
    case 'null':
      return "null";
    default:
      return String(value);
  }
};

const EditField: React.FC<EditFieldProps> = ({
  isObject,
  newFieldName,
  newFieldValue,
  onFieldNameChange,
  onFieldValueChange,
  onAdd,
  // Inline editing props
  isInlineEditing = false,
  dataType = "string",
  initialValue = "",
  initialFieldName = "",
  onSave,
  onCancel,
}) => {
  const { fieldOperations } = useJsonForm();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Main state for the EditField
  const [selectedType, setSelectedType] = useState<DataType>(dataType as DataType);
  const [fieldName, setFieldName] = useState<string>(isInlineEditing ? initialFieldName : newFieldName);
  const [inputValue, setInputValue] = useState<string>(
    isInlineEditing 
      ? getInitialInputValue(selectedType, initialValue)
      : newFieldValue
  );

  // Temporary state to hold complex object values from Text/Image components
  const [embTextState, setEmbTextState] = useState<any>(null);
  const [embImageState, setEmbImageState] = useState<any>(null);

  // Focus the input when entering edit mode or changing type to a text-based input
  useEffect(() => {
    if (inputRef.current && (
        selectedType === 'string' || 
        selectedType === 'number' || 
        selectedType === 'object' || 
        selectedType === 'array'
    )) {
      inputRef.current.focus();
    }
  }, [selectedType]); // Rerun on type change

  // Update internal state when props change (for add mode)
  useEffect(() => {
    if (!isInlineEditing) {
      setInputValue(newFieldValue);
    }
  }, [newFieldValue, isInlineEditing]);

  useEffect(() => {
    if (!isInlineEditing) {
      setFieldName(newFieldName);
    }
  }, [newFieldName, isInlineEditing]);

  // Handlers passed down or used directly
  const handleInputValueChange = (value: string) => {
    setInputValue(value);
    if (!isInlineEditing) {
      onFieldValueChange(value);
    }
  };

  const handleFieldNameChange = (value: string) => {
    setFieldName(value);
    if (!isInlineEditing) {
      onFieldNameChange(value);
    }
  };

  const handleTypeChange = (type: DataType) => {
    setSelectedType(type);
    
    let resetValue = "";
    
    if (type === 'string') {
      resetValue = "";
    } else if (type === 'number') {
      resetValue = '0';
    } else if (type === 'boolean') {
      resetValue = 'true';
    } else if (type === 'null') {
      resetValue = 'null';
    } else if (type === 'object') {
      resetValue = '{}'; 
    } else if (type === 'array') {
      resetValue = '[]';
    } else if (type === 'Text') {
        // Reset temp state, child will initialize itself
        setEmbTextState(null);
        resetValue = JSON.stringify({
             'xText': { 
               text: "", 
               index: true, 
               chunks: [], 
               emb_model: "text-embedding-3-small", 
               max_chunk_size: 1000, 
               chunk_overlap: 200,
               is_separator_regex: false,
               separators: null,
               keep_separator: false
             }
        });
    } else if (type === 'Image') {
        // Reset temp state, child will initialize itself
        setEmbImageState(null);
        resetValue = JSON.stringify({
             'xImage': { 
               data: null, 
               mime_type: "image/png", 
               index: true, 
               chunks: [], 
               url: null, 
               emb_model: "text-embedding-3-small", 
               vision_model: "gpt-4o-mini", 
               max_chunk_size: 1000, 
               chunk_overlap: 200,
               is_separator_regex: false,
               separators: null,
               keep_separator: false
             }
        });
    }
    setInputValue(resetValue);
    if (!isInlineEditing) {
      onFieldValueChange(resetValue);
    }
  };

  // Specific handlers for complex types to update temporary state
  const handleEmbTextComponentChange = (newState: any) => {
    setEmbTextState(newState);
  };

  const handleEmbImageComponentChange = (newState: any) => {
    // newState contains { data: File | null, ... other fields ... }
    setEmbImageState(newState);
  };

  // Save changes
  const handleSave = async () => {
    try {
      let valueToSave: any;

      switch (selectedType) {
        case 'string':
          valueToSave = inputValue;
          break;
        case 'number':
          if (isNaN(Number(inputValue))) throw new Error('Invalid number format');
          valueToSave = Number(inputValue);
          break;
        case 'boolean':
          valueToSave = inputValue.toLowerCase() === 'true';
          break;
        case 'null':
          valueToSave = null;
          break;
        case 'object':
        case 'array':
          try {
            valueToSave = JSON.parse(inputValue);
            const actualType = Array.isArray(valueToSave) ? 'array' : 'object';
            if (actualType !== selectedType) {
              throw new Error(`Expected ${selectedType} but got ${actualType}. Invalid JSON format.`);
            }
          } catch (e) {
             if (e instanceof Error && e.message.includes('Expected')) throw e;
             throw new Error(`Invalid JSON format for ${selectedType}`);
          }
          break;
        case 'Text':
          if (!embTextState) throw new Error('Text data not available');
           valueToSave = {
            'xText': {
              text: embTextState.text,
              index: embTextState.index,
              chunks: embTextState.chunks || [],
              emb_model: embTextState.emb_model,
              max_chunk_size: embTextState.max_chunk_size,
              chunk_overlap: embTextState.chunk_overlap,
              is_separator_regex: embTextState.is_separator_regex,
              separators: embTextState.separators,
              keep_separator: embTextState.keep_separator
            }
          };
          break;
        case 'Image':
           if (!embImageState) throw new Error('Image data not available');
           if (!embImageState.data) throw new Error('Image file is required for Image');
           
           // Asynchronously read the file data as base64
           const readFileAsBase64 = (file: File): Promise<string> => {
             return new Promise((resolve, reject) => {
               const reader = new FileReader();
               reader.readAsDataURL(file);
               reader.onload = () => {
                 const base64data = reader.result as string;
                 resolve(base64data.split(',')[1]); // Return only the base64 content
               };
               reader.onerror = (error) => reject(new Error('Failed to read image file: ' + error));
             });
           };

           try {
              const base64Content = await readFileAsBase64(embImageState.data as File);
              valueToSave = {
                'xImage': {
                  data: base64Content,
                  mime_type: embImageState.mime_type,
                  index: embImageState.index,
                  chunks: embImageState.chunks || [],
                  emb_model: embImageState.emb_model,
                  vision_model: embImageState.vision_model,
                  max_chunk_size: embImageState.max_chunk_size,
                  chunk_overlap: embImageState.chunk_overlap,
                  is_separator_regex: embImageState.is_separator_regex,
                  separators: embImageState.separators,
                  keep_separator: embImageState.keep_separator
                }
              };
            } catch (error) {
              throw error; // Rethrow file reading error
            }
           break;
        default:
          // Should not happen with defined types
          valueToSave = parseValue(inputValue);
      }

      // Call the appropriate save/add function
      if (isInlineEditing && onSave) {
        onSave(valueToSave, fieldName);
      } else {
        fieldOperations.handleInsertField?.(fieldName, fieldName, valueToSave); 
        onAdd(); // Callback for add mode
      }

    } catch (e) {
      fieldOperations.setError?.((e as Error).message || 'Invalid value format or error saving');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (isInlineEditing && onCancel) {
      onCancel();
    } else {
      // Reset add fields (parent state)
      onFieldNameChange("");
      onFieldValueChange("");
      // Hide the add field UI
      fieldOperations.setShowAddField(false);
      fieldOperations.handleAddFieldBetween(""); // Resets showAddFieldBetween
    }
  };

  // Custom key press handler for inputs
  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Allow Shift+Enter in textareas (object/array)
    const isTextArea = selectedType === 'object' || selectedType === 'array';
    if (e.key === 'Enter' && !(e.shiftKey && isTextArea)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const renderValueInput = () => {
    switch (selectedType) {
      case 'boolean':
        return <BooleanInput value={inputValue} onChange={handleInputValueChange} />;
      case 'null':
        return <NullDisplay />;
      case 'Text':
        return (
          <EmbTextInput 
            initialValue={isInlineEditing ? initialValue : undefined}
            onChange={handleEmbTextComponentChange}
            isInlineEditing={isInlineEditing}
          />
        );
      case 'Image':
         return (
          <EmbImageInput 
            initialValue={isInlineEditing ? initialValue : undefined}
            onChange={handleEmbImageComponentChange}
            isInlineEditing={isInlineEditing}
          />
        );       
      case 'string':
      case 'number':
      case 'object':
      case 'array':
        return (
          <DefaultInput
            inputRef={inputRef}
            value={inputValue}
            onChange={handleInputValueChange}
            onKeyDown={handleKeyPress}
            selectedType={selectedType}
          />
        );
      default:
        return null; // Should not happen
    }
  }

  return (
    <div className={styles.editFieldContainer}>
      <TypeSelector selectedType={selectedType} onChange={handleTypeChange} />
      
      <div className={styles.editFieldInputs}>
        {/* Field name input - show only if editing an object property or adding to an object */}
        {(isObject || (isInlineEditing && initialFieldName)) && (
          <FieldNameInput 
            value={fieldName}
            onChange={handleFieldNameChange}
            onKeyDown={handleKeyPress} 
          />
        )}
        
        {/* Value input section */}
        <div className={styles.embTextField}> {/* Reuse style for layout */}
           {selectedType !== 'null' && <label>Value</label>} {/* Hide label for null */} 
           {renderValueInput()}
        </div>
      </div>
      
      <ActionButtons 
        isInlineEditing={isInlineEditing} 
        onSave={handleSave} 
        onCancel={handleCancel} 
      />
    </div>
  );
};

export default EditField;
