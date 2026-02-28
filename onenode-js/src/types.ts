/**
 * Type definitions for OneNode API responses.
 * JavaScript naturally supports dot notation, so we only need TypeScript interfaces
 * for better IDE support and type safety.
 */

/**
 * OneNode-style projection configuration.
 * Controls which fields are returned in query results.
 * 
 * Examples:
 * - { mode: "include", fields: ["name", "email"] } - Return only name and email
 * - { mode: "exclude", fields: ["password"] } - Return all except password
 * - { mode: "include" } - Return entire document
 * - { mode: "exclude" } - Return only _id field
 */
export interface Projection {
  mode: "include" | "exclude";
  fields?: string[];
}

/**
 * Query match response structure.
 * Pre-defined fields accessible via natural dot notation:
 * - match.chunk - Text chunk that matched the query (null when excluded by projection)
 * - match.path - Document field path  
 * - match.chunk_n - Index of the chunk
 * - match.score - Similarity score (0-1)
 * - match.document - Full document containing the match
 * - match.embedding - Embedding vector embedding (optional, when includeEmbedding=true)
 */
export interface QueryMatch {
  chunk?: string | null;
  path: string;
  chunk_n: number;
  score: number;
  document: Record<string, any>;
  embedding?: number[];
}

/**
 * Insert operation response structure.
 * Pre-defined fields accessible via natural dot notation:
 * - response.inserted_ids - Array of inserted document IDs
 */
export interface InsertResponse {
  inserted_ids: string[];
}

/**
 * Generic document type that supports dot notation naturally.
 * Use this for better TypeScript support with find() results.
 */
export type Document<T = Record<string, any>> = T; 