"use server";
import { getServerToken } from "../auth/getServerToken";

const NEXT_PUBLIC_ONENODE_URL = process.env.NEXT_PUBLIC_ONENODE_URL;
const ONENODE_ADMIN_API_KEY = process.env.ONENODE_ADMIN_API_KEY;

export default async function createCollection({
  orgId,
  projectId,
  dbName,
  collectionName,
}: {
  orgId: string;
  projectId: string;
  dbName: string;
  collectionName: string;
}): Promise<void> {
  try {
    const accessToken = await getServerToken();

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const collectionNameData = {
      collection_name: collectionName,
    };

    const response = await fetch(
      `${NEXT_PUBLIC_ONENODE_URL}/private/org/${orgId}/project/${projectId}/db/${dbName}/collection`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Admin-API-Key": `${ONENODE_ADMIN_API_KEY}`,
        },
        body: JSON.stringify(collectionNameData),
      }
    );

    if (!response.ok) {
      throw new Error(`Error creating collection: ${response.statusText}`);
    }

    return;
  } catch (e) {
    console.error("An error occurred:", e);
    throw e;
  }
}
