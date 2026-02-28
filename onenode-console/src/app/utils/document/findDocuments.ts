"use server";
import { getServerToken } from "../auth/getServerToken";
import { DocumentsResponse } from "./getDocuments";

const NEXT_PUBLIC_ONENODE_URL = process.env.NEXT_PUBLIC_ONENODE_URL;

export interface FindDocumentsParams {
  orgId: string;
  projectId: string;
  dbName: string;
  collectionName: string;
  filter?: object;
  projection?: object;
  sort?: Array<[string, number]>;
  skip?: number;
  limit?: number;
  page?: number;
}

interface RequestBody {
  filter: object;
  projection?: object;
  sort?: Array<[string, number]>;
  skip?: number;
  limit?: number;
  page?: number;
  [key: string]: any;
}

export default async function findDocuments({
  orgId,
  projectId,
  dbName,
  collectionName,
  filter = {},
  projection,
  sort,
  skip,
  limit = 20,
  page = 1,
}: FindDocumentsParams): Promise<DocumentsResponse> {
  try {
    const accessToken = await getServerToken();

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const requestBody: RequestBody = {
      filter,
      projection,
      sort,
      skip,
      limit,
      page,
    };

    // Remove undefined values
    Object.keys(requestBody).forEach(
      (key) => requestBody[key] === undefined && delete requestBody[key]
    );
    console.log("findDocuments is called");
    const response = await fetch(
      `${NEXT_PUBLIC_ONENODE_URL}/private/org/${orgId}/project/${projectId}/db/${dbName}/collection/${collectionName}/document/find`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`Error finding documents: ${response.statusText}`);
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
    console.error("An error occurred in findDocuments:", e);
    throw e;
  }
} 