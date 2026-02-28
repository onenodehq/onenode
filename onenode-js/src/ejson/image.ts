import { Models } from "./models";

export interface ImageIndexOptions {
  embModel?: string;
  visionModel?: string;
  maxChunkSize?: number;
  chunkOverlap?: number;
  isSeparatorRegex?: boolean;
  separators?: string[] | null;
  keepSeparator?: boolean;
}

export class Image {
  private data: string | File | Blob | ArrayBuffer | Uint8Array;
  private mimeType: string;
  private _chunks: string[];
  private embModel: string | null;
  private visionModel: string | null;
  private maxChunkSize: number | null;
  private chunkOverlap: number | null;
  private isSeparatorRegex: boolean | null;
  private separators: string[] | null;
  private keepSeparator: boolean | null;
  private indexEnabled: boolean;
  
  private static SUPPORTED_MIME_TYPES: string[] = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  // Helper method to check if we're in Node.js environment
  private static isNodeEnvironment(): boolean {
    return typeof process !== 'undefined' && process.versions && !!process.versions.node;
  }

  constructor(data: string | File | Blob | ArrayBuffer | Uint8Array) {
    // Handle different input types
    if (typeof data === "string") {
      // String input - could be base64, data URL, HTTP URL, or file path
      if (data.startsWith("data:")) {
        // Data URL format
        const matches = data.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
          throw new Error("Invalid data URL format. Expected format: data:image/type;base64,<data>");
        }
        const [, urlMimeType, base64Data] = matches;
        this.data = base64Data;
        this.mimeType = urlMimeType;
      } else if (data.startsWith('http')) {
        // HTTP URL input
        this.data = data;
        // Try to extract mime type from URL extension
        this.mimeType = this.extractMimeTypeFromUrl(data);
      } else {
        // Could be base64 string or file path - try base64 first
        if (Image.isValidData(data)) {
          // Valid base64 string
          this.data = data;
          // Extract mime type from base64 data
          this.mimeType = this.extractMimeTypeFromBase64(data);
        } else if (Image.isValidFilePath(data)) {
          // Local file path - read the file (only in Node.js environment)
          if (!Image.isNodeEnvironment()) {
            throw new Error("File path input is only supported in Node.js environment. In browsers, use File, Blob, or base64 data instead.");
          }
          try {
            // Dynamic import of fs only when needed and in Node.js
            const fs = require('fs');
            const binaryData = fs.readFileSync(data);
            this.data = new Uint8Array(binaryData);
            // Extract mime type from binary data
            this.mimeType = this.extractMimeTypeFromUint8Array(this.data as Uint8Array);
          } catch (error: any) {
            throw new Error(`Could not read file '${data}': ${error.message}`);
          }
        } else {
          throw new Error("Invalid data: must be a non-empty string containing valid base64-encoded image data, HTTP URL, or valid file path.");
        }
      }
    } else if (data instanceof File) {
      // File input
      this.data = data;
      this.mimeType = data.type || this.extractMimeTypeFromFileName(data.name);
    } else if (data instanceof Blob) {
      // Blob input
      this.data = data;
      this.mimeType = data.type || "image/jpeg"; // Default if type is not set
    } else if (data instanceof ArrayBuffer) {
      // ArrayBuffer input
      this.data = data;
      this.mimeType = this.extractMimeTypeFromArrayBuffer(data);
    } else if (data instanceof Uint8Array) {
      // Uint8Array input
      this.data = data;
      this.mimeType = this.extractMimeTypeFromUint8Array(data);
    } else {
      throw new Error("Invalid data type: must be string (base64/data URL/HTTP URL/file path), File, Blob, ArrayBuffer, or Uint8Array");
    }
    
    // MIME type validation only matters when indexing
    // so we don't validate it here anymore

    this._chunks = [];
    
    // Optional parameters - set to null initially
    this.embModel = null;
    this.visionModel = null;
    this.maxChunkSize = null;
    this.chunkOverlap = null;
    this.isSeparatorRegex = null;
    this.separators = null;
    this.keepSeparator = null;
    this.indexEnabled = false; // Default to false when index() isn't called
  }

  private extractMimeTypeFromUrl(url: string): string {
    const urlLower = url.toLowerCase();
    if (urlLower.endsWith('.jpg') || urlLower.endsWith('.jpeg')) {
      return 'image/jpeg';
    } else if (urlLower.endsWith('.png')) {
      return 'image/png';
    } else if (urlLower.endsWith('.gif')) {
      return 'image/gif';
    } else if (urlLower.endsWith('.webp')) {
      return 'image/webp';
    } else {
      // Default to JPEG if unable to determine
      return 'image/jpeg';
    }
  }

  private extractMimeTypeFromFileName(fileName: string): string {
    const nameLower = fileName.toLowerCase();
    if (nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg')) {
      return 'image/jpeg';
    } else if (nameLower.endsWith('.png')) {
      return 'image/png';
    } else if (nameLower.endsWith('.gif')) {
      return 'image/gif';
    } else if (nameLower.endsWith('.webp')) {
      return 'image/webp';
    } else {
      return 'image/jpeg'; // Default
    }
  }

  private extractMimeTypeFromBase64(base64Data: string): string {
    try {
      // Decode enough base64 data to get magic bytes (at least 16 bytes encoded = ~22 chars)
      // Use first 100 chars to be safe, which gives us plenty of decoded bytes
      const sampleData = base64Data.length > 100 ? base64Data.substring(0, 100) : base64Data;
      const binaryString = atob(sampleData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return this.extractMimeTypeFromBytes(bytes);
    } catch {
      // Default to JPEG if unable to determine
      return 'image/jpeg';
    }
  }

  private extractMimeTypeFromArrayBuffer(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return this.extractMimeTypeFromBytes(bytes);
  }

  private extractMimeTypeFromUint8Array(bytes: Uint8Array): string {
    return this.extractMimeTypeFromBytes(bytes);
  }

  private extractMimeTypeFromBytes(bytes: Uint8Array): string {
    if (bytes.length < 4) {
      return 'image/jpeg'; // Default
    }

    // Check magic bytes
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return 'image/jpeg';
    } else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 &&
               bytes.length > 7 && bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A) {
      return 'image/png';
    } else if (bytes.length >= 6 && 
               ((bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38 && bytes[4] === 0x37 && bytes[5] === 0x61) ||
                (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38 && bytes[4] === 0x39 && bytes[5] === 0x61))) {
      return 'image/gif';
    } else if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
               bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return 'image/webp';
    } else {
      // Default to JPEG if unable to determine
      return 'image/jpeg';
    }
  }

  public getData(): string | File | Blob | ArrayBuffer | Uint8Array {
    return this.data;
  }

  public getBinaryData(): File | Blob | ArrayBuffer | Uint8Array | null {
    return typeof this.data === "string" ? null : this.data;
  }

  public getBase64Data(): string | null {
    // Return base64 data only if it's a string and not a URL
    if (typeof this.data === "string" && !this.data.startsWith('http')) {
      return this.data;
    }
    return null;
  }

  public hasBinaryData(): boolean {
    // Consider URL strings as processed data, not binary
    if (typeof this.data === "string") {
      return this.data.startsWith('http');  // URL is considered as processed data
    }
    return true;  // Non-string data is binary
  }

  public enableIndex(options: ImageIndexOptions = {}): Image {
    // Set index to true when this method is called
    this.indexEnabled = true;
    
    // MIME type validation happens here when indexing is enabled
    if (!Image.isValidMimeType(this.mimeType)) {
      const supportedList = Image.SUPPORTED_MIME_TYPES.join(", ");
      throw new Error(`Unsupported mime type: '${this.mimeType}'. Supported types are: ${supportedList}`);
    }
    
    // Validate and set embedding model if provided
    if (options.embModel !== undefined) {
      if (!Image.isValidEmbModel(options.embModel)) {
        const supportedList = Models.TextToEmbedding.OpenAI.values().join(", ");
        throw new Error(`Invalid embedding model: '${options.embModel}' is not supported. Supported models are: ${supportedList}`);
      }
      this.embModel = options.embModel;
    }
    
    // Validate and set vision model if provided
    if (options.visionModel !== undefined) {
      if (!Image.isValidVisionModel(options.visionModel)) {
        const supportedList = Models.ImageToText.OpenAI.values().join(", ");
        throw new Error(`Invalid vision model: '${options.visionModel}' is not supported. Supported models are: ${supportedList}`);
      }
      this.visionModel = options.visionModel;
    }
    
    // Set other parameters if provided
    if (options.maxChunkSize !== undefined) {
      this.maxChunkSize = options.maxChunkSize;
    }
    
    if (options.chunkOverlap !== undefined) {
      this.chunkOverlap = options.chunkOverlap;
    }
    
    if (options.isSeparatorRegex !== undefined) {
      this.isSeparatorRegex = options.isSeparatorRegex;
    }
    
    if (options.separators !== undefined) {
      this.separators = options.separators;
    }
    
    if (options.keepSeparator !== undefined) {
      this.keepSeparator = options.keepSeparator;
    }
    
    return this;
  }

  private static isValidData(data: string): boolean {
    if (typeof data !== "string" || data.trim().length === 0) {
      return false;
    }
    // Accept URLs as valid data
    if (data.startsWith('http')) {
      return true;
    }
    try {
      // Check if the string is valid base64
      // Use stricter validation - base64 should only contain valid base64 characters
      if (!/^[A-Za-z0-9+/]+=*$/.test(data)) {
        return false;
      }
      Buffer.from(data, "base64");
      return true;
    } catch {
      return false;
    }
  }
  
  private static isValidMimeType(mimeType: string): boolean {
    return Image.SUPPORTED_MIME_TYPES.includes(mimeType);
  }

  private static isValidEmbModel(embModel: string): boolean {
    return Models.TextToEmbedding.OpenAI.values().includes(embModel);
  }

  private static isValidVisionModel(visionModel: string): boolean {
    return Models.ImageToText.OpenAI.values().includes(visionModel);
  }

  public get chunks(): string[] {
    return this._chunks;
  }

  public _serialize(): Record<string, any> {
    // Start with required fields
    const result: Record<string, any> = {
      mime_type: this.mimeType,
      index: this.indexEnabled,  // Always include index flag
    };
    
    // Never include binary/base64 data in JSON - always send as separate binary
    // The API layer will use getBinaryData() to extract bytes for transmission

    // Add other fields only if they are not null (when set via enableIndex() method)
    if (this.embModel !== null) {
      result.emb_model = this.embModel;
    }
    if (this.visionModel !== null) {
      result.vision_model = this.visionModel;
    }
    if (this.maxChunkSize !== null) {
      result.max_chunk_size = this.maxChunkSize;
    }
    if (this.chunkOverlap !== null) {
      result.chunk_overlap = this.chunkOverlap;
    }
    if (this.isSeparatorRegex !== null) {
      result.is_separator_regex = this.isSeparatorRegex;
    }
    if (this.separators !== null) {
      result.separators = this.separators;
    }
    if (this.keepSeparator !== null) {
      result.keep_separator = this.keepSeparator;
    }

    // Include chunks and data (if it's a URL string)
    result.chunks = this._chunks;
    if (typeof this.data === 'string') {
      result.data = this.data;
    }
    
    return {
      "xImage": result
    };
  }

  static _deserialize(data: Record<string, any>): Image {
    // Check if the data is wrapped with 'xImage'
    if ("xImage" in data) {
      data = data["xImage"];
    }
    
    if (!("mime_type" in data)) {
      throw new Error("JSON data must include 'mime_type' under 'xImage'.");
    }
    
    // Get data from database (can be URL or binary data)
    // After processing, the data field contains the public URL  
    const dataValue = data["data"];
    const instance = new Image(dataValue || "");
    
    // Override the auto-detected mime_type with the one from database
    instance.mimeType = data["mime_type"];
    
    // Set indexEnabled directly from database field (no validation needed)
    instance.indexEnabled = data["index"] || false;
    
    // Set all attributes directly without calling enableIndex() since
    // this data comes from database and was already validated server-side
    if ("emb_model" in data) {
      instance.embModel = data["emb_model"];
    }
    if ("vision_model" in data) {
      instance.visionModel = data["vision_model"];
    }
    if ("max_chunk_size" in data) {
      instance.maxChunkSize = data["max_chunk_size"];
    }
    if ("chunk_overlap" in data) {
      instance.chunkOverlap = data["chunk_overlap"];
    }
    if ("is_separator_regex" in data) {
      instance.isSeparatorRegex = data["is_separator_regex"];
    }
    if ("separators" in data) {
      instance.separators = data["separators"];
    }
    if ("keep_separator" in data) {
      instance.keepSeparator = data["keep_separator"];
    }

    // Set chunks if they exist in the JSON
    if ("chunks" in data) {
      instance._chunks = data["chunks"] || [];
    }
    
    return instance;
  }

  public toString(): string {
    // Check if data contains a URL
    if (typeof this.data === 'string' && this.data.startsWith('http')) {
      return `Image(${this.data})`;
    }
    if (this._chunks.length > 0) {
      return `Image("${this._chunks[0]}")`;
    }
    return "Image(<raw data>)";
  }

  private static isValidFilePath(path: string): boolean {
    if (!path || typeof path !== "string") {
      return false;
    }
    
    // Check if file exists and has a supported image extension
    if (Image.isNodeEnvironment()) {
      const fs = require('fs');
      if (fs.existsSync(path)) {
        const lowerPath = path.toLowerCase();
        const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        return supportedExtensions.some(ext => lowerPath.endsWith(ext));
      }
    }
    
    return false;
  }
} 