"use server";

type DeleteUserResponse = {
  success: boolean;
  error?: string;
};

const ONENODE_ADMIN_API_KEY = process.env.ONENODE_ADMIN_API_KEY;
const NEXT_PUBLIC_ONENODE_URL = process.env.NEXT_PUBLIC_ONENODE_URL;

export default async function deleteUser(userId: string): Promise<DeleteUserResponse> {
  try {
    // We need to call a backend API route that will handle the admin API key
    const response = await fetch(`${NEXT_PUBLIC_ONENODE_URL}/private/user/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-API-Key": `${ONENODE_ADMIN_API_KEY}`, // Admin API key
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || "Failed to delete user account",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
} 