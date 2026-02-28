"use server";

export default async function createUser({
  email,
  givenName,
  familyName,
  picture,
}: {
  email: string;
  givenName: string;
  familyName: string;
  picture: string;
}) {
  const ONENODE_ADMIN_API_KEY = process.env.ONENODE_ADMIN_API_KEY;
  const NEXT_PUBLIC_ONENODE_URL = process.env.NEXT_PUBLIC_ONENODE_URL;

  const bodyContent = {
    email: email,
    given_name: givenName,
    family_name: familyName,
    picture: picture,
    app: "OneNode",
  };

  try {
    const response = await fetch(`${NEXT_PUBLIC_ONENODE_URL}/private/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-API-Key": `${ONENODE_ADMIN_API_KEY}`, // Admin API key
      },
      body: JSON.stringify(bodyContent),
    });

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
