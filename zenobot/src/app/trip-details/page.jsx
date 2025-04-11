"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTravelContext } from "../../context/travelContext";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import moment from "moment";
import Head from "next/head";

export default function TripDetailsPage() {
  const { travelData } = useTravelContext();

  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState({});
  const [error, setError] = useState(null);
  const [dots, setDots] = useState(""); // For animating dots
  const [animatedSections, setAnimatedSections] = useState({}); // Track animated sections
  const [finalizedSections, setFinalizedSections] = useState({});
  const [sectionTimeouts, setSectionTimeouts] = useState({});

  useEffect(() => {
    // Animate the dots
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500); // Update dots every 500ms

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  useEffect(() => {
    const fetchItinerary = async () => {
      if (!travelData) {
        setError("No travel data found. Please go back and fill the form.");
        setLoading(false);
        return;
      }

      const { from, to, date, duration, budget } = travelData;

      const query = `I am planning a trip to ${to} from ${from}. The trip will start on ${date} and will last for ${duration} days${
        budget ? `. My budget is ${budget}` : ""
      }. Please create a detailed itinerary that focuses only on activities within ${to} and its surrounding areas within the same state/region.`;

      try {
        const response = await fetch("/api/ask-query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error(
            `API error (${response.status}): ${await response.text()}`
          );
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let accumulatedResponse = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.substring(6));

                if (data.error) {
                  setError(data.error.message || data.error);
                  break;
                }

                handleEvent(data);

                // Stop loading animation once Day 1 starts loading
                if (data.type === "sectionStart" && data.dayNumber === 1) {
                  setLoading(false);
                }
              } catch (e) {
                console.error("Error parsing SSE message:", e);
              }
            }
          }
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [travelData]);

  const handleEvent = (data) => {
    switch (data.type) {
      case "sectionStart":
        handleSectionStart(data);
        break;
      case "property":
        handlePropertyReceived(data);
        break;
      case "sectionEnd":
        handleSectionEnd(data);
        break;
      default:
        console.warn("Unknown event type:", data.type);
        break;
    }
  };

  const handleSectionStart = ({ section, dayNumber, date }) => {
    if (section === "dayStart") {
      setDays((prev) => ({
        ...prev,
        [dayNumber]: { date, sections: {} },
      }));
    } else if (section !== "dayStart") {
      // Track new section for animation
      setAnimatedSections((prev) => ({
        ...prev,
        [`${dayNumber}-${section}`]: true,
      }));

      // Initialize the section if not already present
      setDays((prev) => {
        const day = prev[dayNumber] || { date: "", sections: {} };
        if (!day.sections[section]) {
          return {
            ...prev,
            [dayNumber]: {
              ...day,
              sections: {
                ...day.sections,
                [section]: {},
              },
            },
          };
        }
        return prev;
      });
    }
  };

  const handlePropertyReceived = ({ section, key, value, dayNumber }) => {
    // Ignore updates for finalized sections
    if (finalizedSections[`${dayNumber}-${section}`]) {
      return;
    }

    setDays((prev) => {
      const day = prev[dayNumber] || { date: "", sections: {} }; // Retrieve or initialize the day object
      const sectionData = day.sections[section] || {}; // Retrieve or initialize the section data

      return {
        ...prev,
        [dayNumber]: {
          ...day,
          sections: {
            ...day.sections,
            [section]: {
              ...sectionData,
              [key]: value,
            },
          },
        },
      };
    });

    // Reset the timeout for this section
    if (sectionTimeouts[`${dayNumber}-${section}`]) {
      clearTimeout(sectionTimeouts[`${dayNumber}-${section}`]);
    }

    // Set a new timeout to finalize the section
    const timeout = setTimeout(() => {
      setFinalizedSections((prev) => ({
        ...prev,
        [`${dayNumber}-${section}`]: true,
      }));

      // Remove the timeout from the tracking state
      setSectionTimeouts((prev) => {
        const updatedTimeouts = { ...prev };
        delete updatedTimeouts[`${dayNumber}-${section}`];
        return updatedTimeouts;
      });
    }, 1000); // 1 second timeout

    setSectionTimeouts((prev) => ({
      ...prev,
      [`${dayNumber}-${section}`]: timeout,
    }));
  };

  const handleSectionEnd = ({ section, dayNumber }) => {
    setFinalizedSections((prev) => ({
      ...prev,
      [`${dayNumber}-${section}`]: true,
    }));
  };

  const renderDay = (day, dayNumber) => {
    let formattedDate = "Invalid Date";

    if (day.date) {
      const parsedDate = moment(day.date, "DD/MM/YYYY");
      if (parsedDate.isValid()) {
        formattedDate = parsedDate.format("DD MMMM YYYY");
      }
    }

    return (
      <motion.div
        key={dayNumber}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: dayNumber * 0.1 }}
        className="bg-black/10 dark:bg-white/10 rounded-lg p-5 mb-6 shadow-md"
      >
        <h3 className="text-xl font-bold mb-4 border-b pb-2 text-black dark:text-white">
          Day {dayNumber} - {formattedDate}
        </h3>
        <div className="space-y-4">
          <AnimatePresence>
            {Object.entries(day.sections).map(([section, data]) => (
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 20, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto", marginBottom: 16 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`p-4 rounded-md ${
                  section === "morning"
                    ? "bg-yellow-100 dark:bg-yellow-900/30"
                    : section === "afternoon"
                    ? "bg-orange-100 dark:bg-orange-900/30"
                    : section === "evening"
                    ? "bg-purple-100 dark:bg-purple-900/30"
                    : "bg-gray-100 dark:bg-black/20 hover:bg-gray-200 dark:hover:bg-black/80"
                }`}
              >
                <h4 className="font-semibold text-black dark:text-white capitalize">
                  {section}
                </h4>
                <div className="space-y-1 mt-2">
                  {Object.entries(data).map(([key, value], idx) => (
                    <motion.p
                      key={key}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="text-black dark:text-white"
                    >
                      <span className="font-medium">{key}:</span> {value}
                    </motion.p>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <Head>
        <title>Travel Itinerary for {travelData?.to || "Destination"}</title>
        <meta
          name="description"
          content={`Plan your trip to ${
            travelData?.to || "destination"
          } starting from ${travelData?.from || "origin"} on ${
            travelData?.date || "date"
          }.`}
        />
      </Head>
      <div className="w-full max-w-4xl px-6 py-12 relative pt-20">
        {loading ? (
          <div className="text-center text-gray-800 dark:text-white text-xl sm:text-2xl font-semibold">
            Your Travel Itinerary is being planned{dots}
          </div>
        ) : error ? (
          <div className="bg-red-200 dark:bg-red-900/30 p-6 rounded-lg mb-8 shadow-md text-center border border-red-300 dark:border-red-700">
            <h3 className="text-xl font-bold mb-2 text-red-700 dark:text-red-400">
              Error
            </h3>
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <>
            <h1 className="text-gray-800 dark:text-white text-2xl sm:text-3xl font-bold mb-8 text-center pt-10">
              Your Travel Itinerary
            </h1>
            <div className="space-y-8">
              {Object.entries(days).map(([dayNumber, day]) =>
                renderDay(day, dayNumber)
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
