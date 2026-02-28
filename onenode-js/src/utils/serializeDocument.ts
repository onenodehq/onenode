import { Text } from "../ejson/text";
import { Image } from "../ejson/image";

export function serializeDocument(document: any): any {
  if (Array.isArray(document)) {
    return document.map(serializeDocument);
  }

  if (document instanceof Text) {
    return document._serialize();
  }
  
  if (document instanceof Image) {
    return document._serialize();
  }

  if (typeof document === "object" && document !== null) {
    return Object.fromEntries(
      Object.entries(document).map(([key, value]) => [
        key,
        serializeDocument(value),
      ])
    );
  }

  return document;
}
