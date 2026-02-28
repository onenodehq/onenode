import React from 'react';
import styles from '../../styles.module.css';

interface DefaultInputProps {
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  selectedType: 'string' | 'number' | 'object' | 'array'; // Limited types for default
}

const DefaultInput: React.FC<DefaultInputProps> = ({ 
  inputRef, 
  value, 
  onChange, 
  onKeyDown, 
  selectedType 
}) => {
  const isTextArea = selectedType === 'object' || selectedType === 'array';
  const InputComponent = isTextArea ? 'textarea' : 'input';
  const placeholder = 
      selectedType === 'number' ? "Enter number" 
    : selectedType === 'string' ? "Enter string value"
    : selectedType === 'object' ? "Enter JSON object, e.g. {\"key\": \"value\"}"
    : "Enter JSON array, e.g. [1, \"two\"]";

  return (
    <InputComponent
      ref={inputRef as any} // Cast needed due to conditional component
      type={selectedType === 'number' ? 'number' : 'text'}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      className={isTextArea ? styles.editTextArea : styles.editFieldValue}
      rows={isTextArea ? 3 : undefined} // Give textarea some default height
    />
  );
};

export default DefaultInput; 