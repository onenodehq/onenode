/**
 * Utilities for converting between extended JSON and human-readable formats for BSON types
 */

/**
 * Converts Extended JSON to human-readable format
 * Transforms BSON types like $oid into readable strings like ObjectId('...')
 * @param obj The Extended JSON object to convert
 * @returns The converted object with human-readable BSON representations
 */
export const convertExtendedJsonToReadable = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(convertExtendedJsonToReadable);
  } else if (obj && typeof obj === "object") {
    const keys = Object.keys(obj);
    if (keys.length === 1) {
      const key = keys[0];
      const value = obj[key];
      switch (key) {
        case "$oid":
          return `ObjectId('${value}')`;
        case "$date":
          return `Date('${value}')`;
        case "$binary":
          return `Binary('${value}')`;
        // Handle other BSON types here
        default:
          break;
      }
    }
    // Recursively process the object
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = convertExtendedJsonToReadable(obj[key]);
    }
    return newObj;
  }
  return obj;
};

/**
 * Converts human-readable BSON representations back to Extended JSON
 * Transforms strings like ObjectId('...') into { $oid: '...' }
 * @param obj The object with human-readable BSON representations
 * @returns The converted Extended JSON object
 */
export const convertReadableToExtendedJson = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(convertReadableToExtendedJson);
  } else if (typeof obj === "string") {
    // Update regex patterns to match single quotes
    const objectIdMatch = obj.match(/^ObjectId\('([0-9a-fA-F]{24})'\)$/);
    const dateMatch = obj.match(/^Date\('(.+)'\)$/);
    const binaryMatch = obj.match(/^Binary\('(.+)'\)$/);
    // Add other BSON type regex matches here

    if (objectIdMatch) {
      return { $oid: objectIdMatch[1] };
    }
    if (dateMatch) {
      return { $date: dateMatch[1] };
    }
    if (binaryMatch) {
      return { $binary: binaryMatch[1] };
    }
    // Handle other BSON types here
    return obj;
  } else if (obj && typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = convertReadableToExtendedJson(obj[key]);
    }
    return newObj;
  }
  return obj;
}; 