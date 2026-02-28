/**
 * Renders a value for display in the form view
 * @param value The value to render
 * @param truncate Whether to truncate long strings
 * @returns A string representation of the value
 */
export const renderValueDisplay = (value: any, truncate: boolean = true): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  if (typeof value === 'string') {
    if (truncate && value.length > 50) {
      return value.substring(0, 47) + '...';
    }
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `[${value.length} items]`;
  }

  if (typeof value === 'object') {
    return `{${Object.keys(value).length} fields}`;
  }

  return String(value);
};


/**
 * Parses a string value into the appropriate type
 * @param value The string value to parse
 * @param originalType The original type of the value (optional)
 * @returns The parsed value
 */
export const parseValue = (value: string, originalType?: string): any => {
  // Handle special values
  if (value.toLowerCase() === 'null') return null;
  if (value.toLowerCase() === 'undefined') return undefined;
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  
  // Try to parse numbers
  if (!isNaN(Number(value)) && value.trim() !== '') {
    return Number(value);
  }
  
  // Try to parse JSON
  if (value.startsWith('{') || value.startsWith('[')) {
    try {
      return JSON.parse(value);
    } catch (e) {
      // If parsing fails, return as string
    }
  }
  
  // Default to returning string
  return value;
};

/**
 * Data manipulation utilities
 */

/**
 * Updates a value in an object or array
 * @param data The original data object/array
 * @param key The key/index to update
 * @param value The new value
 * @returns A new object or array with the updated value
 */
export const updateNestedValue = (data: any, key: string | number, value: any): any => {
  if (Array.isArray(data)) {
    const newData = [...data];
    newData[Number(key)] = value;
    return newData;
  } 
  
  if (typeof data === 'object' && data !== null) {
    return { ...data, [key]: value };
  }
  
  return data;
};

/**
 * Adds a new item to an array
 * @param data The original array
 * @param value The value to add
 * @returns A new array with the added value
 */
export const addArrayItem = (data: any[], value: any): any[] => {
  return [...data, value];
};

/**
 * Removes a field from an object or array
 * @param data The original data
 * @param key The key to remove
 * @returns The updated data
 */
export const removeField = (data: any, key: string | number): any => {
  if (Array.isArray(data)) {
    return data.filter((_: any, index: number) => index !== key);
  } else if (typeof data === 'object' && data !== null) {
    const { [key]: removed, ...rest } = data;
    return rest;
  }
  return data;
};

/**
 * Adds a new field to an object
 * @param data The original data
 * @param fieldName The name of the new field
 * @param fieldValue The value of the new field
 * @returns The updated data
 */
export const addObjectField = (data: any, fieldName: string, fieldValue: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  return { ...data, [fieldName]: fieldValue };
}; 