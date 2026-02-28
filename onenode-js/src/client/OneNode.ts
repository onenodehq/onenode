import { Database } from "./Database";

export class OneNode {
  private projectId: string;
  private apiKey: string;

  // Helper method to check if we're in Node.js environment
  private static isNodeEnvironment(): boolean {
    return typeof process !== 'undefined' && process.versions && !!process.versions.node;
  }

  constructor() {
    // Check if we're in a browser environment and throw an error
    if (!OneNode.isNodeEnvironment()) {
      throw new Error(
        "OneNode client can only be initialized in Node.js server-side environments. " +
        "It requires access to environment variables and file system operations that are not available in browsers. " +
        "Please use this client in your backend/server code only."
      );
    }

    this.projectId = process.env.ONENODE_PROJECT_ID || "";
    this.apiKey = process.env.ONENODE_API_KEY || "";

    if (!this.apiKey) {
      throw new Error(
        "Missing API Key: Please set the ONENODE_API_KEY environment variable. " +
        "Tip: Ensure your environment file (e.g., .env) is loaded."
      );
    }
    
    if (!this.projectId) {
      throw new Error(
        "Missing Project ID: Please set the ONENODE_PROJECT_ID environment variable. " +
        "Tip: Ensure your environment file (e.g., .env) is loaded."
      );
    }
  }

  public db(dbName: string): Database {
    return new Database(this.apiKey, this.projectId, dbName);
  }
}
