"use server";
import { convertListToCamelCase } from "../convertKeysToCamel";
import { getServerToken } from "../auth/getServerToken";
const NEXT_PUBLIC_ONENODE_URL = process.env.NEXT_PUBLIC_ONENODE_URL;

export default async function getHashedApiKeys({
  orgId,
  projectId,
}: {
  orgId: string;
  projectId: string;
}) {
  try {
    const accessToken = await getServerToken();

    const response = await fetch(
      `${NEXT_PUBLIC_ONENODE_URL}/private/org/${orgId}/project/${projectId}/api-key`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      if (process.env.NEXT_PUBLIC_NODE_ENV === "dev") {
        console.error(`Error: ${response.status} ${response.statusText}`);
      }
      throw new Error(
        `Failed to fetch hashed API keys: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    console.log("data", data);

    const result = convertListToCamelCase(data) as hashedApiKey[];

    return result;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
