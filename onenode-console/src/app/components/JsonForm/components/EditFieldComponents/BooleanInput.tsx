import React from 'react';
import styles from '../../styles.module.css';

interface BooleanInputProps {
  value: string;
  onChange: (value: string) => void;
}

const BooleanInput: React.FC<BooleanInputProps> = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={styles.booleanSelector}
  >
    <option value="true">true</option>
    <option value="false">false</option>
  </select>
);

export default BooleanInput; 