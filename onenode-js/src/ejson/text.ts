import { Models } from "./models";

export interface TextIndexOptions {
  embModel?: string;
  maxChunkSize?: number;
  chunkOverlap?: number;
  isSeparatorRegex?: boolean;
  separators?: string[] | null;
  keepSeparator?: boolean;
}

export class Text {
  private text: string;
  private chunks: string[];
  private embModel: string | null;
  private maxChunkSize: number | null;
  private chunkOverlap: number | null;
  private isSeparatorRegex: boolean | null;
  private separators: string[] | null;
  private keepSeparator: boolean | null;
  private indexEnabled: boolean;

  constructor(text: string) {
    if (!Text.isValidText(text)) {
      throw new Error("Invalid text: must be a non-empty string.");
    }

    this.text = text;
    this.chunks = [];
    
    // Optional parameters - set to null initially
    this.embModel = null;
    this.maxChunkSize = null;
    this.chunkOverlap = null;
    this.isSeparatorRegex = null;
    this.separators = null;
    this.keepSeparator = null;
    this.indexEnabled = false; // Default to false when index() isn't called
  }

  public enableIndex(options: TextIndexOptions = {}): Text {
    // Set index to true when this method is called
    this.indexEnabled = true;
    
    // Validate and set embedding model if provided
    if (options.embModel !== undefined) {
      if (!Text.isValidEmbModel(options.embModel)) {
        throw new Error(`Invalid embedding model: ${options.embModel} is not supported.`);
      }
      this.embModel = options.embModel;
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

  private static isValidText(text: string): boolean {
    return typeof text === "string" && text.trim().length > 0;
  }

  private static isValidEmbModel(embModel: string): boolean {
    return Models.TextToEmbedding.OpenAI.values().includes(embModel);
  }

  public _serialize(): Record<string, any> {
    const result: Record<string, any> = {
      text: this.text,
      chunks: this.chunks,
      index: this.indexEnabled, // Always include index flag
    };
    
    // Add other fields only if they are not null (when set via index() method)
    if (this.embModel !== null) {
      result.emb_model = this.embModel;
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
    
    return {
      "xText": result
    };
  }

  static _deserialize(data: Record<string, any>): Text {
    // Check if the data is wrapped with 'xText'
    if ("xText" in data) {
      data = data["xText"];
    }
    
    const text = data["text"];
    if (text === undefined || text === null) {
      throw new Error("JSON data must include 'text' under 'xText'.");
    }

    // Create the instance with just the text
    const instance = new Text(text);
    
    // If index is true in the data, call enableIndex() to set up indexing
    if (data["index"] === true) {
      instance.enableIndex({
        embModel: data["emb_model"],
        maxChunkSize: data["max_chunk_size"],
        chunkOverlap: data["chunk_overlap"],
        isSeparatorRegex: data["is_separator_regex"],
        separators: data["separators"],
        keepSeparator: data["keep_separator"],
      });
    }
    // Otherwise just set the attributes without setting indexEnabled=true
    else {
      if ("emb_model" in data) {
        instance.embModel = data["emb_model"];
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
    }

    instance.chunks = data["chunks"] || [];
    return instance;
  }

  public toString(): string {
    return `Text("${this.text}")`;
  }
}
