import React from 'react';
import Image from 'next/image';
import styles from '../styles.module.css';
import { extractEmbImageUrl, getImageContentType } from '../utils/embJsonConverters';

interface EmbRendererProps {
  rawData: any;
  displayValue: string;
  isEmbValueExpanded: boolean;
  embeddedType: string;
}

/**
 * Component for rendering embedded content (Image, Text)
 */
export const EmbRenderer: React.FC<EmbRendererProps> = ({
  rawData,
  displayValue,
  isEmbValueExpanded,
  embeddedType,
}) => {
  // For non-embedded or non-image content, just return the display value
  if (embeddedType !== 'image' || !rawData) {
    return <>{displayValue}</>;
  }

  // Handle Image with URL (now stored in data field)
  if (rawData?.['xImage']?.data && typeof rawData['xImage'].data === 'string' && rawData['xImage'].data.startsWith('http')) {
    const url = isEmbValueExpanded
      ? rawData['xImage'].data
      : displayValue.endsWith('...)\')')
        ? extractEmbImageUrl(displayValue) + '...'
        : extractEmbImageUrl(displayValue);
    
    return (
      <>
        Image(&apos;
        <a 
          href={rawData['xImage'].data}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={styles.embImageLink}
        >
          {url.endsWith('...') ? url : url}
        </a>
        &apos;)
      </>
    );
  } 
  
  // Handle Image with binary data
  if (rawData?.['xImage']?.data && typeof rawData['xImage'].data === 'string' && !rawData['xImage'].data.startsWith('http')) {
    const base64Data = rawData['xImage'].data;
    const contentType = getImageContentType(rawData['xImage'].mime_type, base64Data);
    const imageDataUrl = `data:${contentType};base64,${base64Data}`;
    
    return (
      <>
        Image(&apos;
        <span className={`${styles.embImageLink} ${styles.imageHoverPreviewWrapper}`}>
          binary data
          <span className={styles.binaryDataIndicator} title="Image stored as binary data"></span>
          <div className={styles.imageHoverPreview}>
            <Image src={imageDataUrl} alt="Image preview" width={200} height={200} style={{ objectFit: 'contain' }} />
          </div>
        </span>
        &apos;)
      </>
    );
  }

  // Default case: just display the value
  return <>{displayValue}</>;
};

/**
 * Component for rendering Image binary data preview
 */
export const EmbImagePreview: React.FC<{ data: any }> = ({ data }) => {
  if (!data?.['xImage']?.data) return null;

  const base64Data = data['xImage'].data;
  const contentType = getImageContentType(data['xImage'].mime_type, base64Data);
  const imageDataUrl = `data:${contentType};base64,${base64Data}`;
  
  return (
    <div className={styles.imageHoverPreview}>
      <Image src={imageDataUrl} alt="Image preview" width={200} height={200} style={{ objectFit: 'contain' }} />
    </div>
  );
}; 