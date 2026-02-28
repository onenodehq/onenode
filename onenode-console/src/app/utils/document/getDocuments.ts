"use server";
import { getServerToken } from "../auth/getServerToken";

const NEXT_PUBLIC_ONENODE_URL = process.env.NEXT_PUBLIC_ONENODE_URL;

export interface PaginationMetadata {
  total_count: number;
  total_pages: number;
  current_page: number;
  page_size?: number;
  has_next?: boolean;
  has_prev?: boolean;
}

export interface DocumentsResponse {
  documents: Document[];
  pagination: PaginationMetadata;
}

export default async function getDocuments({
  orgId,
  projectId,
  dbName,
  collectionName,
  page = 1,
  limit = 10,
}: {
  orgId: string;
  projectId: string;
  dbName: string;
  collectionName: string;
  page?: number;
  limit?: number;
}): Promise<DocumentsResponse> {
  try {
    const accessToken = await getServerToken();

    if (!accessToken) {
      throw new Error("No access token found");
    }
    console.log("getDocuments is called");


    const response = await fetch(
      `${NEXT_PUBLIC_ONENODE_URL}/private/org/${orgId}/project/${projectId}/db/${dbName}/collection/${collectionName}/document/list?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error getting collection items: ${response.statusText}`);
    }

    const data = await response.json();
    
    // API consistently returns { documents: [...], pagination: {...} }
    return {
      documents: data.documents || [],
      pagination: {
        ...data.pagination,
        page_size: limit,
        has_next: data.pagination?.current_page < data.pagination?.total_pages,
        has_prev: data.pagination?.current_page > 1
      }
    };
  } catch (e) {
    console.error("An error occurred in getDocuments:", e);
    throw e;
  }
}
