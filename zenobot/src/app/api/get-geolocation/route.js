// Get geo location using geocode location API

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Parse the JSON body correctly in Next.js App Router
    const body = await req.json();

    if (!body.location) {
      return NextResponse.json(
        { error: "A location needs to be provided" },
        { status: 403 }
      );
    }

    const { location } = body;

    // Use encodeURIComponent for safe URL parameters
    const response = await fetch(
      `https://geocode.maps.co/search?q=${encodeURIComponent(
        location
      )}&api_key=${process.env.GEOCODE_API_KEY}`
    );

    console.log("Response:", response);

    if (!response.ok) {
      throw new Error(`Geocode API returned status ${response.status}`);
    }

    const data = await response.json();
    console.log("Data:", data);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error getting geolocation:", error.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
