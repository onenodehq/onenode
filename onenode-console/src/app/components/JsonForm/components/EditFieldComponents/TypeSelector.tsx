import React from 'react';
import styles from '../../styles.module.css';
import { DataType } from '../../hooks/useValueEditing'; // Adjust path if needed

interface TypeSelectorProps {
  selectedType: DataType;
  onChange: (type: DataType) => void;
}

const TypeSelector: React.FC<TypeSelectorProps> = ({ selectedType, onChange }) => (
  <div className={styles.editTypeSelector}>
    <select 
      value={selectedType}
      onChange={(e) => onChange(e.target.value as DataType)}
      className={styles.typeSelector}
    >
      <option value="string">String</option>
      <option value="number">Number</option>
      <option value="boolean">Boolean</option>
      <option value="null">Null</option>
      <option value="object">Object</option>
      <option value="array">Array</option>
      <option value="Text">Text</option>
      <option value="Image">Image</option>
    </select>
  </div>
);

export default TypeSelector; 