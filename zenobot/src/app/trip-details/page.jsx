"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Add this function outside your component to use as a utility
function extractAdditionalActivities(dayText) {
  try {
    const activityMatch = dayText.match(
      /"additionalActivities"\s*:\s*(\[[\s\S]*?\])/
    );
    if (activityMatch && activityMatch[1]) {
      // Try to parse the activities array
      return JSON.parse(activityMatch[1]);
    }
  } catch (e) {
    console.log("Error extracting activities:", e);
  }
  return [];
}

export default function TripDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [parsedResponse, setParsedResponse] = useState(null);
  const [parsedDays, setParsedDays] = useState([]);
  const [daysLoaded, setDaysLoaded] = useState(0);
  const [error, setError] = useState(null);
  const responseRef = useRef(null);

  const searchParams = useSearchParams();

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");
  const days = searchParams.get("days");
  const budget = searchParams.get("budget");

  // Replace the day extraction in your useEffect with this improved version
  useEffect(() => {
    console.log(
      `Processing stream response (${streamingResponse.length} chars, ${daysLoaded} days loaded)`
    );

    if (!streamingResponse || parsedResponse) return;

    try {
      // Handle refusal responses first
      if (
        streamingResponse.includes("can't provide an itinerary") ||
        streamingResponse.includes("I can't assist with") ||
        streamingResponse.includes("I'm unable to create an itinerary")
      ) {
        setError(
          "The AI is unable to create this itinerary. Please try a different destination or ensure your destination is within a single state/region."
        );
        setLoading(false);
        return;
      }

      // Remove markdown delimiters
      let validJson = streamingResponse
        .replace(/^```json\s*/g, "")
        .replace(/\s*```$/g, "");

      // Find first opening bracket to get valid JSON
      const firstBracket = validJson.indexOf("{");
      if (firstBracket === -1) return;
      validJson = validJson.substring(firstBracket);

      try {
        // Simple approach: try to parse the full JSON first
        const parsed = JSON.parse(validJson);

        // If we have a valid full response
        if (parsed.itinerary && Array.isArray(parsed.itinerary)) {
          // Only update if we have more days than before
          if (parsed.itinerary.length > daysLoaded) {
            // Extract just the new days
            const newDays = parsed.itinerary.slice(daysLoaded);

            console.log(`Found ${newDays.length} new complete days:`, newDays);

            // Update state with the new days
            setParsedDays((prev) => [...prev, ...newDays]);
            setDaysLoaded(parsed.itinerary.length);

            // If we have all days, also store the complete response
            const expectedDays = parseInt(days) || 3;
            if (parsed.itinerary.length >= expectedDays) {
              setParsedResponse(parsed);
              setLoading(false);
            }
          }
          return;
        }
      } catch (e) {
        // Expected if JSON is incomplete, continue with partial parsing
      }

      // Simpler partial parsing approach:
      // Try to extract days one by one based on their structure
      try {
        // Improved regex that better handles additionalActivities
        // This regex will match each day including its additionalActivity section if present
        const dayRegex =
          /"date"\s*:\s*"[^"]*"[\s\S]*?"evening"\s*:\s*{[\s\S]*?}([\s\S]*?(?="date"|$))/g;

        let match;
        let newDays = [];
        let foundDaysCount = 0;

        while ((match = dayRegex.exec(validJson)) !== null) {
          foundDaysCount++;
          if (foundDaysCount <= daysLoaded) continue; // Skip days we already processed

          // Try to create a valid day object
          try {
            let dayText = match[0];

            // Skip incomplete days
            if (
              !dayText.includes('"morning"') ||
              !dayText.includes('"afternoon"') ||
              !dayText.includes('"evening"')
            ) {
              continue;
            }

            // Construct a valid JSON object for this day
            let dayJson = `{${dayText}}`;

            // Fix common JSON issues
            dayJson = dayJson
              .replace(/,\s*}/g, "}") // Remove trailing commas before closing braces
              .replace(/,\s*]/g, "]"); // Remove trailing commas in arrays

            console.log(
              `Parsing day ${foundDaysCount}:`,
              dayJson.substring(0, 100) + "..."
            );

            let hasAdditionalActivity = false;
            let parsedDay;

            try {
              parsedDay = JSON.parse(dayJson);
              hasAdditionalActivity =
                parsedDay.hasOwnProperty("additionalActivity");
            } catch (e) {
              console.log(
                `Error parsing day to check for additionalActivity:`,
                e.message
              );
              // If parsing fails, assume no additional activities
              parsedDay = {};
            }

            console.log(
              `Day ${foundDaysCount}: Has additionalActivity? ${hasAdditionalActivity}`
            );

            let additionalActivityObject = null;
            if (hasAdditionalActivity) {
              try {
                additionalActivityObject = parsedDay.additionalActivity;
                console.log(
                  `Extracted additionalActivity for day ${foundDaysCount}:`,
                  additionalActivityObject
                );
              } catch (e) {
                console.log(
                  `Error extracting additionalActivity for day ${foundDaysCount}:`,
                  e.message
                );
              }
            }

            // Ensure required fields exist
            if (parsedDay.morning && parsedDay.afternoon && parsedDay.evening) {
              // Add additionalActivity if we found it
              if (additionalActivityObject) {
                parsedDay.additionalActivity = additionalActivityObject;
              }

              // Add to our new days
              newDays.push(parsedDay);
              console.log(
                `Successfully parsed day ${foundDaysCount} with additionalActivity:`,
                parsedDay.additionalActivity || "none"
              );
            }
          } catch (dayError) {
            console.log("Error parsing individual day:", dayError.message);
          }
        }

        // If we found new valid days, update the state immediately
        if (newDays.length > 0) {
          console.log(`Adding ${newDays.length} new days from partial parse`);
          setParsedDays((prev) => [...prev, ...newDays]);
          setDaysLoaded((prevDaysLoaded) => prevDaysLoaded + newDays.length);

          // Only set loading to false when we have all expected days
          const expectedDays = parseInt(days) || 3;
          if (daysLoaded + newDays.length >= expectedDays) {
            setLoading(false);
          }
        }
      } catch (partialError) {
        console.log("Error in partial parsing:", partialError.message);
      }

      // Check if we can parse the complete JSON one more time
      try {
        if (
          streamingResponse.endsWith("}") &&
          streamingResponse.includes('"itinerary"')
        ) {
          const completeJson = JSON.parse(streamingResponse);
          if (completeJson.itinerary && Array.isArray(completeJson.itinerary)) {
            // Only update if we have more days than before
            if (completeJson.itinerary.length > daysLoaded) {
              // Extract just the new days
              const newDays = completeJson.itinerary.slice(daysLoaded);

              console.log(
                `Found ${newDays.length} new complete days from final check`
              );

              // Update state with the new days
              setParsedDays((prev) => [...prev, ...newDays]);
              setDaysLoaded(completeJson.itinerary.length);
              setParsedResponse(completeJson);
              setLoading(false);
            }
          }
        }
      } catch (e) {
        // Expected if JSON is still incomplete
      }
    } catch (err) {
      console.error("Error parsing streaming JSON:", err);
    }

    // In the useEffect that processes streaming data
    if (!loading && !parsedResponse) {
      setLoading(true);
    }
  }, [streamingResponse, daysLoaded, parsedResponse, days]);

  // Scroll to the bottom of the response container when new content arrives
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [streamingResponse, parsedDays]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchItinerary = async () => {
      if (!from || !to || !date || !days) {
        setError("Missing required travel information");
        setLoading(false);
        return;
      }

      // Improve query construction with better formatting
      const query = `I am planning a trip to ${to} from ${from}. The trip will start on ${date} and will last for ${days} days${
        budget ? `. My budget is ${budget}` : ""
      }. Please create a detailed itinerary that focuses only on activities within ${to} and its surrounding areas within the same state/region.`;

      try {
        // Check if API endpoint is available before making request
        const response = await fetch("/api/ask-query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: query,
          }),
        });

        // Better error handling for API response issues
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `API error (${response.status}): ${errorText || "Unknown error"}`
          );
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
        setLoading(false);
      }
    };

    setLoading(true);
    fetchItinerary();
  }, [from, to, date, days, budget]);

  // Render a single day's itinerary
  const renderDay = (day, idx) => {
    // Safety check for malformed data
    if (!day || !day.morning || !day.afternoon || !day.evening) {
      console.log("Incomplete day data:", day);
      return null;
    }

    // Check for additionalActivities in the log, with more details
    console.log(`Day ${idx + 1} data:`, {
      date: day.date,
      hasAdditionalActivity: !!day.additionalActivity,
      additionalActivityRaw: day.additionalActivity,
      additionalActivityContent: day.additionalActivity
        ? JSON.stringify(day.additionalActivity).substring(0, 100)
        : "undefined",
    });

    return (
      <motion.div
        key={idx}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: idx * 0.1 }}
        className="border rounded-lg p-5 bg-white/70 dark:bg-black/70 shadow-md mb-6"
      >
        <h3 className="text-xl font-bold mb-4 border-b pb-2 text-black dark:text-white">
          Day {idx + 1} - {day.date || ""}
        </h3>

        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md">
            <h4 className="font-semibold text-black dark:text-white">
              Morning
            </h4>
            <p className="font-medium text-black dark:text-white">
              {day.morning.name || "Activity"}
            </p>
            <p className="text-sm text-black/60 dark:text-white/60">
              {day.morning.location || "Location"}
            </p>
            <p className="text-black/80 dark:text-white/80 mt-1">
              {day.morning.description || "Description unavailable"}
            </p>
            <p className="text-sm italic text-black/60 dark:text-white/60 mt-2">
              Transportation: {day.morning.transportation || "Any"}
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-md">
            <h4 className="font-semibold text-black dark:text-white">
              Afternoon
            </h4>
            <p className="font-medium text-black dark:text-white">
              {day.afternoon.name || "Activity"}
            </p>
            <p className="text-sm text-black/60 dark:text-white/60">
              {day.afternoon.location || "Location"}
            </p>
            <p className="text-black/80 dark:text-white/80 mt-1">
              {day.afternoon.description || "Description unavailable"}
            </p>
            <p className="text-sm italic text-black/60 dark:text-white/60 mt-2">
              Transportation: {day.afternoon.transportation || "Any"}
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-md">
            <h4 className="font-semibold text-black dark:text-white">
              Evening
            </h4>
            <p className="font-medium text-black dark:text-white">
              {day.evening.name || "Activity"}
            </p>
            <p className="text-sm text-black/60 dark:text-white/60">
              {day.evening.location || "Location"}
            </p>
            <p className="text-black/80 dark:text-white/80 mt-1">
              {day.evening.description || "Description unavailable"}
            </p>
            <p className="text-sm italic text-black/60 dark:text-white/60 mt-2">
              Transportation: {day.evening.transportation || "Any"}
            </p>
          </div>

          {day.additionalActivity && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
              <h4 className="font-semibold text-black dark:text-white">
                Additional Activity
              </h4>
              {console.log(
                `Rendering additionalActivity for day ${idx + 1}:`,
                JSON.stringify(day.additionalActivity, null, 2)
              )}

              <div className="mt-2 border-t pt-2 border-gray-200 dark:border-gray-700">
                <p className="font-medium text-black dark:text-white">
                  {day.additionalActivity?.name || "Activity"}
                </p>
                <p className="text-sm text-black/60 dark:text-white/60">
                  {day.additionalActivity?.location || "Location"}
                </p>
                <p className="text-black/80 dark:text-white/80">
                  {day.additionalActivity?.description ||
                    "Description unavailable"}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
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
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg mb-8 shadow-md"
      >
        <h3 className="text-xl font-bold mb-4 text-black dark:text-white">
          Trip Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trip.origin && (
            <div className="flex flex-col">
              <span className="text-black/60 dark:text-white/60">Origin</span>
              <span className="text-lg font-medium text-black dark:text-white">
                {trip.origin}
              </span>
            </div>
          )}
          {trip.destination && (
            <div className="flex flex-col">
              <span className="text-black/60 dark:text-white/60">
                Destination
              </span>
              <span className="text-lg font-medium text-black dark:text-white">
                {trip.destination}
              </span>
            </div>
          )}
          {trip.duration && (
            <div className="flex flex-col">
              <span className="text-black/60 dark:text-white/60">Duration</span>
              <span className="text-lg font-medium text-black dark:text-white">
                {trip.duration}
              </span>
            </div>
          )}
          {trip.type && (
            <div className="flex flex-col">
              <span className="text-black/60 dark:text-white/60">Type</span>
              <span className="text-lg font-medium text-black dark:text-white">
                {trip.type}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Render skeleton loader only for the next day being loaded
  const renderSkeletons = () => {
    // Only show one skeleton for the next day that's loading
    if (loading && parsedDays.length < parseInt(days)) {
      console.log(
        `Rendering skeleton for day ${parsedDays.length + 1} (loaded: ${
          parsedDays.length
        })`
      );

      return (
        <motion.div
          key={`skeleton-next`}
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
          className="border rounded-lg p-5 bg-white/70 dark:bg-black/70 shadow-md mb-6"
        >
          <div className="flex items-center mb-4 border-b pb-2">
            <Skeleton className="h-6 w-1/3" />
          </div>

          <div className="space-y-4">
            {/* Morning skeleton */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <Skeleton className="h-5 w-1/4 mb-2" />
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2 mb-1" />
              <Skeleton className="h-20 w-full mb-2" />
              <Skeleton className="h-3 w-2/5" />
            </div>

            {/* Afternoon skeleton */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <Skeleton className="h-5 w-1/4 mb-2" />
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2 mb-1" />
              <Skeleton className="h-20 w-full mb-2" />
              <Skeleton className="h-3 w-2/5" />
            </div>

            {/* Evening skeleton */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <Skeleton className="h-5 w-1/4 mb-2" />
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2 mb-1" />
              <Skeleton className="h-20 w-full mb-2" />
              <Skeleton className="h-3 w-2/5" />
            </div>

            {/* Additional activities skeleton */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <Skeleton className="h-5 w-1/3 mb-3" />
              <div className="space-y-3">
                <div>
                  <Skeleton className="h-4 w-1/2 mb-1" />
                  <Skeleton className="h-3 w-1/3 mb-1" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-1/2 mb-1" />
                  <Skeleton className="h-3 w-1/3 mb-1" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <>
      <AnimatePresence>
        {loading && streamingResponse === "" && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          >
            <div className="flex flex-col items-center">
              <Loader2 className="h-16 w-16 text-white animate-spin mb-6" />
              <p className="text-white text-xl">
                Planning your trip to {to}...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-900/30 p-6 rounded-lg mb-8 shadow-md text-center"
          >
            <h3 className="text-xl font-bold mb-2 text-red-600 dark:text-red-400">
              Error
            </h3>
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={() => window.history.back()} className="mt-4">
              Go Back
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl font-bold mb-6 text-center text-black dark:text-white"
            >
              Your Travel Itinerary
            </motion.h1>

            {/* Trip Summary */}
            {streamingResponse ? (
              renderTripSummary()
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg mb-8 shadow-md animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            )}

            {/* Days */}
            <div className="space-y-6">
              {/* Show loaded days */}
              {parsedDays.map((day, idx) => renderDay(day, idx))}

              {/* Show skeletons for remaining days */}
              {loading && renderSkeletons()}
            </div>

            {/* Debug toggle */}
            {streamingResponse && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    const debugDiv = document.getElementById("debug-response");
                    if (debugDiv) {
                      debugDiv.style.display =
                        debugDiv.style.display === "none" ? "block" : "none";
                    }
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Debug View
                </button>
                <div
                  id="debug-response"
                  style={{ display: "none" }}
                  className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-700 max-h-[400px] overflow-auto font-mono text-sm whitespace-pre-wrap"
                  ref={responseRef}
                >
                  {streamingResponse}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
