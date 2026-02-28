"use server";

import { getServerToken } from "../auth/getServerToken";

export default async function getUser() {
  const token = await getServerToken();

  const NEXT_PUBLIC_ONENODE_URL = process.env.NEXT_PUBLIC_ONENODE_URL;

  try {
    const response = await fetch(`${NEXT_PUBLIC_ONENODE_URL}/private/user/token`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.log(response);
      throw new Error();
    }

    const data: UserProfile = await response.json();

    return data;
  } catch (error) {
    console.error("getuser error", error);
  }
}
