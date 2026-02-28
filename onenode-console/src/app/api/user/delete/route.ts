import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const ONENODE_URL = process.env.NEXT_PUBLIC_ONENODE_URL;
    const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

    if (!ADMIN_API_KEY) {
      console.error("Admin API key not configured");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const response = await fetch(`${ONENODE_URL}/private/user/${userId}`, {
      method: "DELETE",
      headers: {
        "X-Admin-API-Key": ADMIN_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error deleting user:", response.status, errorText);
      return NextResponse.json(
        { message: "Failed to delete user account" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete user API route:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 