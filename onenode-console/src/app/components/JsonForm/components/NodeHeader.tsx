import React, { useState } from 'react';
import { 
  ChevronRightIcon, 
  ChevronDownIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import styles from '../styles.module.css';
import { useJsonForm } from '../context/JsonFormContext';
import { renderValueDisplay } from '../helper';
import { getEmbeddedValue, extractEmbImageUrl, getImageContentType } from '../utils/embJsonConverters';
import { EmbRenderer, EmbImagePreview } from './EmbRenderer';

interface NodeHeaderProps { 
  isPrimitive: boolean;
  isExpanded: boolean;
  displayName: string;
  readOnly: boolean;
  isRoot: boolean;
  copied: boolean;
  data: any;
  rawData?: any;
  isEmbedded?: boolean;
  embeddedType?: string;
  dataType: string;
  truncateStrings: boolean;
  onToggleExpand: () => void;
  onStartEditing?: () => void;
  onRemoveField: () => void;
  onCopyToClipboard: () => void;
}

const NodeHeader: React.FC<NodeHeaderProps> = ({
  isPrimitive,
  isExpanded,
  displayName,
  readOnly,
  isRoot,
  copied,
  data,
  rawData,
  isEmbedded = false,
  embeddedType = '',
  dataType,
  truncateStrings,
  onToggleExpand,
  onStartEditing,
  onRemoveField,
  onCopyToClipboard,
}) => {
  // Local state to track if embedded content is expanded
  const [isEmbValueExpanded, setIsEmbValueExpanded] = useState(false);
  
  // Get context to access onChange function
  const { fieldOperations } = useJsonForm();
  
  // Check if this is a formatted embedded value (text or image)
  const isFormattedEmbValue = typeof data === 'string' && 
    (data.startsWith('Text(') || data.startsWith('Image('));
    
  // Handle click on embedded value
  const handleEmbValueClick = (e: React.MouseEvent) => {
    if (isEmbedded || isFormattedEmbValue) {
      e.stopPropagation();
      // Only toggle expansion for text or if not an image URL click
      if (embeddedType !== 'image' || (e.target as HTMLElement).tagName !== 'A') {
        setIsEmbValueExpanded(!isEmbValueExpanded);
      }
    }
  };
  
  // Get the display value for an embedded field
  const getDisplayValue = () => {
    if ((isEmbedded || isFormattedEmbValue) && rawData) {
      return isEmbValueExpanded 
        ? getEmbeddedValue(rawData, false) // Force no truncation 
        : getEmbeddedValue(rawData, truncateStrings);
    }
    
    if (isFormattedEmbValue) {
      return data;
    }

    // Handle newly added Image field
    if (data?.['xImage']) {
      const embImage = data['xImage'];
      if (embImage.data) {
        // Check if data contains a URL (string starting with http) or binary data
        if (typeof embImage.data === 'string' && embImage.data.startsWith('http')) {
          // For URL, show truncated or full URL based on truncateStrings setting
          if (truncateStrings && embImage.data.length > 50) {
            return `Image('${embImage.data.substring(0, 47)}...')`;
          }
          return `Image('${embImage.data}')`;
        } else {
          // For binary data, show a standard message
          return `Image('binary data')`;
        }
      }
    }
    
    return renderValueDisplay(data, truncateStrings);
  };

  // Determine CSS class for embedded content
  const getValueClassName = () => {
    if (isEmbedded || isFormattedEmbValue || data?.['xImage']) {
      const baseClass = embeddedType === 'image' || data?.['xImage'] ? 'embImageValue' : 'embTextValue';
      const expandedClass = isEmbValueExpanded ? 'embTextExpanded' : '';
      return `${styles[baseClass]} ${expandedClass ? styles[expandedClass] : ''}`;
    }
    
    return styles[`${dataType}Value`];
  };

  return (
    <div className={styles.formNodeHeader}>
      {!isPrimitive && (
        <button 
          className={styles.expandButton}
          onClick={onToggleExpand}
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <ChevronDownIcon className="w-4 h-4" />
          ) : (
            <ChevronRightIcon className="w-4 h-4" />
          )}
        </button>
      )}
      
      {displayName && (
        <>
          <span className={styles.fieldName}>{displayName}</span>
          <span className={styles.colon}>:</span>
        </>
      )}
      
      <div 
        className={getValueClassName()}
        onClick={handleEmbValueClick}
      >
        {/* For newly added Image with binary data (not already handled in renderEmbeddedContent) */}
        {!isEmbedded && data?.['xImage']?.data ? (
          <span className={styles.imageHoverPreviewWrapper}>
            Image(&apos;
            <span className={styles.embImageLink}>
              binary data
              <span className={styles.binaryDataIndicator} title="Image stored as binary data"></span>
            </span>
            &apos;)
            <EmbImagePreview data={data} />
          </span>
        ) : isEmbedded && embeddedType === 'image' ? (
          <EmbRenderer 
            rawData={rawData}
            displayValue={getDisplayValue()}
            isEmbValueExpanded={isEmbValueExpanded}
            embeddedType={embeddedType}
          />
        ) : (
          getDisplayValue()
        )}
      </div>
      
      {!isRoot && !readOnly && (
        <div className={styles.nodeActions}>
          {onStartEditing && (
            <button 
              className={styles.actionButton} 
              onClick={onStartEditing}
              title="Edit this field"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          <button 
            className={styles.actionButton}
            onClick={onCopyToClipboard}
            title={copied ? "Copied!" : "Copy to clipboard"}
          >
            <DocumentDuplicateIcon className={`w-4 h-4 ${copied ? styles.copied : ''}`} />
          </button>
          <button 
            className={styles.actionButton}
            onClick={onRemoveField}
            title="Remove this field"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default NodeHeader; 