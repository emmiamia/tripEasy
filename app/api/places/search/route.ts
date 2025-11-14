import { NextResponse } from "next/server";

const GOOGLE_PLACES_ENDPOINT = "https://maps.googleapis.com/maps/api/place/autocomplete/json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const sessionToken = searchParams.get("sessionToken");

  if (!query || query.trim().length < 3) {
    return NextResponse.json({ predictions: [] });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GOOGLE_PLACES_API_KEY environment variable." },
      { status: 500 }
    );
  }

  const url = new URL(GOOGLE_PLACES_ENDPOINT);
  url.searchParams.set("input", query);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("types", "(cities)");
  url.searchParams.set("language", "en");

  if (sessionToken) {
    url.searchParams.set("sessiontoken", sessionToken);
  }

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok || data.status !== "OK") {
      const message =
        data?.error_message || data?.status || `Google Places API responded with status ${response.status}`;
      console.error("[google-places]", message, data);
      return NextResponse.json({ error: message }, { status: 502 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[google-places]", error);
    return NextResponse.json(
      { error: error.message ?? "Unable to fetch places predictions" },
      { status: 500 }
    );
  }
}

