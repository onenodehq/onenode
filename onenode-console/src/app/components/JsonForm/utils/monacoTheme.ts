import { languages } from "monaco-editor";

/**
 * Custom language definition for BSON JSON in Monaco editor
 */
export const bsonJsonLanguage: languages.IMonarchLanguage = {
  defaultToken: "",
  tokenPostfix: ".bson-json",

  // Shared rules that can be referenced in multiple states
  brackets: [
    { open: "{", close: "}", token: "delimiter.curly" },
    { open: "[", close: "]", token: "delimiter.square" },
  ],

  tokenizer: {
    root: [
      // BSON-specific types
      [/ObjectId\('[0-9A-Fa-f]{24}'\)/, "bson-oid"],
      [/Date\('[^']*'\)/, "bson-date"],
      [/Binary\('[^']*'\)/, "bson-binary"],
      [/Text\('[^']*'\)/, "bson-text"],
      [/Image\('[^']*'\)/, "bson-image"],

      // JSON syntax
      [/[{}[\]]/, "@brackets"],
      [/"/, { token: "string.quote", next: "@string" }],
      [/\b(true|false|null)\b/, "keyword"],
      [/-?\d+(\.\d+)?([eE][+\-]?\d+)?/, "number"],
      [/[,:]/, "delimiter"],
      [/\s+/, "white"],
    ],

    string: [
      [/[^\\"]+/, "string"],
      [/\\./, "string.escape.invalid"],
      [/"/, { token: "string.quote", next: "@pop" }],
    ],
  },
};

/**
 * Custom theme for BSON JSON in Monaco editor
 */
export const bsonJsonTheme = {
  base: "vs" as "vs-dark" | "vs" | "hc-black",
  inherit: true,
  rules: [
    { token: "bson-oid", foreground: "FF9D00" }, // Bright orange for ObjectId
    { token: "bson-date", foreground: "4EC9B0" }, // Teal for Date
    { token: "bson-binary", foreground: "DCDCAA" }, // Gold for Binary
    { token: "bson-text", foreground: "E0524E" }, // Red for Text (matches landing page)
    { token: "bson-image", foreground: "5A8BBF" }, // Blue for Image (matches landing page)
    { token: "string", foreground: "CE9178" }, // Soft red for strings
    { token: "number", foreground: "B5CEA8" }, // Soft green for numbers
    { token: "keyword", foreground: "569CD6" }, // Blue for keywords
    { token: "delimiter", foreground: "D4D4D4" }, // Light gray for delimiters
    { token: "delimiter.curly", foreground: "D4D4D4" }, // Light gray for curly braces
    { token: "delimiter.square", foreground: "D4D4D4" }, // Light gray for square brackets
  ],
  colors: {
    "editor.background": "#FFFFFF",
    "editor.foreground": "#000000",
    "editorLineNumber.foreground": "#858585",
    "editorCursor.foreground": "#000000",
    "editor.selectionBackground": "#ADD6FF",
    "editor.inactiveSelectionBackground": "#E5EBF1",
    "editorWhitespace.foreground": "#B3B3B3",
  },
}; 