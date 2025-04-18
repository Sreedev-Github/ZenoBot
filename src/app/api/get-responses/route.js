import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect.js";
import ResponseModel from "@/models/Response.model.js";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    // Connect to database
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const limit = parseInt(searchParams.get("limit") || "20");

    let query = {};
    if (sessionId) {
      query.sessionId = sessionId;
    }

    // Fetch responses from MongoDB
    const responses = await ResponseModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);

    if (!responses || responses.length === 0) {
      return NextResponse.json(
        { message: "No responses found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ responses });
  } catch (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 }
    );
  }
}
