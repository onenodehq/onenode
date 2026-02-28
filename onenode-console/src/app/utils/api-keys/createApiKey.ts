"use server";
import { convertKeysToCamel } from "../convertKeysToCamel";
import { getServerToken } from "../auth/getServerToken";

const NEXT_PUBLIC_ONENODE_URL = process.env.NEXT_PUBLIC_ONENODE_URL;

export default async function createApiKey({
  orgId,
  keyName,
  projectId,
}: {
  orgId: string;
  keyName?: string;
  projectId: string;
}): Promise<apiKey> {
  try {
    const accessToken = await getServerToken();

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const keyNameData = {
      name: keyName || "",
      project_id: projectId,
    };

    const response = await fetch(
      `${NEXT_PUBLIC_ONENODE_URL}/private/org/${orgId}/project/${projectId}/api-key`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(keyNameData),
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching organizations: ${response.statusText}`);
    }

    const data = await response.json();

    const key = convertKeysToCamel(data) as apiKey;

    return key;
  } catch (e) {
    console.error("An error occurred:", e);
    throw e;
  }
}
