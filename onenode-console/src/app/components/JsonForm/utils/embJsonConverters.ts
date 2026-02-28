/**
 * EmbJSON converter utilities for JsonForm component
 */

/**
 * Checks if an object contains an xText field with a text property
 * @param obj The object to check
 * @returns True if the object has an xText field with a text property
 */
export const hasEmbText = (obj: any): boolean => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    'xText' in obj &&
    typeof obj['xText'] === 'object' &&
    obj['xText'] !== null &&
    'text' in obj['xText']
  );
};

/**
 * Gets the text value from an object with an xText field
 * @param obj The object containing xText
 * @param truncate Whether to truncate long text
 * @param forceFullText Force showing the full text regardless of truncate setting
 * @returns The text value as a string
 */
export const getEmbTextValue = (obj: any, truncate: boolean = true, forceFullText: boolean = false): string => {
  if (!hasEmbText(obj)) return '';
  
  const text = obj['xText'].text;
  if (truncate && !forceFullText && text.length > 50) {
    return `Text('${text.substring(0, 47)}...')`;
  }
  return `Text('${text}')`;
};

/**
 * Checks if an object contains an xImage field with a data property
 * @param obj The object to check
 * @returns True if the object has an xImage field with a data property
 */
export const hasEmbImage = (obj: any): boolean => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    'xImage' in obj &&
    typeof obj['xImage'] === 'object' &&
    obj['xImage'] !== null &&
    'data' in obj['xImage']
  );
};

/**
 * Gets the data value from an object with an xImage field (data can be URL or binary)
 * @param obj The object containing xImage
 * @param truncate Whether to truncate long url
 * @param forceFullText Force showing the full url regardless of truncate setting
 * @returns The formatted Image string
 */
export const getEmbImageValue = (obj: any, truncate: boolean = true, forceFullText: boolean = false): string => {
  if (!hasEmbImage(obj)) return '';
  
  if (obj['xImage'].data) {
    // Check if data contains a URL or binary data
    if (typeof obj['xImage'].data === 'string' && obj['xImage'].data.startsWith('http')) {
      const url = obj['xImage'].data;
      if (truncate && !forceFullText && url.length > 50) {
        return `Image('${url.substring(0, 47)}...')`;
      }
      return `Image('${url}')`;
    } else {
      return `Image('binary data')`;
    }
  }
  
  return 'Image(invalid)';
};

/**
 * Checks if an object contains either xText or xImage
 * @param obj The object to check
 * @returns True if the object has either an xText or xImage field
 */
export const hasEmbedded = (obj: any): boolean => {
  return hasEmbText(obj) || hasEmbImage(obj);
};

/**
 * Gets the value from an object with either xText or xImage
 * @param obj The object containing xText or xImage
 * @param truncate Whether to truncate long values
 * @param forceFullText Force showing the full value regardless of truncate setting
 * @returns The formatted string representation
 */
export const getEmbeddedValue = (obj: any, truncate: boolean = true, forceFullText: boolean = false): string => {
  if (hasEmbText(obj)) {
    return getEmbTextValue(obj, truncate, forceFullText);
  }
  if (hasEmbImage(obj)) {
    return getEmbImageValue(obj, truncate, forceFullText);
  }
  return '';
};

/**
 * Determines the type of embedded value
 * @param obj The object to check
 * @returns 'text', 'image', or '' if not an embedded type
 */
export const getEmbeddedType = (obj: any): string => {
  if (hasEmbText(obj)) return 'text';
  if (hasEmbImage(obj)) return 'image';
  return '';
};

/**
 * Extract the URL from Image formatted string
 * @param embImageString The Image string
 * @returns The URL from the Image string
 */
export const extractEmbImageUrl = (embImageString: string): string => {
  if (!embImageString.startsWith('Image(\'')) return '';
  
  // Extract content between the quotes
  const match = embImageString.match(/Image\('(.+?)'\)/);
  return match ? match[1] : '';
};

/**
 * Helper to determine image content type from base64 data
 * @param declaredType The declared content type (if available)
 * @param base64Data The base64 image data
 * @returns The detected image content type
 */
export const getImageContentType = (declaredType?: string, base64Data?: string): string => {
  // Use declared content type if available
  if (declaredType) return declaredType;
  
  // Try to detect from base64 data signature
  if (base64Data) {
    // Check common image signatures
    if (base64Data.startsWith('/9j/')) return 'image/jpeg';
    if (base64Data.startsWith('iVBORw0KGg')) return 'image/png';
    if (base64Data.startsWith('R0lGOD')) return 'image/gif';
    if (base64Data.startsWith('UklGR')) return 'image/webp';
    if (base64Data.startsWith('PHN2Zy')) return 'image/svg+xml';
  }
  
  // Default to generic image type
  return 'image/png';
}; 