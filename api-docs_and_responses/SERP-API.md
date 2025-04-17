# Google Hotels API - Parameter Guide

This document provides an overview of the parameters used in the Google Hotels API, including search queries, localization settings, advanced filters, and property details.

## Search Query

### `q` (Required)

Defines the search query. You can use any query that you would enter in a regular Google Hotels search.

## Localization

### `gl` (Optional)

Defines the country for the Google Hotels search using a two-letter country code (e.g., `us` for the United States, `uk` for the United Kingdom, or `fr` for France). Check the Google countries page for a full list of supported codes.

### `hl` (Optional)

Defines the language for the Google Hotels search using a two-letter language code (e.g., `en` for English, `es` for Spanish, or `fr` for French). Check the Google languages page for a full list of supported codes.

### `currency` (Optional)

Defines the currency of the returned prices. Defaults to `USD`. Check the Google Travel Currencies page for a full list of supported currency codes.

## Advanced Parameters

### `check_in_date` (Required)

Defines the check-in date in the format `YYYY-MM-DD` (e.g., `2025-03-18`).

### `check_out_date` (Required)

Defines the check-out date in the format `YYYY-MM-DD` (e.g., `2025-03-19`).

### `adults` (Optional)

Defines the number of adults. Default is `2`.

### `children` (Optional)

Defines the number of children. Default is `0`.

### `children_ages` (Optional)

Defines the ages of children (range: 1 to 17).

- Single child: `5`
- Multiple children: `5,8,10`

Number of ages provided must match the number of children.

## Advanced Filters

### `sort_by` (Optional)

Defines sorting order. Default is relevance.

- `3` - Lowest price
- `8` - Highest rating
- `13` - Most reviewed

### `min_price` / `max_price` (Optional)

Defines the price range for search results.

### `property_types` (Optional)

Filters results to specific property types. Check the Google Hotels Property Types page for valid values.

- Single type: `17`
- Multiple types: `17,12,18`

### `amenities` (Optional)

Filters results to properties with specified amenities. Check the Google Hotels Amenities page for valid values.

- Single amenity: `35`
- Multiple amenities: `35,9,19`

### `rating` (Optional)

Filters results by rating:

- `7` - 3.5+
- `8` - 4.0+
- `9` - 4.5+

## Hotels Filters

### `brands` (Optional)

Filters results by hotel brands. IDs are in the JSON output under `brands` array.

- Single brand: `33`
- Multiple brands: `33,67,101`

_Not available for Vacation Rentals._

### `hotel_class` (Optional)

Filters results by hotel star rating:

- `2` - 2-star
- `3` - 3-star
- `4` - 4-star
- `5` - 5-star

_Not available for Vacation Rentals._

### `free_cancellation` (Optional)

Shows only properties offering free cancellation.

### `special_offers` (Optional)

Shows only properties with special offers.

### `eco_certified` (Optional)

Shows only eco-certified properties.

_Not available for Vacation Rentals._

## Vacation Rentals Filters

### `vacation_rentals` (Optional)

Searches for Vacation Rentals instead of Hotels.

### `bedrooms` (Optional)

Minimum number of bedrooms (default: `0`).

### `bathrooms` (Optional)

Minimum number of bathrooms (default: `0`).

_Available only for Vacation Rentals._

## Pagination

### `next_page_token` (Optional)

Used to retrieve the next page of results.

## Property Details

### `property_token` (Optional)

Retrieves property details such as name, address, phone, prices, and nearby places. Obtain `property_token` from the Google Hotels Properties API.

## SerpApi Parameters

### `engine` (Required)

Set to `google_hotels` to use the Google Hotels API engine.

### `no_cache` (Optional)

Forces a new fetch from Google Hotels even if a cached version exists.

- `false` (default) - Allows cached results
- `true` - Forces new results

_Do not use `no_cache` with `async`._

### `async` (Optional)

Defines how searches are submitted to SerpApi.

- `false` (default) - Waits for results
- `true` - Submits search and retrieves results later via Searches Archive API

_Do not use `async` with `no_cache`._

### `zero_trace` (Optional)

_Enterprise only._ Enables `ZeroTrace` mode to skip storing search parameters and metadata.

- `false` (default)
- `true` (ZeroTrace mode enabled)

### `api_key` (Required)

Defines the private SerpApi key for authentication.

### `output` (Optional)

Defines output format.

- `json` (default) - Structured JSON results
- `html` - Raw HTML output

## Notes

- Some parameters are exclusive to Hotels or Vacation Rentals.
- Ensure `children_ages` matches the number of `children` specified.
- Use proper country, language, and currency codes.
- Check the respective Google documentation pages for updated lists of supported values.

For more details, refer to the official SerpApi documentation.
