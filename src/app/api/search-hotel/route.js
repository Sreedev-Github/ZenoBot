import { SerpApiSearch } from "google-search-results-nodejs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const {
      location,
      checkinDate,
      checkoutDate,
      minPrice,
      maxPrice,
      hotelClass,
    } = await req.json();

    const params = {
      engine: "google_hotels",
      q: location || "New Delhi, India",
      hl: "en",
      gl: "in",
      currency: "INR",
      check_in_date: checkinDate,
      check_out_date: checkoutDate,
      min_price: minPrice,
      max_price: maxPrice,
      class: hotelClass,
    };

    const search = new SerpApiSearch(process.env.SERP_API_KEY);

    // Convert callback to proper Promise
    const data = await new Promise((resolve, reject) => {
      search.json(params, (result, error) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    // Process the data after the promise resolves
    if (data.error) {
      console.error("SerpAPI error:", data.error);
      return NextResponse.json({ error: data.error }, { status: 500 });
    }

    // Map the properties data
    const hotels =
      data.properties?.slice(0, 10).map((property) => ({
        name: property.name,
        address: property.address,
        description: property.description,
        link: property.link,
        price: property.rate_per_night?.lowest,
        total_price: property.total_rate?.lowest,
        rating: property.overall_rating,
        reviews: property.reviews,
        hotel_class: property.hotel_class,
        amenities: property.amenities,
        check_in_time: property.check_in_time,
        check_out_time: property.check_out_time,
        thumbnail: property.images?.[0]?.thumbnail,
        location: property.gps_coordinates,
      })) || [];

    // Return the response
    return NextResponse.json({ hotels });
  } catch (error) {
    console.error("Error processing hotel search:", error);
    return NextResponse.json(
      { error: "Failed to search hotels" },
      { status: 500 }
    );
  }
}
