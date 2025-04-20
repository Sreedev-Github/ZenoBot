"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowDownIcon,
  Loader2,
  ChevronRightIcon,
  ChevronLeftIcon,
  XIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useTravelContext } from "../../context/travelContext";
import Head from "next/head";
import PushPopLoader from "@/components/PushPopLoader";

// Add a function to normalize the order of properties for display
const normalizeActivityData = (data) => {
  // Define the preferred order of properties
  const propertyOrder = [
    "Activity",
    "Location",
    "Description",
    "Transportation",
  ];

  // Create a new object with properties in the desired order
  const orderedData = {};
  propertyOrder.forEach((key) => {
    if (data[key]) {
      orderedData[key] = data[key];
    }
  });

  // Add any remaining properties that weren't in our ordering list
  Object.keys(data).forEach((key) => {
    if (!orderedData[key]) {
      orderedData[key] = data[key];
    }
  });

  return orderedData;
};

const ActivityCard = ({ title, data, sectionRef }) => {
  // Normalize the data to ensure consistent property order
  const normalizedData = normalizeActivityData(data);

  return (
    <div
      ref={sectionRef}
      className="bg-activity-background dark:bg-activity-background-dark p-4 md:p-8 lg:p-10 rounded-2xl shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)] dark:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.05),0px_1px_1px_-0.5px_rgba(255,255,255,0.03),0px_3px_3px_-1.5px_rgba(255,255,255,0.03),_0px_6px_6px_-3px_rgba(255,255,255,0.02),0px_12px_12px_-6px_rgba(255,255,255,0.02),0px_24px_24px_-12px_rgba(255,255,255,0.01)]"
    >
      <p className="text-text-green-800 dark:text-text-white text-left font-semibold">
        {title}
      </p>
      <div className="text-muted-gray dark:text-muted-gray-dark text-sm md:text-base">
        {Object.keys(normalizedData).length > 0 ? (
          // Only render if we have properties
          Object.entries(normalizedData).map(([key, value], idx) => (
            <motion.p
              key={key}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              {key}: {value}
            </motion.p>
          ))
        ) : (
          // Otherwise show a placeholder
          <p className="italic text-gray-400 dark:text-gray-500">
            Loading activity details...
          </p>
        )}
      </div>
    </div>
  );
};

const DayCard = ({ day, dayNumber }) => {
  const [isOpen, setIsOpen] = useState(true);
  const activitiesRef = useRef(null);
  const arrowRef = useRef(null);
  const activityItemsRef = useRef([]);

  // Clear and set the refs array for staggered animations
  const setActivityItemRef = (el) => {
    if (el && !activityItemsRef.current.includes(el)) {
      activityItemsRef.current.push(el);
    }
  };

  useEffect(() => {
    // Reset activity items ref array on each render
    activityItemsRef.current = [];
  }, []);

  useEffect(() => {
    // Make sure we have valid refs before animating
    if (!activitiesRef.current || !arrowRef.current) return;

    // Initially set correct states based on isOpen
    if (!isOpen) {
      gsap.set(activitiesRef.current, {
        height: 0,
        opacity: 0,
        display: "none",
        overflow: "hidden",
      });
      gsap.set(arrowRef.current, { rotation: 180 });
      gsap.set(activityItemsRef.current, { y: 20, opacity: 0 });
    }

    const tl = gsap.timeline();

    if (isOpen) {
      // Opening animation
      tl.to(arrowRef.current, {
        duration: 0.3,
        rotation: 0,
        ease: "power2.inOut",
      });

      tl.to(
        activitiesRef.current,
        {
          duration: 0.5,
          display: "flex",
          height: "auto",
          opacity: 1,
          ease: "power2.inOut",
        },
        "-=0.1"
      );

      tl.to(
        activityItemsRef.current,
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.4,
          ease: "back.out(1.4)",
        },
        "-=0.3"
      );
    } else {
      // Closing animation
      tl.to(activityItemsRef.current, {
        y: 20,
        opacity: 0,
        stagger: 0.05,
        duration: 0.3,
        ease: "power2.in",
      });

      tl.to(
        activitiesRef.current,
        {
          duration: 0.4,
          height: 0,
          opacity: 0,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.set(activitiesRef.current, { display: "none" });
          },
        },
        "-=0.2"
      );

      tl.to(
        arrowRef.current,
        {
          duration: 0.3,
          rotation: 180,
          ease: "power2.inOut",
        },
        "-=0.3"
      );
    }

    return () => {
      // Kill any ongoing animation to prevent conflicts
      tl.kill();
    };
  }, [isOpen]);

  const toggleActivities = () => {
    setIsOpen(!isOpen);
  };

  // Use the date directly from the backend without reformatting
  // This ensures we keep the original date format including the correct year
  let formattedDate = day.date || "Date not available";

  // Add logging to see what sections are available
  useEffect(() => {
    // console.log(`Rendering DayCard ${dayNumber}:`, day);
  }, [day, dayNumber]);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: dayNumber * 0.1 }}
      className="flex flex-col gap-4 justify-center bg-secondary-background-white dark:bg-secondary-background-black rounded-3xl shadow-[0_0_35px_0px_rgba(0,0,0,0.25)] dark:shadow-[0_0_35px_0px_rgba(0,0,0,0.5)] p-5 w-full"
    >
      <div
        className="relative flex flex-row justify-between items-center p-2 cursor-pointer rounded-lg transition-colors"
        onClick={toggleActivities}
      >
        <h1 className="text-center font-medium text-text-green-800 dark:text-text-white">
          Day {dayNumber} - {formattedDate}
        </h1>
        <ArrowDownIcon
          ref={arrowRef}
          className="absolute right-2 md:right-5 text-text-green-800 dark:text-text-white"
        />
      </div>

      {/* Activities Container */}
      <div ref={activitiesRef} className="flex flex-col gap-4">
        {/* Map through sections and render each activity */}
        <AnimatePresence>
          {day.sections && Object.keys(day.sections).length > 0 ? (
            Object.entries(day.sections).map(([sectionName, data]) => {
              // console.log(`Rendering section ${sectionName} with data:`, data);
              // Check if the section has any properties
              if (Object.keys(data).length === 0) {
                return null;
              }

              // Format the section title
              let sectionTitle;
              if (sectionName.toLowerCase() === "additionalactivity") {
                sectionTitle = "Alternate Activity";
              } else {
                sectionTitle =
                  sectionName.charAt(0).toUpperCase() +
                  sectionName.slice(1) +
                  " Activity";
              }

              return (
                <div key={sectionName} ref={setActivityItemRef}>
                  <ActivityCard title={sectionTitle} data={data} />
                </div>
              );
            })
          ) : (
            <p className="italic text-gray-400 dark:text-gray-500 text-center py-4">
              Fetching activies for this day..
            </p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const Page = () => {
  const { travelData } = useTravelContext();

  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState({});
  const [error, setError] = useState(null);
  const [dots, setDots] = useState(""); // For animating dots
  const [animatedSections, setAnimatedSections] = useState({}); // Track animated sections
  const [finalizedSections, setFinalizedSections] = useState({});
  const [sectionTimeouts, setSectionTimeouts] = useState({});
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugData, setDebugData] = useState([]);

  // Animate loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500); // Update dots every 500ms

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Handler functions for processing streaming events
  const handleEvent = (data) => {
    // Add to debug data
    setDebugData((prev) => [...prev, data]);

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
        break;
    }
  };

  // Update handleSectionStart function
  const handleSectionStart = ({ section, dayNumber, date }) => {
    if (section === "dayStart") {
      setDays((prev) => {
        // Create a new day entry if it doesn't exist
        const newDays = { ...prev };
        newDays[dayNumber] = {
          date: date || new Date().toLocaleDateString(),
          sections: { ...(prev[dayNumber]?.sections || {}) },
        };
        // console.log("Updated days after dayStart:", newDays);
        return newDays;
      });
    } else if (section !== "dayStart" && section !== "dayEnd") {
      // Normalize the section name to lowercase
      const normalizedSection = section.toLowerCase();

      // Track section for animation
      setAnimatedSections((prev) => ({
        ...prev,
        [`${dayNumber}-${normalizedSection}`]: true,
      }));

      // Initialize the section
      setDays((prev) => {
        if (!prev[dayNumber]) {
          // If day doesn't exist yet, create it
          return {
            ...prev,
            [dayNumber]: {
              date: date || new Date().toLocaleDateString(),
              sections: {
                [normalizedSection]: {},
              },
            },
          };
        }

        // If day exists but section doesn't, add it
        if (!prev[dayNumber].sections[normalizedSection]) {
          return {
            ...prev,
            [dayNumber]: {
              ...prev[dayNumber],
              sections: {
                ...prev[dayNumber].sections,
                [normalizedSection]: {},
              },
            },
          };
        }

        return prev;
      });
    }
  };

  // Fix the property handler to better handle the incoming data
  const handlePropertyReceived = ({ section, key, value, dayNumber }) => {
    // Keep this for debugging
    // console.log(
    //   `Received property: Day ${dayNumber}, Section ${section}, Key ${key}, Value: ${value}`
    // );

    // Normalize section name - convert to lowercase and handle special cases
    let normalizedSection = section.toLowerCase();

    // Special handling for camelCase section names
    if (normalizedSection === "additionalactivity") {
      normalizedSection = "additionalactivity";
    }

    // Ignore updates for finalized sections
    if (finalizedSections[`${dayNumber}-${normalizedSection}`]) {
      // console.log(
      //   `Section ${dayNumber}-${normalizedSection} is already finalized, ignoring update`
      // );
      return;
    }

    // Update the day's section with the new property
    setDays((prev) => {
      // Make sure day exists
      const existingDay = prev[dayNumber] || { date: "", sections: {} };

      // Make sure section exists
      const existingSection = existingDay.sections[normalizedSection] || {};

      // Add the property to the section
      const updatedDays = {
        ...prev,
        [dayNumber]: {
          ...existingDay,
          sections: {
            ...existingDay.sections,
            [normalizedSection]: {
              ...existingSection,
              [key]: value,
            },
          },
        },
      };

      // console.log(`Updated days after property ${key}:`, updatedDays);
      return updatedDays;
    });
  };

  const handleSectionEnd = ({ section, dayNumber }) => {
    // Mark section as finalized if it's not already
    if (section !== "dayEnd" && section !== "dayStart") {
      const sectionKey = `${dayNumber}-${section}`;
      setFinalizedSections((prev) => ({
        ...prev,
        [sectionKey]: true,
      }));

      // Clear any timeout for this section
      if (sectionTimeouts[sectionKey]) {
        clearTimeout(sectionTimeouts[sectionKey]);
        setSectionTimeouts((prev) => {
          const newTimeouts = { ...prev };
          delete newTimeouts[sectionKey];
          return newTimeouts;
        });
      }
    }
  };

  // Fetch itinerary data
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    // Update fetchItinerary to trace the data structure changes
    const fetchItinerary = async () => {
      if (!travelData) {
        setError(
          <>
            No travel data found. Please go back and fill the{" "}
            <a href="/" className="underline font-bold">
              form
            </a>
            .
          </>
        );
        setLoading(false);
        return;
      }

      // Send the entire travelData object instead of constructing the query here
      try {
        const response = await fetch("/api/ask-query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ travelData }), // Send the entire object
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `API error (${response.status}): ${await response.text()}`
          );
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // Set a timer to remove loading state even if no data comes through
        const loadingTimeout = setTimeout(() => {
          if (isMounted) setLoading(false);
        }, 30000); // 30 seconds maximum loading time

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            clearTimeout(loadingTimeout);

            // Add logging to verify stream closure
            console.log("Stream closed properly");

            if (isMounted) {
              setLoading(false);
              // Force a final state update to ensure all data is rendered
              setDays((prevDays) => ({ ...prevDays }));
            }
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.substring(6));
                // console.log("Received data:", data);

                // Handle each event type
                if (isMounted) {
                  handleEvent(data);

                  // For debugging, log the current state of days after each event
                  if (
                    data.type === "property" ||
                    data.type === "sectionStart"
                  ) {
                    // console.log("Current days state:", days);
                  }
                }

                // Show data as soon as we receive any section data, not just day 1
                if (data.type === "sectionStart" && isMounted) {
                  clearTimeout(loadingTimeout);
                  setLoading(false);
                }
              } catch (e) {
                console.error(
                  "Error parsing SSE message:",
                  e,
                  line.substring(6)
                );
              }
            }
          }
        }
      } catch (err) {
        if (err.name !== "AbortError" && isMounted) {
          setError(err.message);
          console.error("Error fetching data:", err);
          setLoading(false);
        }
      }
    };

    fetchItinerary();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [travelData]);

  return (
    <div className="relative bg-background-white dark:bg-background-black flex flex-col justify-center items-center w-full min-h-screen px-4">
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

      {/* Debug Panel Toggle Button - check against NODE_ENV value from .env */}
      {process.env.NODE_ENV !== "production" && (
        <motion.button
          className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-text-green-800 dark:bg-gray-700 text-white p-2 rounded-l-md shadow-lg z-50"
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          {showDebugPanel ? (
            <ChevronRightIcon size={20} />
          ) : (
            <ChevronLeftIcon size={20} />
          )}
        </motion.button>
      )}

      {/* Debug Panel - check against NODE_ENV value from .env */}
      {process.env.NODE_ENV !== "production" && (
        <AnimatePresence>
          {showDebugPanel && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 w-full md:w-1/2 lg:w-1/3 h-full bg-white dark:bg-nav-bg-dark shadow-lg z-40 overflow-auto p-4 border-l border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-nav-bg-dark pb-2 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-text-green-800 dark:text-text-white">
                  Debug Panel
                </h2>
                <button
                  onClick={() => setShowDebugPanel(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XIcon size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 dark:text-text-white">
                    Travel Data:
                  </h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-auto text-xs text-black dark:text-gray-300">
                    {JSON.stringify(travelData, null, 2)}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 dark:text-text-white">
                    Raw Response Events:
                  </h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-auto max-h-[70vh] text-xs">
                    {debugData.length > 0 ? (
                      debugData.map((item, index) => (
                        <div
                          key={index}
                          className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-700"
                        >
                          <div className="font-mono text-black dark:text-gray-300">
                            {JSON.stringify(item, null, 2)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="dark:text-gray-400">No data received yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 dark:text-text-white">
                    Processed Data:
                  </h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-auto text-xs text-black dark:text-gray-300">
                    {JSON.stringify(days, null, 2)}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {!loading && Object.entries(days).length > 0 && (
        <div className="my-8 md:my-16">
          <h1 className="text-3xl md:text-5xl text-text-green-800 dark:text-text-white text-center font-bold mt-20">
            Your itinerary is here
          </h1>
        </div>
      )}

      {/* Main Content Container */}
      <div className="bg-transparent flex flex-col gap-6 md:gap-10 items-center p-5 md:p-10 w-full sm:max-w-[90%] md:max-w-[80%] lg:max-w-[60%]">
        {error ? (
          <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-lg mb-8 shadow-md text-center border border-red-300 dark:border-red-800 w-full">
            <h3 className="text-xl font-bold mb-2 text-red-700 dark:text-red-400">
              Error
            </h3>
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <>
            {/* Show Push Pop loader while loading */}
            {loading && (
              <PushPopLoader
                message="Your Travel Itinerary is being planned"
                submessage="Crafting memorable experiences just for you"
                color="#2a9d8f"
                darkMode={true}
              />
            )}

            {/* Always show days when available, even during loading */}
            {Object.keys(days).length > 0 ? (
              <div className="w-full space-y-6">
                {Object.entries(days)
                  .sort(
                    ([aKey, _a], [bKey, _b]) => parseInt(aKey) - parseInt(bKey)
                  )
                  .map(([dayNumber, day]) => (
                    <DayCard
                      key={dayNumber}
                      day={day}
                      dayNumber={parseInt(dayNumber)}
                    />
                  ))}
              </div>
            ) : (
              !loading && (
                <div className="p-10 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Waiting for itinerary data to arrive...
                  </p>
                </div>
              )
            )}
          </>
        )}
      </div>

      <div className="h-10 md:h-20"></div>
    </div>
  );
};

export default Page;
