import {
  Binary,
  Code,
  Decimal128,
  MaxKey,
  MinKey,
  ObjectId,
  Timestamp,
} from "bson";
import { Text } from "../ejson/text";
import { Image } from "../ejson/image";
import { QueryMatch, InsertResponse, Projection } from "../types";

type SerializerFunction = (v: any) => Record<string, any>;

const BSON_SERIALIZERS: Record<string, SerializerFunction> = {
  Text: (v: Text) => v._serialize(),
  Image: (v: Image) => v._serialize(),
  ObjectId: (v: ObjectId) => ({ $oid: v.toString() }),
  Date: (v: Date) => ({ $date: v.toISOString() }),
  Decimal128: (v: Decimal128) => ({ $numberDecimal: v.toString() }),
  Binary: (v: Binary) => ({ $binary: v.toString("hex") }),
  RegExp: (v: RegExp) => ({ $regex: v.source, $options: v.flags }),
  Code: (v: Code) => ({ $code: v.toString() }),
  Timestamp: (v: Timestamp) => ({
    $timestamp: { t: v.getHighBits(), i: v.getLowBits() },
  }),
  MinKey: () => ({ $minKey: 1 }),
  MaxKey: () => ({ $maxKey: 1 }),
};
class APIClientError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string
  ) {
    super(message);
    this.name = "APIClientError";
    Object.setPrototypeOf(this, APIClientError.prototype);
  }
}

class AuthenticationError extends APIClientError {
  constructor(statusCode: number, message: string) {
    super(statusCode, message);
    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

class ClientRequestError extends APIClientError {
  constructor(statusCode: number, message: string) {
    super(statusCode, message);
    this.name = "ClientRequestError";
    Object.setPrototypeOf(this, ClientRequestError.prototype);
  }
}

class ServerError extends APIClientError {
  constructor(statusCode: number, message: string) {
    super(statusCode, message);
    this.name = "ServerError";
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}


export class Collection {
  private readonly apiKey: string;
  private readonly projectId: string;
  private readonly dbName: string;
  private readonly collectionName: string;
  
  constructor(
    apiKey: string,
    projectId: string,
    dbName: string,
    collectionName: string
  ) {
    this.apiKey = apiKey;
    this.projectId = projectId;
    this.dbName = dbName;
    this.collectionName = collectionName;
  }

  private getCollectionUrl(): string {
    return `https://api.onenode.ai/v0/project/${this.projectId}/db/${this.dbName}/collection/${this.collectionName}`;
  }

  private getDocumentUrl(): string {
    return `${this.getCollectionUrl()}/document`;
  }

  private getHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.apiKey}`
    };
  }

  private serialize(value: unknown, depth = 0): unknown {
    if (depth > 100) {
      throw new Error("Too much nesting or circular structure in serialize()");
    }

    if (
      value === null ||
      typeof value === "undefined" ||
      typeof value === "boolean" ||
      typeof value === "number" ||
      typeof value === "string"
    ) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.serialize(item, depth + 1));
    }

    if (value instanceof Text) {
      return value._serialize();
    }

    if (value instanceof Image) {
      return value._serialize();
    }

    const constructor = (value as object).constructor;
    const serializer = BSON_SERIALIZERS[constructor.name];
    if (serializer) {
      return serializer(value);
    }

    if (typeof value === "object") {
      const result: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = this.serialize(val, depth + 1);
      }
      return result;
    }

    throw new TypeError(`Unsupported BSON type: ${typeof value}`);
  }
  
  private deserialize(value: unknown, depth = 0): unknown {
    if (depth > 100) {
      throw new Error(
        "Too much nesting or circular structure in deserialize()"
      );
    }

    if (
      value === null ||
      typeof value === "undefined" ||
      typeof value === "boolean" ||
      typeof value === "number" ||
      typeof value === "string"
    ) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.deserialize(item, depth + 1));
    }

    const obj = value as Record<string, any>;

    if ("xText" in obj) {
      return Text._deserialize(obj);
    }
    
    if ("xImage" in obj) {
      return Image._deserialize(obj);
    }

    if ("$oid" in obj) return new ObjectId(obj["$oid"]);
    if ("$date" in obj) return new Date(obj["$date"]);
    if ("$numberDecimal" in obj) return new Decimal128(obj["$numberDecimal"]);
    if ("$binary" in obj) return new Binary(Buffer.from(obj["$binary"], "hex"));
    if ("$regex" in obj) {
      return new RegExp(obj["$regex"], obj["$options"] ?? "");
    }
    if ("$code" in obj) return new Code(obj["$code"]);
    if ("$timestamp" in obj) {
      return Timestamp.fromBits(obj["$timestamp"].t, obj["$timestamp"].i);
    }
    if ("$minKey" in obj) return new MinKey();
    if ("$maxKey" in obj) return new MaxKey();

    const nested: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      nested[key] = this.deserialize(val, depth + 1);
    }
    return nested;
  }

  private async extractBinaryData(documents: unknown[]): Promise<Record<string, Blob>> {
    const files: Record<string, Blob> = {};

    const extractFromValue = async (value: unknown, docIndex: number, path: string = ""): Promise<void> => {
      if (value instanceof Image && value.hasBinaryData()) {
        // Create field name following the pattern: doc_{index}.{field_path}.xImage.data
        const fieldName = path ? `doc_${docIndex}.${path}.xImage.data` : `doc_${docIndex}.xImage.data`;
        const binaryData = value.getBinaryData();
        if (binaryData) {
          // Convert to Blob if needed
          let blob: Blob | null = null;
          if (binaryData instanceof Blob) {
            blob = binaryData;
          } else if (binaryData instanceof File) {
            blob = binaryData;
          } else if (binaryData instanceof ArrayBuffer) {
            blob = new Blob([binaryData]);
          } else if (binaryData instanceof Uint8Array) {
            blob = new Blob([binaryData]);
          }
          
          if (blob) {
            files[fieldName] = blob;
          }
        }
      } else if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          const newPath = path ? `${path}.${i}` : `${i}`;
          await extractFromValue(value[i], docIndex, newPath);
        }
      } else if (value && typeof value === "object") {
        for (const [key, val] of Object.entries(value)) {
          const newPath = path ? `${path}.${key}` : key;
          await extractFromValue(val, docIndex, newPath);
        }
      }
    };

    for (let docIndex = 0; docIndex < documents.length; docIndex++) {
      await extractFromValue(documents[docIndex], docIndex);
    }

    return files;
  }

  private async handleResponse(response: Response): Promise<unknown> {
    try {
      if (!response.ok) {
        const errorData = await response.json();
        const code = errorData.code ?? response.status;
        const message = errorData.message ?? "An unknown error occurred.";

        if (code === 401) {
          throw new AuthenticationError(code, message);
        } else if (code >= 400 && code < 500) {
          throw new ClientRequestError(code, message);
        } else {
          throw new ServerError(code, message);
        }
      }

      const jsonResponse = await response.json();
      return this.deserialize(jsonResponse);
    } catch (error) {
      if (error instanceof APIClientError) {
        throw error;
      }
      throw new APIClientError(response.status, response.statusText);
    }
  }

  /**
   * Insert documents into the collection.
   * 
   * Returns an InsertResponse object with natural dot notation access:
   * - response.inserted_ids - Array of inserted document IDs
   */
  public async insert(documents: unknown[]): Promise<InsertResponse> {
    // Validate input
    if (!Array.isArray(documents)) {
      throw new ClientRequestError(
        400,
        `'documents' must be an array of objects, but got ${typeof documents}. ` +
        `If you're trying to insert a single document, wrap it in an array: [document]`
      );
    }
    
    if (documents.length === 0) {
      throw new ClientRequestError(
        400,
        "Cannot insert empty array of documents. Provide at least one document."
      );
    }
    
    for (let i = 0; i < documents.length; i++) {
      const document = documents[i];
      if (typeof document !== 'object' || document === null || Array.isArray(document)) {
        throw new ClientRequestError(
          400,
          `Invalid document at index ${i}. Expected an object, but received ${Array.isArray(document) ? 'array' : typeof document}. ` +
          `Each document must be a JSON object.`
        );
      }
    }
    
    const url = this.getDocumentUrl();
    const headers = this.getHeaders();
    const serializedDocs = documents.map((doc) => this.serialize(doc));

    // Extract binary data for multipart form
    const binaryFiles = await this.extractBinaryData(documents);

    const formData = new FormData();
    formData.append('documents', JSON.stringify(serializedDocs));

    // Add binary files to form data
    for (const [fieldName, blob] of Object.entries(binaryFiles)) {
      formData.append(fieldName, blob, fieldName);
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    const responseData = await this.handleResponse(response);
    return responseData as InsertResponse;
  }

  /**
   * Update documents matching filter.
   * 
   * @param filter - Query object to match documents for updating
   * @param update - Update operations to apply to matched documents
   * @param options - Optional configuration object
   * @param options.upsert - Whether to insert a new document if no match is found (defaults to false)
   * @returns Promise resolving to update operation result
   */
  public async update(
    filter: unknown,
    update: unknown,
    { upsert = false }: { upsert?: boolean } = {}
  ): Promise<unknown> {
    const url = this.getDocumentUrl();
    const headers = this.getHeaders();
    
    // Extract binary data for multipart form (from update data)
    const binaryFiles = await this.extractBinaryData([update]);
    
    const formData = new FormData();
    formData.append('filter', JSON.stringify(this.serialize(filter)));
    formData.append('update', JSON.stringify(this.serialize(update)));
    formData.append('upsert', String(upsert));

    // Add binary files to form data
    for (const [fieldName, blob] of Object.entries(binaryFiles)) {
      formData.append(fieldName, blob, fieldName);
    }

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: formData,
    });

    return this.handleResponse(response);
  }

  public async delete(filter: unknown): Promise<unknown> {
    const url = this.getDocumentUrl();
    const headers = this.getHeaders();
    
    const formData = new FormData();
    formData.append('filter', JSON.stringify(this.serialize(filter)));

    const response = await fetch(url, {
      method: "DELETE",
      headers,
      body: formData,
    });

    return this.handleResponse(response);
  }

  /**
   * Find documents matching filter.
   * 
   * @param filter - A query object to match documents (MongoDB-style filter syntax)
   * @param options - Optional configuration object
   * @param options.projection - OneNode-style projection object to control returned fields.
   *                           Must be in format: { mode: "include"|"exclude", fields?: string[] }
   *                           Examples:
   *                           - { mode: "include", fields: ["name", "age"] } - Return only name and age
   *                           - { mode: "exclude", fields: ["password"] } - Return all except password
   *                           - { mode: "include" } - Return entire document
   *                           - { mode: "exclude" } - Return only _id field
   * @param options.sort - Sort specification (e.g., { age: -1 } for descending by age)
   * @param options.limit - Maximum number of documents to return
   * @param options.skip - Number of documents to skip (for pagination)
   * @returns Promise resolving to array of matching documents
   * 
   * @example
   * // Find all users over 25, returning only name and email
   * const users = await collection.find(
   *   { age: { $gt: 25 } },
   *   {
   *     projection: { mode: "include", fields: ["name", "email"] },
   *     sort: { age: -1 },
   *     limit: 10
   *   }
   * );
   */
  public async find<TDocument = Record<string, any>>(
    filter: unknown,
    options?: {
      projection?: Projection;
      sort?: unknown;
      limit?: number;
      skip?: number;
    }
  ): Promise<TDocument[]> {
    const url = `${this.getCollectionUrl()}/document/find`;
    const headers = this.getHeaders();
    
    const formData = new FormData();
    // Only send filter if it has actual content (not null, undefined, or empty object)
    if (filter != null && typeof filter === 'object' && Object.keys(filter).length > 0) {
      const serializedFilter = JSON.stringify(this.serialize(filter));
      formData.append('filter', serializedFilter);
    }
    
    if (options?.projection !== undefined) {
      formData.append('projection', JSON.stringify(options.projection));
    }
    
    if (options?.sort !== undefined) {
      formData.append('sort', JSON.stringify(options.sort));
    }
    
    if (options?.limit !== undefined) {
      formData.append('limit', String(options.limit));
    }
    
    if (options?.skip !== undefined) {
      formData.append('skip', String(options.skip));
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    const responseData = await this.handleResponse(response);
    return responseData as TDocument[];
  }

  /**
   * Perform semantic search on the collection.
   * 
   * @param query - Text query for semantic search
   * @param options - Optional configuration object
   * @param options.filter - MongoDB-style filter to narrow search results
   * @param options.projection - OneNode-style projection object to control returned fields.
   *                           Must be in format: { mode: "include"|"exclude", fields?: string[] }
   *                           Examples:
   *                           - { mode: "include", fields: ["title", "content"] } - Return only title and content
   *                           - { mode: "exclude", fields: ["metadata"] } - Return all except metadata
   * @param options.embModel - Embedding model to use (defaults to "text-embedding-3-small")
   * @param options.topK - Maximum number of results to return (defaults to 10)
   * @param options.includeEmbedding - Whether to include embedding vectors in response
   * @returns Promise resolving to array of QueryMatch objects with the following structure:
   *          - chunk: Text chunk that matched the query
   *          - path: Document field path where the match was found
   *          - chunk_n: Index of the chunk
   *          - score: Similarity score (0-1)
   *          - document: Full document containing the match
   *          - embedding: Embedding vector embedding (optional, when includeEmbedding=true)
   * 
   * @example
   * // Search for AI content, returning only title and summary
   * const results = await collection.query(
   *   "artificial intelligence machine learning",
   *   {
   *     projection: { mode: "include", fields: ["title", "summary"] },
   *     topK: 5
   *   }
   * );
   */
  public async query(
    query: string,
    options?: {
      filter?: Record<string, unknown>;
      projection?: Projection;
      embModel?: string;
      topK?: number;
      includeEmbedding?: boolean;
    }
  ): Promise<QueryMatch[]> {
    const url = `${this.getCollectionUrl()}/document/query`;
    const headers = this.getHeaders();

    const formData = new FormData();
    formData.append('query', query);

    if (options?.filter != null) {
      formData.append('filter', JSON.stringify(this.serialize(options.filter)));
    }
    if (options?.projection != null) {
      formData.append('projection', JSON.stringify(options.projection));
    }
    if (options?.embModel != null) {
      formData.append('emb_model', options.embModel);
    }
    if (options?.topK != null) {
      formData.append('top_k', String(options.topK));
    }
    if (options?.includeEmbedding != null) {
      formData.append('include_embedding', String(options.includeEmbedding));
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    const responseData = await this.handleResponse(response);
    
    let matches: QueryMatch[];
    
    // The API returns a list of matches directly, not wrapped in an object
    if (Array.isArray(responseData)) {
      matches = responseData as QueryMatch[];
    } else {
      // Fallback for backward compatibility
      const dataAsObject = responseData as Record<string, unknown>;
      matches = (dataAsObject.matches || []) as QueryMatch[];
    }
    
    // Keep chunk field as null when it's null/undefined (don't remove it)
    return matches.map(match => {
      if (match.chunk === '') {
        return { ...match, chunk: null };
      }
      return match;
    });
  }

  public async drop(): Promise<void> {
    const url = this.getCollectionUrl();
    const headers = this.getHeaders();
    
    const formData = new FormData();
    
    const response = await fetch(url, {
      method: "DELETE",
      headers,
      body: formData
    });
    
    // 204 responses have no content, so we should just check status without parsing JSON
    if (response.status === 204) {
      return;
    }
    
    await this.handleResponse(response);
  }
}
