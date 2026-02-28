import React, { useState } from 'react';
import styles from './styles.module.css';
import NodeHeader from './components/NodeHeader';
import ErrorNotification from './components/ErrorNotification';
import ObjectArrayFields from './components/ObjectArrayFields';
import { useFieldOperations } from './hooks/useFieldOperations';
import { useValueEditing } from './hooks/useValueEditing';
import { JsonFormProvider } from './context/JsonFormContext';
import { hasEmbedded, getEmbeddedValue, getEmbeddedType } from './utils/embJsonConverters';

// Modify this function to skip the _query_score field
// We'll use this in the ObjectArrayFields component
export const shouldSkipField = (key: string): boolean => {
  // Skip all query-related fields which are only for UI display
  return key === '_query_score' || 
         key === '_query_chunk' || 
         key === '_query_path' || 
         key === '_query_chunk_n';
};

interface FormNodeProps {
  data: any;
  name: string;
  isRoot?: boolean;
  initiallyExpanded?: boolean;
  onChange?: (newValue: any) => void;
  path: (string | number)[];
  readOnly?: boolean;
  parentData?: any;
  onParentUpdate?: (newValue: any) => void;
  onStartEditing?: () => void;
}

const FormNode: React.FC<FormNodeProps> = ({ 
  data, 
  name, 
  isRoot = false,
  initiallyExpanded = false,
  onChange,
  path,
  readOnly = false,
  parentData,
  onParentUpdate,
  onStartEditing,
}) => {
  // UI state
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [copied, setCopied] = useState(false);
  const [truncateStrings, setTruncateStrings] = useState(true);
  
  // Check for objects containing embedded content
  const containsEmbedded = hasEmbedded(data);
  const embeddedType = containsEmbedded ? getEmbeddedType(data) : '';
  
  // Data type detection
  const isObject = data !== null && typeof data === 'object' && !Array.isArray(data);
  const isArray = Array.isArray(data);
  const isPrimitive = containsEmbedded ? true : (!isObject && !isArray);
  const dataType = containsEmbedded ? 'string' : (isArray ? 'array' : isObject ? 'object' : typeof data);
  const displayName = isRoot ? '' : name;
  
  // Use custom hooks
  const fieldOperations = useFieldOperations({
    data,
    isObject,
    isArray,
    onChange,
    onParentUpdate,
    parentData,
  });
  
  // Add onChange function to fieldOperations for access by child components
  fieldOperations.onChange = onChange;

  const valueEditing = useValueEditing({
    data,
    onChange,
    setError: fieldOperations.setError,
  });
  
  // UI event handlers
  const toggleExpand = () => setIsExpanded(!isExpanded);
  
  const toggleTruncate = () => setTruncateStrings(!truncateStrings);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Handle starting edit mode using parent callback
  const handleStartEditing = () => {
    if (onStartEditing) {
      onStartEditing();
    }
  };
  
  // Keyboard event handling
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (valueEditing.isEditing) {
        valueEditing.saveEdit();
      } else if (fieldOperations.showAddField) {
        if (isArray) {
          fieldOperations.handleAddArrayItem();
        } else {
          fieldOperations.addField();
        }
      }
    } else if (e.key === 'Escape') {
      if (valueEditing.isEditing) {
        valueEditing.cancelEdit();
      } else if (fieldOperations.showAddField) {
        fieldOperations.setShowAddField(false);
      }
    }
  };

  return (
    <JsonFormProvider 
      value={{
        readOnly,
        fieldOperations,
        valueEditing: isPrimitive ? valueEditing : undefined,
        path,
        handleKeyPress,
      }}
    >
      <div className={styles.formNode}>
        <NodeHeader
          isPrimitive={isPrimitive}
          isExpanded={isExpanded}
          displayName={displayName}
          readOnly={readOnly}
          isRoot={isRoot}
          copied={copied}
          data={containsEmbedded ? getEmbeddedValue(data, truncateStrings) : data}
          rawData={data}
          isEmbedded={containsEmbedded}
          embeddedType={embeddedType}
          dataType={dataType}
          truncateStrings={truncateStrings}
          onToggleExpand={toggleExpand}
          onStartEditing={readOnly ? undefined : handleStartEditing}
          onRemoveField={() => fieldOperations.handleRemoveField(name)}
          onCopyToClipboard={copyToClipboard}
        />
        
        <ErrorNotification error={fieldOperations.error} />
        
        {/* Show regular content only when expanded */}
        {isExpanded && !containsEmbedded && (
          <div className={styles.formNodeContent}>
            <ObjectArrayFields
              data={data}
              isObject={isObject}
              isArray={isArray}
            />
          </div>
        )}
      </div>
    </JsonFormProvider>
  );
};

export default FormNode; 