export { OneNode } from "./client/OneNode";
export { Database } from "./client/Database";
export { Collection } from "./client/Collection";
export { Text } from "./ejson/text";
export type { TextIndexOptions } from "./ejson/text";
export { Image } from "./ejson/image";
export type { ImageIndexOptions } from "./ejson/image";
export { Models } from "./ejson/models";
// Keep backward compatibility
export { EmbModels } from "./ejson/embModels";
export { VisionModels } from "./ejson/visionModels";

// Type definitions
export type { QueryMatch, InsertResponse, Document } from "./types";

export {
  ObjectId,
  Binary,
  Code,
  DBRef,
  Decimal128,
  Double,
  Int32,
  Long,
  MaxKey,
  MinKey,
  BSONSymbol,
  Timestamp,
  UUID,
  BSONRegExp,
  BSONError,
  BSONType,
} from "bson";
