export class Models {
  /**
   * All supported model constants, grouped by task and vendor.
   */

  static TextToEmbedding = class {
    /**
     * Embedding models, by vendor.
     */
    static OpenAI = class {
      static readonly TEXT_EMBEDDING_3_SMALL = "text-embedding-3-small";
      static readonly TEXT_EMBEDDING_3_LARGE = "text-embedding-3-large";
      static readonly TEXT_EMBEDDING_ADA_002 = "text-embedding-ada-002";
      
      static values(): string[] {
        return [
          this.TEXT_EMBEDDING_3_SMALL,
          this.TEXT_EMBEDDING_3_LARGE,
          this.TEXT_EMBEDDING_ADA_002,
        ];
      }
    };
  };

  static ImageToText = class {
    /**
     * Vision-to-text models, by vendor.
     */
    static OpenAI = class {
      static readonly GPT_4O = "gpt-4o";
      static readonly GPT_4O_MINI = "gpt-4o-mini";
      static readonly O4_MINI = "o4-mini";
      static readonly O3 = "o3";
      static readonly O1 = "o1";
      static readonly O1_PRO = "o1-pro";
      static readonly GPT_4_1 = "gpt-4.1";
      static readonly GPT_4_1_MINI = "gpt-4.1-mini";
      static readonly GPT_4_1_NANO = "gpt-4.1-nano";
      
      static values(): string[] {
        return [
          this.GPT_4O,
          this.GPT_4O_MINI,
          this.O4_MINI,
          this.O3,
          this.O1,
          this.O1_PRO,
          this.GPT_4_1,
          this.GPT_4_1_MINI,
          this.GPT_4_1_NANO,
        ];
      }
    };
  };
} 