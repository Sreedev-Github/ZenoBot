"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

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

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export default function QueryStreaming() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [parsedResponse, setParsedResponse] = useState(null);
  const [error, setError] = useState(null);
  const responseRef = useRef(null);

  // State for tracking days and sections
  const [days, setDays] = useState({});
  const [visibleSections, setVisibleSections] = useState({});

  const preprocessQuery = (originalQuery) => {
    return `${originalQuery}\n\nPlease create an itinerary for the destination only. I understand this will only include activities within the destination state/region, and won't include any cross-state travel. I'm only interested in planning what to do at the destination.`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setStreamingResponse("");
    setParsedResponse(null);
    setError(null);
    setDays({});
    setVisibleSections({});

    try {
      const processedQuery = preprocessQuery(query);
      const response = await fetch("/api/ask-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: processedQuery }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let accumulatedResponse = "";

      // Process the stream
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE format
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.substring(6));

              if (data.error) {
                setError(data.error.message || data.error);
                continue;
              }

              switch (data.type) {
                case "content":
                  // Store raw content for debug view
                  accumulatedResponse += data.content;
                  setStreamingResponse(accumulatedResponse);
                  break;

                case "sectionStart":
                  handleSectionStart(data);
                  break;

                case "property":
                  handlePropertyReceived(data);
                  break;

                case "sectionEnd":
                  // Handle section end - currently just for dayEnd
                  break;

                case "done":
                  // Stream is complete
                  break;
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
      setIsLoading(false);
    }
  };

  // Handle section start events
  const handleSectionStart = (data) => {
    const { section, dayNumber, date } = data;

    if (section === "dayStart") {
      // Initialize a new day
      setDays((prev) => ({
        ...prev,
        [dayNumber]: {
          date: date || "",
          sections: {},
        },
      }));

      // Make the day visible
      setVisibleSections((prev) => ({
        ...prev,
        [`day_${dayNumber}`]: true,
      }));
    } else {
      // For other sections, normalize the section name
      let sectionKey = section.toLowerCase();

      // Make the section visible
      setVisibleSections((prev) => ({
        ...prev,
        [`day_${dayNumber}_${sectionKey}`]: true,
      }));

      // Initialize the section if it doesn't exist
      setDays((prev) => {
        const day = prev[dayNumber] || { date: "", sections: {} };
        return {
          ...prev,
          [dayNumber]: {
            ...day,
            sections: {
              ...day.sections,
              [sectionKey]: {},
            },
          },
        };
      });
    }
  };

  // Handle incoming property values
  const handlePropertyReceived = (data) => {
    const { section, key, value, dayNumber } = data;

    if (!section || !key || value === undefined || !dayNumber) {
      return;
    }

    // Normalize section name for consistency
    let sectionKey = section.toLowerCase();

    // Special handling for additionalActivity to match component expectations
    if (sectionKey === "additionalactivity") {
      sectionKey = "additionalactivity";
    }

    // Update the property in the day's section
    setDays((prev) => {
      const day = prev[dayNumber] || { date: "", sections: {} };
      const sectionData = day.sections[sectionKey] || {};

      return {
        ...prev,
        [dayNumber]: {
          ...day,
          sections: {
            ...day.sections,
            [sectionKey]: {
              ...sectionData,
              [key]: value,
            },
          },
        },
      };
    });
  };

  // Render all days
  const renderDays = () => {
    return Object.entries(days).map(([dayNumber, dayData]) => (
      <AnimatePresence key={`day-${dayNumber}`} mode="wait">
        {visibleSections[`day_${dayNumber}`] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="border rounded-md p-4 bg-white text-gray-800 shadow-sm mt-4"
          >
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Day {dayNumber} {dayData.date ? `- ${dayData.date}` : ""}
              </motion.span>
            </h3>

            <div className="space-y-4">
              {/* Morning Section */}
              {renderSection(
                dayNumber,
                "morning",
                dayData,
                "bg-yellow-50",
                "Morning"
              )}

              {/* Afternoon Section */}
              {renderSection(
                dayNumber,
                "afternoon",
                dayData,
                "bg-orange-50",
                "Afternoon"
              )}

              {/* Evening Section */}
              {renderSection(
                dayNumber,
                "evening",
                dayData,
                "bg-purple-50",
                "Evening"
              )}

              {/* Additional Activity Section */}
              {renderSection(
                dayNumber,
                "additionalactivity",
                dayData,
                "bg-gray-50",
                "Additional Activity"
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    ));
  };

  // Helper to render a time section (morning, afternoon, evening, etc.)
  const renderSection = (dayNumber, sectionKey, dayData, bgColor, title) => {
    const sectionData = dayData.sections[sectionKey] || {};

    return (
      visibleSections[`day_${dayNumber}_${sectionKey}`] && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`${bgColor} p-3 rounded`}
        >
          <motion.h4 variants={itemVariants} className="font-medium">
            {title}
          </motion.h4>

          {sectionData.name && (
            <motion.p variants={itemVariants} className="font-semibold">
              <TypingAnimation text={sectionData.name} />
            </motion.p>
          )}

          {sectionData.location && (
            <motion.p variants={itemVariants} className="text-sm text-gray-600">
              <TypingAnimation text={sectionData.location} />
            </motion.p>
          )}

          {sectionData.description && (
            <motion.p variants={itemVariants}>
              <TypingAnimation text={sectionData.description} />
            </motion.p>
          )}

          {sectionData.transportation && (
            <motion.p variants={itemVariants} className="text-sm italic">
              Transportation:{" "}
              <TypingAnimation text={sectionData.transportation} />
            </motion.p>
          )}
        </motion.div>
      )
    );
  };

  // Typing animation component
  const TypingAnimation = ({ text }) => {
    return (
      <motion.span
        initial={{
          width: 0,
          display: "inline-block",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
        animate={{ width: "100%" }}
        transition={{
          duration: text.length * 0.03, // Dynamic duration based on text length
          ease: "easeOut",
        }}
      >
        {text}
      </motion.span>
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

      {(isLoading || Object.keys(days).length > 0 || streamingResponse) && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Your Travel Itinerary</h2>

          {/* Render streaming UI with animations */}
          {renderDays()}

          {/* Loading indicator */}
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

          {/* Debug toggle - keep this for development */}
          {streamingResponse && (
            <div className="mt-6">
              <button
                onClick={() => {
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
      )}
    </div>
  );
}
