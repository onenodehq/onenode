"use server";

export default async function getUserByEmail({ email }: { email: string }) {
  const ONENODE_ADMIN_API_KEY = process.env.ONENODE_ADMIN_API_KEY;
  const NEXT_PUBLIC_ONENODE_URL = process.env.NEXT_PUBLIC_ONENODE_URL;

  try {
    const response = await fetch(
      `${NEXT_PUBLIC_ONENODE_URL}/private/user/email?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-API-Key": `${ONENODE_ADMIN_API_KEY}`, // Admin API key
        },
      }
    );

    if (!response.ok) {
      console.log(response);
      throw new Error();
    }

    const data: UserProfile = await response.json();

    return data;
  } catch (error) {
    console.error(error);
  }
}
