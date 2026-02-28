"use server";
import { getServerToken } from "../auth/getServerToken";

const NEXT_PUBLIC_ONENODE_URL = process.env.NEXT_PUBLIC_ONENODE_URL;
const ONENODE_ADMIN_API_KEY = process.env.ONENODE_ADMIN_API_KEY;

export default async function updateDocs({
  orgId,
  projectId,
  dbName,
  collectionName,
  filter,
  update,
}: {
  orgId: string;
  projectId: string;
  dbName: string;
  collectionName: string;
  filter: object;
  update: object;
}): Promise<any> {
  try {
    const accessToken = await getServerToken();

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const body = {
      filter,
      update,
    };

    const response = await fetch(
      `${NEXT_PUBLIC_ONENODE_URL}/private/org/${orgId}/project/${projectId}/db/${dbName}/collection/${collectionName}/document`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Admin-API-Key": `${ONENODE_ADMIN_API_KEY}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating document: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (e) {
    console.error("An error occurred:", e);
    throw e;
  }
} 