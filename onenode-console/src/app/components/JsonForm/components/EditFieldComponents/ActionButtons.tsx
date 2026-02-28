import React from 'react';
import { PlusIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import styles from '../../styles.module.css';

interface ActionButtonsProps {
  isInlineEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ isInlineEditing, onSave, onCancel }) => (
  <div className={styles.editFieldActions}>
    <button
      onClick={onSave}
      className={styles.saveButton}
      title={isInlineEditing ? "Save" : "Add"}
    >
      {isInlineEditing ? <CheckIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
      <span>{isInlineEditing ? "Save" : "Add"}</span>
    </button>
    
    <button
      onClick={onCancel}
      className={styles.cancelButton}
      title="Cancel"
    >
      <XMarkIcon className="w-4 h-4" />
      <span>Cancel</span>
    </button>
  </div>
);

export default ActionButtons; 