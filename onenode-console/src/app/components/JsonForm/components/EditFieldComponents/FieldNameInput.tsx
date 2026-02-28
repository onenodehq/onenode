import React from 'react';
import styles from '../../styles.module.css';

interface FieldNameInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const FieldNameInput: React.FC<FieldNameInputProps> = ({ value, onChange, onKeyDown }) => (
  <div className={styles.embTextField}> {/* Reuse style for layout */}
    <label>Field Name</label>
    <input
      type="text"
      placeholder="Enter field name"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      className={styles.editFieldName}
    />
  </div>
);

export default FieldNameInput; 