import React, { useState, useEffect } from 'react';
import FormNode from './FormNode';
import styles from './styles.module.css';

export interface JsonFormProps {
  /**
   * The JSON data to display and edit
   */
  data: any;
  /**
   * Whether the form should start expanded
   */
  initiallyExpanded?: boolean;
  /**
   * Callback when data changes
   */
  onChange?: (data: any) => void;
  /**
   * Whether the form is in read-only mode
   */
  readOnly?: boolean;
  /**
   * Callback when save is clicked
   */
  onSave?: () => void;
  /**
   * Whether to show the save button
   */
  showSaveButton?: boolean;
  /**
   * Whether the save operation is in progress
   */
  isSaving?: boolean;
}

/**
 * A component for viewing and editing JSON data in a form-like interface
 */
const JsonForm: React.FC<JsonFormProps> = ({ 
  data, 
  initiallyExpanded = true,
  onChange,
  readOnly = false,
  onSave,
  showSaveButton = false,
  isSaving = false
}) => {
  const [jsonData, setJsonData] = useState(data);

  // Update internal state when external data changes
  useEffect(() => {
    setJsonData(data);
  }, [data]);

  const handleChange = (newData: any) => {
    setJsonData(newData);
    onChange?.(newData);
  };

  return (
    <div className={styles.formJsonView}>
      <FormNode 
        data={jsonData} 
        name="root" 
        isRoot={true} 
        initiallyExpanded={initiallyExpanded}
        onChange={handleChange}
        path={[]}
        readOnly={readOnly}
      />
      {showSaveButton && !readOnly && (
        <button 
          className={`${styles.saveButton} ${isSaving ? styles.saving : ''}`}
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span className={styles.spinner}></span>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      )}
    </div>
  );
};

export default JsonForm; 