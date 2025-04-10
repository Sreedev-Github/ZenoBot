"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment"; // Import moment at the top of your file

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, height: 0, overflow: "hidden" },
  visible: {
    opacity: 1,
    height: "auto",
    overflow: "visible",
    transition: {
      duration: 0.5,
      ease: "easeInOut",
      staggerChildren: 0.1,
    },
  },
};

export default function TripDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [days, setDays] = useState({});
  const [currentSection, setCurrentSection] = useState(null);
  const [error, setError] = useState(null);
  const responseRef = useRef(null);

  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");
  const daysParam = searchParams.get("days");
  const budget = searchParams.get("budget");

  // Reset state when navigating to a new trip
  useEffect(() => {
    setDays({});
    setCurrentSection(null);
    setStreamingResponse("");
    setError(null);
    setLoading(true);
  }, [from, to, date, daysParam, budget]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchItinerary = async () => {
      if (!from || !to || !date || !daysParam) {
        setError("Missing required travel information");
        setLoading(false);
        return;
      }

      console.log("Sending date:", date);

      const query = `I am planning a trip to ${to} from ${from}. The trip will start on ${date} and will last for ${daysParam} days${
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
  }, [from, to, date, daysParam, budget]);

  // Handle streaming events
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
      case "done":
        console.log("Stream complete!");
        break;
      default:
        console.warn("Unknown event type:", data.type);
        break;
    }
  };

  const handleSectionStart = ({ section, dayNumber, date }) => {
    if (section === "dayStart") {
      // Ignore invalid day numbers
      if (dayNumber > parseInt(daysParam, 10)) {
        console.warn(`Ignoring invalid dayNumber: ${dayNumber}`);
        return;
      }

      console.log(`Setting date for day ${dayNumber}:`, date); // Debug log

      setDays((prev) => ({
        ...prev,
        [dayNumber]: { date, sections: {} },
      }));
    } else {
      setCurrentSection(section);
      setDays((prev) => {
        const day = prev[dayNumber] || { date: "", sections: {} };
        return {
          ...prev,
          [dayNumber]: {
            ...day,
            sections: {
              ...day.sections,
              [section]: {}, // Initialize section
            },
          },
        };
      });
    }
  };

  const handlePropertyReceived = ({ section, key, value, dayNumber }) => {
    setDays((prev) => {
      const day = prev[dayNumber] || { date: "", sections: {} };
      const sectionData = day.sections[section] || {};
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
  };

  const handleSectionEnd = ({ section }) => {
    if (currentSection === section) {
      setCurrentSection(null);
    }
  };

  // Render a single day's itinerary
  const renderDay = (day, dayNumber) => {
    console.log(`Rendering day ${dayNumber}:`, day.date); // Debug log

    let formattedDate = "Invalid Date";

    if (day.date) {
      // Use moment to parse the date in DD/MM/YYYY format
      const parsedDate = moment(day.date, "DD/MM/YYYY"); // Explicitly specify the format
      if (parsedDate.isValid()) {
        formattedDate = parsedDate.format("DD MMMM YYYY"); // Format the date as "10 April 2025"
      }
    }

    return (
      <motion.div
        key={dayNumber}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: dayNumber * 0.1 }}
        className="border rounded-lg p-5 bg-white/70 dark:bg-black/70 shadow-md mb-6"
      >
        <h3 className="text-xl font-bold mb-4 border-b pb-2 text-black dark:text-white">
          Day {dayNumber} - {formattedDate}
        </h3>
        <p>Date: {formattedDate}</p>
        <div className="space-y-4">
          {Object.entries(day.sections).map(([section, data]) => (
            <div
              key={section}
              className={`p-4 rounded-md ${
                section === "morning"
                  ? "bg-yellow-50 dark:bg-yellow-900/30"
                  : section === "afternoon"
                  ? "bg-orange-50 dark:bg-orange-900/30"
                  : section === "evening"
                  ? "bg-purple-50 dark:bg-purple-900/30"
                  : "bg-gray-50 dark:bg-gray-800/50"
              }`}
            >
              <h4 className="font-semibold text-black dark:text-white capitalize">
                {section}
              </h4>
              {Object.entries(data).map(([key, value]) => (
                <p key={key} className="text-black dark:text-white">
                  {key}: {value}
                </p>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {error ? (
        <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-lg mb-8 shadow-md text-center">
          <h3 className="text-xl font-bold mb-2 text-red-600 dark:text-red-400">
            Error
          </h3>
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mt-20 mb-8 text-center text-black dark:text-white">
            Your Travel Itinerary
          </h1>
          <div className="space-y-6">
            {Object.entries(days).map(([dayNumber, day]) =>
              renderDay(day, dayNumber)
            )}
          </div>
        </>
      )}
    </div>
  );
}
