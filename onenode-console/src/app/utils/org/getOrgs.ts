"use server";
import { Document } from "mongodb";
import { getServerToken } from "../auth/getServerToken";

const NEXT_PUBLIC_ONENODE_URL = process.env.NEXT_PUBLIC_ONENODE_URL;

export default async function getOrgs(): Promise<Document[]> {
  try {
    const accessToken = await getServerToken();

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${NEXT_PUBLIC_ONENODE_URL}/private/org`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error fetching organizations: ${response.statusText}`);
    }

    const data: Document[] = await response.json();
    return data;
  } catch (e) {
    console.error("An error occurred:", e);
    throw e;
  }
}
