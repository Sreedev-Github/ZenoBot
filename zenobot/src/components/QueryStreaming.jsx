"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function QueryStreaming() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [parsedResponse, setParsedResponse] = useState(null);
  const [parsedDays, setParsedDays] = useState([]);
  const [daysLoaded, setDaysLoaded] = useState(0);
  const [error, setError] = useState(null);
  const responseRef = useRef(null);

  // Try to parse days from the response as it's streaming
  useEffect(() => {
    if (streamingResponse && !parsedResponse) {
      try {
        // First handle refusal responses
        if (
          streamingResponse.includes("can't provide an itinerary") ||
          streamingResponse.includes("I can't assist with") ||
          streamingResponse.includes("I'm unable to create an itinerary")
        ) {
          setError(
            "The AI is unable to create this itinerary. Please try a different query or ensure your destination is within a single state/region."
          );
          setIsLoading(false);
          return;
        }

        // Remove markdown code block delimiters if present
        let validJson = streamingResponse;
        // Strip out ```json at the start and ``` at the end if they exist
        validJson = validJson
          .replace(/^```json\s*/g, "")
          .replace(/\s*```$/g, "");

        // Find opening and last closing bracket to try to get valid JSON
        const firstBracket = validJson.indexOf("{");
        if (firstBracket === -1) return; // No JSON yet

        validJson = validJson.substring(firstBracket);

        // Try different approaches to find complete JSON objects
        // First, try to parse the whole thing
        try {
          const parsed = JSON.parse(validJson);
          if (parsed.itinerary && Array.isArray(parsed.itinerary)) {
            // We have the full response
            setParsedResponse(parsed);
            setParsedDays(parsed.itinerary);
            setDaysLoaded(parsed.itinerary.length);
            return;
          }
        } catch (wholeJsonError) {
          // Expected - the JSON might be incomplete, continue with partial parsing
        }

        // If we couldn't parse the whole thing, try to extract complete days
        // Check for complete days using a more flexible regex approach
        let daysFound = [];
        // This regex will try to match a complete day entry in the itinerary
        const dayRegex = /"date"\s*:\s*"[^"]*"([\s\S]*?)(?="date"|$)/g;
        let dayMatch;
        const dayMatches = [];

        // Find all day objects
        while ((dayMatch = dayRegex.exec(validJson)) !== null) {
          // Make sure we have a complete day object by checking for morning, afternoon, and evening
          const dayText = dayMatch[0];
          if (
            dayText.includes('"morning"') &&
            dayText.includes('"afternoon"') &&
            dayText.includes('"evening"')
          ) {
            dayMatches.push(dayText);
          }
        }

        // If we found new days, try to parse them
        if (dayMatches.length > daysLoaded) {
          for (let i = daysLoaded; i < dayMatches.length; i++) {
            try {
              // Create a valid JSON object for a single day
              let dayJson = dayMatches[i];
              // If this isn't the last day, it might have a trailing comma we need to remove
              if (!dayJson.endsWith("}")) {
                dayJson = dayJson.replace(/,\s*$/, "");
              }

              // Now wrap it in proper JSON structure
              dayJson = `{${dayJson}}`;

              // Fix any trailing commas in arrays
              const fixedDayJson = dayJson.replace(/,\s*\]/g, "]");

              const parsedDay = JSON.parse(fixedDayJson);
              daysFound.push(parsedDay);
            } catch (dayParseError) {
              console.log("Error parsing day:", dayParseError);
              break;
            }
          }

          // If we found any valid days, update the state
          if (daysFound.length > 0) {
            setParsedDays((prev) => [...prev, ...daysFound]);
            setDaysLoaded(daysLoaded + daysFound.length);
          }
        }

        // Also, try the bracket counting approach as a fallback
        if (daysFound.length === 0) {
          let bracketCount = 0;
          let lastCompleteJsonEnd = 0;

          for (let i = 0; i < validJson.length; i++) {
            if (validJson[i] === "{") bracketCount++;
            if (validJson[i] === "}") {
              bracketCount--;
              if (bracketCount === 0) {
                lastCompleteJsonEnd = i + 1;
              }
            }
          }

          if (lastCompleteJsonEnd > 0) {
            const jsonStr = validJson.substring(0, lastCompleteJsonEnd);

            try {
              const parsed = JSON.parse(jsonStr);

              // Check if we have itinerary data and it has more days than we've processed
              if (
                parsed.itinerary &&
                Array.isArray(parsed.itinerary) &&
                parsed.itinerary.length > daysLoaded
              ) {
                // Process only new days
                const newDays = parsed.itinerary.slice(daysLoaded);
                setParsedDays((prev) => [...prev, ...newDays]);
                setDaysLoaded(parsed.itinerary.length);

                // If this seems to be the complete response, store it
                if (
                  parsed.trip &&
                  (bracketCount === 0 || !streamingResponse.includes("..."))
                ) {
                  setParsedResponse(parsed);
                }
              }
            } catch (parseError) {
              // JSON is still incomplete, that's expected
            }
          }
        }
      } catch (err) {
        console.error("Error parsing streaming JSON:", err);
      }
    }
  }, [streamingResponse, daysLoaded, parsedResponse]);

  // Scroll to the bottom of the response container when new content arrives
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [streamingResponse, parsedDays]);

  const preprocessQuery = (originalQuery) => {
    // Add a disclaimer to ensure the model knows to ignore the journey
    return `${originalQuery}\n\nPlease create an itinerary for the destination only. I understand this will only include activities within the destination state/region, and won't include any cross-state travel. I'm only interested in planning what to do at the destination.`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setStreamingResponse("");
    setParsedResponse(null);
    setParsedDays([]);
    setDaysLoaded(0);
    setError(null);

    try {
      // Apply preprocessing to the query
      const processedQuery = preprocessQuery(query);

      // Make a fetch request to your streaming API endpoint
      const response = await fetch("/api/ask-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: processedQuery }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Get the response reader for streaming
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let accumulatedResponse = "";

      // Process the stream
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });

        // Parse the SSE format
        const lines = chunk.split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.substring(6));

              if (data.error) {
                setError(data.error);
                break;
              }

              if (data.content) {
                // Remove markdown delimiters from the content
                let content = data.content;
                if (
                  accumulatedResponse === "" &&
                  content.startsWith("```json")
                ) {
                  content = content.replace(/^```json\s*/g, "");
                }
                if (content.endsWith("```")) {
                  content = content.replace(/\s*```$/g, "");
                }

                accumulatedResponse += content;
                setStreamingResponse(accumulatedResponse);
              }

              if (data.done) {
                // Stream is complete
                break;
              }
            } catch (e) {
              console.error("Error parsing JSON from stream:", e);
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render a single day's itinerary
  const renderDay = (day, idx) => {
    // Safety check for malformed data
    if (!day || !day.morning || !day.afternoon || !day.evening) {
      console.log("Incomplete day data:", day);
      return null;
    }

    return (
      <div
        key={idx}
        className="border rounded-md p-4 bg-white text-gray-800 shadow-sm mt-4 animate-fadeIn"
      >
        <h3 className="text-lg font-semibold border-b pb-2 mb-3">
          Day {idx + 1} - {day.date || ""}
        </h3>

        <div className="space-y-4">
          <div className="bg-yellow-50 p-3 rounded">
            <h4 className="font-medium">Morning</h4>
            <p className="font-semibold">{day.morning.name || "Activity"}</p>
            <p className="text-sm text-gray-600">
              {day.morning.location || "Location"}
            </p>
            <p>{day.morning.description || "Description unavailable"}</p>
            <p className="text-sm italic">
              Transportation: {day.morning.transportation || "Any"}
            </p>
          </div>

          <div className="bg-orange-50 p-3 rounded">
            <h4 className="font-medium">Afternoon</h4>
            <p className="font-semibold">{day.afternoon.name || "Activity"}</p>
            <p className="text-sm text-gray-600">
              {day.afternoon.location || "Location"}
            </p>
            <p>{day.afternoon.description || "Description unavailable"}</p>
            <p className="text-sm italic">
              Transportation: {day.afternoon.transportation || "Any"}
            </p>
          </div>

          <div className="bg-purple-50 p-3 rounded">
            <h4 className="font-medium">Evening</h4>
            <p className="font-semibold">{day.evening.name || "Activity"}</p>
            <p className="text-sm text-gray-600">
              {day.evening.location || "Location"}
            </p>
            <p>{day.evening.description || "Description unavailable"}</p>
            <p className="text-sm italic">
              Transportation: {day.evening.transportation || "Any"}
            </p>
          </div>

          {day.additionalActivities && day.additionalActivities.length > 0 && (
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium">Additional Activities</h4>
              {day.additionalActivities.map((activity, actIdx) => (
                <div key={actIdx} className="mt-2">
                  <p className="font-semibold">{activity.name || "Activity"}</p>
                  <p className="text-sm text-gray-600">
                    {activity.location || "Location"}
                  </p>
                  <p>{activity.description || "Description unavailable"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render trip summary
  const renderTripSummary = () => {
    // Extract trip summary from either parsedResponse or from partial data
    const trip =
      parsedResponse?.trip ||
      (() => {
        try {
          // Try to extract trip info from the streaming data
          // More robust regex that properly captures the entire trip object
          const tripMatch = streamingResponse.match(
            /"trip"\s*:\s*\{[^{]*(((?:\{[^{]*\}|[^{}])*)[^}]*)\}/
          );

          if (tripMatch && tripMatch[0]) {
            // Construct a proper JSON string
            const fullJsonStr = `{"trip":${tripMatch[0].substring(6)}}`;

            try {
              const parsedTrip = JSON.parse(fullJsonStr).trip;
              return parsedTrip;
            } catch (jsonError) {
              // If we can't parse it yet, try a simpler approach
              const basicProps = {};

              // Extract basic properties individually with simpler regex patterns
              const originMatch = streamingResponse.match(
                /"origin"\s*:\s*"([^"]*)"/
              );
              const destMatch = streamingResponse.match(
                /"destination"\s*:\s*"([^"]*)"/
              );
              const durationMatch = streamingResponse.match(
                /"duration"\s*:\s*"([^"]*)"/
              );
              const typeMatch = streamingResponse.match(
                /"type"\s*:\s*"([^"]*)"/
              );

              if (originMatch) basicProps.origin = originMatch[1];
              if (destMatch) basicProps.destination = destMatch[1];
              if (durationMatch) basicProps.duration = durationMatch[1];
              if (typeMatch) basicProps.type = typeMatch[1];

              // Only return if we found at least one property
              return Object.keys(basicProps).length > 0 ? basicProps : null;
            }
          }
        } catch (e) {
          // Just log the error type without the full trace to reduce console noise
          console.log("Trip summary extraction issue:", e.name);
        }
        return null;
      })();

    if (!trip) return null;

    return (
      <div className="text-gray-800 bg-blue-50 p-4 rounded-md mb-4">
        <h3 className="text-lg font-semibold">Trip Summary</h3>
        {trip.origin && (
          <p>
            <strong>Origin:</strong> {trip.origin}
          </p>
        )}
        {trip.destination && (
          <p>
            <strong>Destination:</strong> {trip.destination}
          </p>
        )}
        {trip.duration && (
          <p>
            <strong>Duration:</strong> {trip.duration}
          </p>
        )}
        {trip.type && (
          <p>
            <strong>Type:</strong> {trip.type}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex flex-col space-y-4">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your travel query here... (e.g., 'I'm planning a trip to Chennai, Tamil Nadu from New Delhi, Delhi. The trip is scheduled between 2025-04-04 and 2025-04-10. Could you help me create a detailed itinerary?')"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Processing..." : "Get Itinerary"}
          </Button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
          Error: {error}
        </div>
      )}

      {(isLoading || parsedDays.length > 0 || streamingResponse) && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Your Travel Itinerary</h2>

          {/* Show trip summary */}
          {renderTripSummary()}

          {/* Show loaded days */}
          {parsedDays.map((day, idx) => renderDay(day, idx))}

          {/* Loading indicator for next day */}
          {isLoading && (
            <div className="border rounded-md p-4 bg-white shadow-sm mt-4">
              <div className="animate-pulse flex flex-col space-y-3">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="space-y-3 mt-3">
                  <div className="bg-gray-100 p-3 rounded">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                  <div className="bg-gray-100 p-3 rounded">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                  <div className="bg-gray-100 p-3 rounded">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Show raw response only if requested (uncomment for debugging) */}
          {/*streamingResponse && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Raw Response (Debug)</h3>
              <div
                ref={responseRef}
                className="text-gray-900 p-4 bg-gray-50 rounded-md border border-gray-300 max-h-[200px] overflow-auto font-mono text-sm whitespace-pre-wrap"
              >
                {streamingResponse}
              </div>
            </div>
          )*/}
        </div>
      )}

      {streamingResponse && (
        <div className="mt-6">
          <button
            onClick={() => {
              // Toggle a debug div to show raw response
              const debugDiv = document.getElementById("debug-response");
              if (debugDiv) {
                debugDiv.style.display =
                  debugDiv.style.display === "none" ? "block" : "none";
              }
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Toggle Debug View
          </button>
          <div
            id="debug-response"
            style={{ display: "none" }}
            className="mt-2 p-4 bg-gray-50 text-gray-800 rounded-md border border-gray-300 max-h-[400px] overflow-auto font-mono text-sm whitespace-pre-wrap"
          >
            {streamingResponse}
          </div>
        </div>
      )}
    </div>
  );
}
