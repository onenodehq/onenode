"use server";

import { getServerToken } from "./auth/getServerToken";

export default async function sendFeedback({
  email,
  message,
  need_response,
}: {
  email: string;
  message: string;
  need_response: boolean;
}) {
  const accessToken = await getServerToken();

  if (!accessToken) {
    throw new Error("No access token found");
  }
  const BACKEND_URL = process.env.ONENODE_API_DOMAIN;

  message += `\n\nNeed response: ${need_response}`;

  const bodyContent = {
    email: email,
    message: message,
  };

  try {
    const response = await fetch(`${BACKEND_URL}/private/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(bodyContent),
    });

    if (!response.ok) {
      console.log(response);
      throw new Error();
    }

    return;
  } catch (error) {
    console.error(error);
  }
}
