import { NextResponse } from "next/server";

const GOOGLE_PLACES_DETAILS_ENDPOINT = "https://maps.googleapis.com/maps/api/place/details/json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId");
  const sessionToken = searchParams.get("sessionToken");

  if (!placeId) {
    return NextResponse.json({ error: "Missing placeId" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GOOGLE_PLACES_API_KEY environment variable." },
      { status: 500 }
    );
  }

  const url = new URL(GOOGLE_PLACES_DETAILS_ENDPOINT);
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("fields", "geometry/location,name,formatted_address");
  url.searchParams.set("language", "en");

  if (sessionToken) {
    url.searchParams.set("sessiontoken", sessionToken);
  }

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok || data.status !== "OK") {
      const message =
        data?.error_message || data?.status || `Google Places Details API responded with status ${response.status}`;
      console.error("[google-places-details]", message, data);
      return NextResponse.json({ error: message }, { status: 502 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[google-places-details]", error);
    return NextResponse.json(
      { error: error.message ?? "Unable to fetch place details" },
      { status: 500 }
    );
  }
}

