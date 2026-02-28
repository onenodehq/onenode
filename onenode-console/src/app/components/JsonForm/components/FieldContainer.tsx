import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import styles from '../styles.module.css';
import FormNode from '../FormNode';
import EditField from './EditField';
import { useJsonForm } from '../context/JsonFormContext';
import { hasEmbText, hasEmbImage } from '../utils/embJsonConverters';

interface FieldContainerProps {
  index: number | string;
  value: any;
}

const FieldContainer: React.FC<FieldContainerProps> = ({
  index,
  value,
}) => {
  const { fieldOperations, path, readOnly, handleKeyPress, valueEditing } = useJsonForm();
  const key = String(index);
  const [isEditing, setIsEditing] = useState(false);
  
  // Get parent data from context path
  const parentData = fieldOperations.data;
  const isArray = Array.isArray(parentData);
  const isObject = !isArray && parentData !== null && typeof parentData === 'object';
  
  // Handle save for editing
  const handleSaveEdit = (newValue: any, newFieldName?: string) => {
    if (fieldOperations.handleUpdateNestedValue) {
      // If the field name was changed and we have a new name
      if (newFieldName && newFieldName !== key && isObject) {
        // First remove the old field
        const updatedObj = { ...parentData };
        delete updatedObj[key];
        
        // Then add the field with the new name and value
        updatedObj[newFieldName] = newValue;
        
        // Update the parent object
        fieldOperations.onChange?.(updatedObj);
      } else {
        // Just update the value if the name hasn't changed
        fieldOperations.handleUpdateNestedValue(index, newValue);
      }
      
      setIsEditing(false);
    }
  };
  
  // Handle cancel for editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    fieldOperations.setError?.(null);
  };
  
  // Determine data type for editing
  const getDataType = () => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object' && value !== null) {
      if (hasEmbText(value)) return 'Text';
      if (hasEmbImage(value)) return 'Image';
      return 'object';
    }
    return typeof value;
  };
  
  return (
    <div>
      <div className={`${styles.fieldContainer} ${isEditing ? styles.editingField : ''}`}>
        <button
          className={styles.addFieldButton}
          onClick={() => fieldOperations.handleAddFieldBetween(key)}
          title={isArray ? "Add item here" : "Add field here"}
          disabled={readOnly}
        >
          <PlusIcon className="w-3 h-3" />
        </button>
        <FormNode
          data={value}
          name={key}
          onChange={(newValue) => fieldOperations.handleUpdateNestedValue(index, newValue)}
          path={[...path, index]}
          readOnly={readOnly}
          parentData={parentData}
          onParentUpdate={fieldOperations.onChange}
          onStartEditing={() => setIsEditing(true)} // Pass callback to start editing
        />
      </div>
      
      {/* Show EditField when adding a field between items */}
      {fieldOperations.showAddFieldBetween === key && (
        <EditField
          isObject={!isArray}
          newFieldName={fieldOperations.newFieldName}
          newFieldValue={fieldOperations.newFieldValue}
          onFieldNameChange={fieldOperations.setNewFieldName}
          onFieldValueChange={fieldOperations.setNewFieldValue}
          onAdd={() => fieldOperations.handleInsertField(key, fieldOperations.newFieldName, fieldOperations.newFieldValue)}
        />
      )}
      
      {/* Show EditField when adding a new field (for the root level) */}
      {index === '0' && fieldOperations.showAddField && (
        <EditField
          isObject={isObject}
          newFieldName={fieldOperations.newFieldName}
          newFieldValue={fieldOperations.newFieldValue}
          onFieldNameChange={fieldOperations.setNewFieldName}
          onFieldValueChange={fieldOperations.setNewFieldValue}
          onAdd={isArray ? fieldOperations.handleAddArrayItem : fieldOperations.addField}
        />
      )}
      
      {/* Show EditField when editing a value */}
      {isEditing && (
        <EditField
          isObject={isObject}
          newFieldName=""
          newFieldValue=""
          onFieldNameChange={() => {}}
          onFieldValueChange={() => {}}
          onAdd={() => {}}
          isInlineEditing={true}
          dataType={getDataType()}
          initialValue={value}
          initialFieldName={isArray ? "" : key}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default FieldContainer; 