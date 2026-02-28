"use server";
import { getServerToken } from "../auth/getServerToken";
import { DocumentsResponse } from "./getDocuments";

const NEXT_PUBLIC_ONENODE_URL = process.env.NEXT_PUBLIC_ONENODE_URL;
const ONENODE_ADMIN_API_KEY = process.env.ONENODE_ADMIN_API_KEY;
export interface QueryDocumentsParams {
  orgId: string;
  projectId: string;
  dbName: string;
  collectionName: string;
  query: string;
  filter?: object;
  projection?: object;
  top_k?: number;
  emb_model?: string;
}

interface RequestBody {
  query: string;
  filter?: object;
  projection?: object;
  top_k?: number;
  emb_model?: string;
  [key: string]: any; // Add index signature to allow string indexing
}

// Response type specific to query documents
export interface QueryDocumentsResponse {
  matches: {
    chunk: string;
    path: string;
    chunk_n: number;
    score: number;
    document: any;
  }[];
}

export default async function queryDocuments({
  orgId,
  projectId,
  dbName,
  collectionName,
  query,
  filter = {},
  projection,
  top_k = 10,
  emb_model = "text-embedding-3-small",
}: QueryDocumentsParams): Promise<DocumentsResponse> {
  try {
    const accessToken = await getServerToken();

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const requestBody: RequestBody = {
      query,
      filter,
      projection,
      top_k,
      emb_model,
    };
    console.log("queryDocuments is called");
    // Remove undefined values
    Object.keys(requestBody).forEach(
      (key) => requestBody[key] === undefined && delete requestBody[key]
    );

    const response = await fetch(
      `${NEXT_PUBLIC_ONENODE_URL}/private/org/${orgId}/project/${projectId}/db/${dbName}/collection/${collectionName}/document/query`,
      {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "X-Admin-API-Key": `${ONENODE_ADMIN_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`Error querying documents: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);
    // Extract documents from the matches array and add score and chunk information to each document
    const documents = data.matches.map((match: any) => ({
      ...match.document,
      _query_score: match.score, // Add score as a special field
      _query_chunk: match.chunk, // Add the matched chunk text
      _query_path: match.path,   // Add the path to the matched field
      _query_chunk_n: match.chunk_n // Add the chunk number
    }));
    
    // Create a pagination object to match the DocumentsResponse interface
    // Since query endpoint doesn't provide pagination, create a simplified version
    return {
      documents: documents || [],
      pagination: {
        total_count: documents.length,
        total_pages: 1,
        current_page: 1,
        page_size: documents.length,
        has_next: false,
        has_prev: false
      }
    };
  } catch (e) {
    console.error("An error occurred in queryDocuments:", e);
    throw e;
  }
} 