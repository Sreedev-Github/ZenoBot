import { NextResponse } from "next/server";
import Amadeus from "amadeus";

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
});

export async function searchHotels(geoCode, radius = 5, ratings = 3) {
  try {
    const response = await amadeus.referenceData.locations.hotels.byGeocode.get(
      {
        latitude: geoCode.latitude,
        longitude: geoCode.longitude,
        radius: radius,
        radiusUnit: "KM",
        ratings: ratings,
      }
    );
    console.log("Hotles fetched successfully");

    const data = response.data.slice(0, 10);

    console.log(data);

    return data;
  } catch (error) {
    console.error("Error fetching hotel data:", error);
    throw error;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function extractHotelDetails(hotelData) {
  try {
    const combinedData = [];
    for (const hotel of hotelData) {
      let success = false;
      let attempts = 0;
      while (!success) {
        await delay(100); // short delay before each retry
        try {
          const response = await amadeus.eReputation.hotelSentiments.get({
            hotelIds: hotel.hotelId,
          });
          const sentiments = response.data?.[0]?.sentiments || {};
          combinedData.push({ ...hotel, sentiments });
          success = true;
        } catch (error) {
          if (error.code === 429) {
            attempts++;
            console.warn("Rate limit reached. Retrying...");
            await delay(1000 * attempts); // exponential backoff
          } else {
            throw error;
          }
        } finally {
          console.log("Hotel data with sentiments:", combinedData);
        }
      }
    }
    return combinedData;
  } catch {
    console.error("Error fetching hotel sentiments:", error);
    throw error;
  }
}
