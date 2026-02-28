"use server";
import { Document } from "mongodb";
import { getServerToken } from "../auth/getServerToken";

const NEXT_PUBLIC_ONENODE_URL = process.env.NEXT_PUBLIC_ONENODE_URL;

export default async function getOrg({
  orgId,
}: {
  orgId: string;
}): Promise<Document> {
  try {
    const accessToken = await getServerToken();

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(
      `${NEXT_PUBLIC_ONENODE_URL}/private/org/${orgId}`,
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

    const result: Document = data;

    return result;
  } catch (e) {
    console.error("An error occurred:", e);
    throw e;
  }
}
