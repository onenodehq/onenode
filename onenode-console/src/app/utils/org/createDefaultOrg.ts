"use server";
import { getServerToken } from "../auth/getServerToken";

const NEXT_PUBLIC_ONENODE_URL = process.env.NEXT_PUBLIC_ONENODE_URL;
const ONENODE_ADMIN_API_KEY = process.env.ONENODE_ADMIN_API_KEY;

export default async function createDefaultOrg(): Promise<void> {
  try {
    const accessToken = await getServerToken();

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${NEXT_PUBLIC_ONENODE_URL}/private/org/default`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Admin-API-Key": `${ONENODE_ADMIN_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error fetching organizations: ${response.statusText}`);
    }

    return;
  } catch (e) {
    console.error("An error occurred:", e);
    throw e;
  }
}
