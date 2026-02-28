"use server";
import { getServerToken } from "../auth/getServerToken";

const NEXT_PUBLIC_ONENODE_URL = process.env.NEXT_PUBLIC_ONENODE_URL;

export default async function deleteApiKey({
  orgId,
  projectId,
  hashValue,
}: {
  orgId: string;
  projectId: string;
  hashValue: string;
}): Promise<void> {
  try {
    const accessToken = await getServerToken();

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const keyNameData = {
      hash_value: hashValue || "",
    };

    const response = await fetch(
      `${NEXT_PUBLIC_ONENODE_URL}/private/org/${orgId}/project/${projectId}/api-key`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(keyNameData),
      }
    );

    if (!response.ok) {
      throw new Error(`Error deleting API key: ${response.statusText}`);
    }

    return;
  } catch (e) {
    console.error("An error occurred:", e);
    throw e;
  }
}
