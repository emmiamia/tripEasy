import { NextResponse } from "next/server";

const GOOGLE_GEOCODE_ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const city = searchParams.get("city");

  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GOOGLE_PLACES_API_KEY environment variable." },
      { status: 500 }
    );
  }

  const url = new URL(GOOGLE_GEOCODE_ENDPOINT);
  url.searchParams.set("address", city ? `${address}, ${city}` : address);
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok || data.status !== "OK" || !data.results?.length) {
      const message =
        data?.error_message || data?.status || `Google Geocoding API responded with status ${response.status}`;
      console.error("[google-geocode]", message, data);
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const result = data.results[0];
    return NextResponse.json({
      location: result.geometry?.location,
      formattedAddress: result.formatted_address
    });
  } catch (error: any) {
    console.error("[google-geocode]", error);
    return NextResponse.json(
      { error: error.message ?? "Unable to geocode address" },
      { status: 500 }
    );
  }
}

