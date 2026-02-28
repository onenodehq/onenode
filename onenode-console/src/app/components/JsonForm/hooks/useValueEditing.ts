import { useState } from 'react';
import { parseValue } from '../helper';

interface UseValueEditingProps {
  data: any;
  onChange?: (newValue: any) => void;
  setError: (error: string | null) => void;
}

export type DataType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array' | 'Text' | 'Image';

export interface ValueEditing {
  isEditing: boolean;
  editValue: string;
  dataType: DataType;
  startEditing: () => void;
  saveEdit: () => void;
  cancelEdit: () => void;
  setEditValue: (value: string) => void;
  setDataType: (type: DataType) => void;
  getOriginalType: () => DataType;
}

export const useValueEditing = ({
  data,
  onChange,
  setError,
}: UseValueEditingProps): ValueEditing => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [dataType, setDataType] = useState<DataType>('string');

  const getOriginalType = (): DataType => {
    if (data === null) return 'null';
    if (Array.isArray(data)) return 'array';
    if (typeof data === 'object') return 'object';
    return typeof data as DataType;
  };

  const startEditing = () => {
    const originalType = getOriginalType();
    setDataType(originalType);
    
    if (originalType === 'object' || originalType === 'array') {
      setEditValue(JSON.stringify(data, null, 2));
    } else {
      setEditValue(data === null ? 'null' : String(data));
    }
    
    setIsEditing(true);
    setError(null);
  };

  const saveEdit = () => {
    if (!onChange) return;
    
    try {
      let parsedValue;
      
      switch (dataType) {
        case 'string':
          parsedValue = editValue;
          break;
        case 'number':
          if (isNaN(Number(editValue))) {
            throw new Error('Invalid number format');
          }
          parsedValue = Number(editValue);
          break;
        case 'boolean':
          if (editValue.toLowerCase() !== 'true' && editValue.toLowerCase() !== 'false') {
            throw new Error('Boolean must be true or false');
          }
          parsedValue = editValue.toLowerCase() === 'true';
          break;
        case 'null':
          parsedValue = null;
          break;
        case 'Text':
          try {
            // Parse the JSON string to get the Text object
            const textObj = JSON.parse(editValue);
            
            // Validate the structure
            if (!textObj['xText']) {
              throw new Error('Invalid Text format: missing xText property');
            }
            
            const textData = textObj['xText'];
            
            // Validate required fields
            if (typeof textData.text !== 'string') {
              throw new Error('Text requires a text field of type string');
            }
            
            // Validate index field
            if (typeof textData.index !== 'boolean') {
              throw new Error('Text requires an index field of type boolean');
            }
            
            // Validate optional embedding model
            if (textData.emb_model && !['text-embedding-3-small', 'text-embedding-3-large', 'text-embedding-ada-002'].includes(textData.emb_model)) {
              throw new Error('Text requires a valid emb_model (text-embedding-3-small, text-embedding-3-large, or text-embedding-ada-002)');
            }
            
            // Validate optional chunk size
            if (textData.max_chunk_size && (typeof textData.max_chunk_size !== 'number' || textData.max_chunk_size <= 0)) {
              throw new Error('Text max_chunk_size must be a number greater than 0');
            }
            
            // Validate optional chunk overlap
            if (textData.chunk_overlap && (typeof textData.chunk_overlap !== 'number' || textData.chunk_overlap < 0)) {
              throw new Error('Text chunk_overlap must be a number greater than or equal to 0');
            }
            
            // Validate chunks field
            if (textData.chunks && !Array.isArray(textData.chunks)) {
              throw new Error('Text chunks must be an array');
            }
            
            parsedValue = textObj;
          } catch (e) {
            if (e instanceof SyntaxError) {
              throw new Error('Invalid JSON format for Text');
            }
            throw e;
          }
          break;
        case 'Image':
          try {
            // Parse the JSON string to get the Image object
            const imageObj = JSON.parse(editValue);
            
            // Validate the structure
            if (!imageObj['xImage']) {
              throw new Error('Invalid Image format: missing xImage property');
            }
            
            const imageData = imageObj['xImage'];
            
            // Validate required fields
            if (!imageData.data) {
              throw new Error('Image requires a data field');
            }
            
            // Validate mime_type
            if (!imageData.mime_type || typeof imageData.mime_type !== 'string') {
              throw new Error('Image requires a mime_type field of type string');
            }
            
            // Validate index field
            if (typeof imageData.index !== 'boolean') {
              throw new Error('Image requires an index field of type boolean');
            }
            
            // Validate supported mime types
            const supportedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!supportedMimeTypes.includes(imageData.mime_type)) {
              throw new Error(`Image mime_type must be one of: ${supportedMimeTypes.join(', ')}`);
            }
            
            // Validate optional embedding model
            if (imageData.emb_model && !['text-embedding-3-small', 'text-embedding-3-large', 'text-embedding-ada-002'].includes(imageData.emb_model)) {
              throw new Error('Image requires a valid emb_model (text-embedding-3-small, text-embedding-3-large, or text-embedding-ada-002)');
            }
            
            // Validate optional vision model
            if (imageData.vision_model && !['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1'].includes(imageData.vision_model)) {
              throw new Error('Image requires a valid vision_model (gpt-4o, gpt-4o-mini, gpt-4-turbo, or o1)');
            }
            
            // Validate optional chunk size
            if (imageData.max_chunk_size && (typeof imageData.max_chunk_size !== 'number' || imageData.max_chunk_size <= 0)) {
              throw new Error('Image max_chunk_size must be a number greater than 0');
            }
            
            // Validate optional chunk overlap
            if (imageData.chunk_overlap && (typeof imageData.chunk_overlap !== 'number' || imageData.chunk_overlap < 0)) {
              throw new Error('Image chunk_overlap must be a number greater than or equal to 0');
            }
            
            // Validate chunks field
            if (imageData.chunks && !Array.isArray(imageData.chunks)) {
              throw new Error('Image chunks must be an array');
            }
            
            parsedValue = imageObj;
          } catch (e) {
            if (e instanceof SyntaxError) {
              throw new Error('Invalid JSON format for Image');
            }
            throw e;
          }
          break;
        case 'object':
        case 'array':
          try {
            parsedValue = JSON.parse(editValue);
            const actualType = Array.isArray(parsedValue) ? 'array' : 'object';
            if (actualType !== dataType) {
              throw new Error(`Expected ${dataType} but got ${actualType}`);
            }
          } catch (e) {
            throw new Error(`Invalid JSON format for ${dataType}`);
          }
          break;
        default:
          parsedValue = parseValue(editValue);
      }
      
      onChange(parsedValue);
      setIsEditing(false);
      setError(null);
    } catch (e) {
      setError((e as Error).message || 'Invalid value format');
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  return {
    isEditing,
    editValue,
    dataType,
    startEditing,
    saveEdit,
    cancelEdit,
    setEditValue,
    setDataType,
    getOriginalType
  };
}; 