"use server";
import { getServerToken } from "../auth/getServerToken";

const NEXT_PUBLIC_ONENODE_URL = process.env.NEXT_PUBLIC_ONENODE_URL;
const ONENODE_ADMIN_API_KEY = process.env.ONENODE_ADMIN_API_KEY;

export default async function deleteDocs({
  orgId,
  projectId,
  dbName,
  collectionName,
  doc_ids,
}: {
  orgId: string;
  projectId: string;
  dbName: string;
  collectionName: string;
  doc_ids: (string | object)[];
}): Promise<void> {
  try {
    const accessToken = await getServerToken();

    if (!accessToken) {
      throw new Error("No access token found");
    }
    const body = {
      filter: { _id: { $in: doc_ids } },
    };

    const response = await fetch(
      `${NEXT_PUBLIC_ONENODE_URL}/private/org/${orgId}/project/${projectId}/db/${dbName}/collection/${collectionName}/document`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Admin-API-Key": `${ONENODE_ADMIN_API_KEY}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`Error getting collections: ${response.statusText}`);
    }

    return;
  } catch (e) {
    console.error("An error occurred:", e);
    throw e;
  }
}
