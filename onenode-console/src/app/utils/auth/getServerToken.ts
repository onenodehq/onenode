"use server";
import { getToken } from "@auth/core/jwt";
// source: https://github.com/nextauthjs/next-auth/issues/7913  user: alinasiri8102
import { cookies, headers } from "next/headers";

export async function getServerToken() {
  const req: any = {
    headers: Object.fromEntries(headers()),
    cookies: Object.fromEntries(
      cookies()
        .getAll()
        .map((c) => [c.name, c.value])
    ),
  };

  try {
    // https://github.com/nextauthjs/next-auth/discussions/9133
    const token = await getToken({
      req,
      raw: true,
      secret: process.env.AUTH_SECRET!,
      secureCookie: true,
      salt: "__Secure-authjs.session-token",
    });
    return token;
  } catch (error) {
    console.log(error);
  }
}
