"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowDownIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import moment from "moment";
import { useTravelContext } from "../../context/travelContext";
import Head from "next/head";

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
      className="bg-activity-background p-4 md:p-8 lg:p-10 rounded-2xl shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)]"
    >
      <p className="text-text-green-800 text-left font-semibold">{title}</p>
      <div className="text-muted-gray text-sm md:text-base">
        {Object.entries(normalizedData).map(([key, value], idx) => (
          <motion.p
            key={key}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            {key}: {value}
          </motion.p>
        ))}
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

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: dayNumber * 0.1 }}
      className="flex flex-col gap-4 justify-center bg-secondary-background-white rounded-3xl shadow-[0_0_35px_0px_rgba(0,0,0,0.25)] p-5 w-full"
    >
      <div
        className="relative flex flex-row justify-between items-center p-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
        onClick={toggleActivities}
      >
        <h1 className="text-center font-medium">
          Day {dayNumber} - {formattedDate}
        </h1>
        <ArrowDownIcon
          ref={arrowRef}
          className="absolute right-2 md:right-5 text-text-green-800"
        />
      </div>

      {/* Activities Container */}
      <div ref={activitiesRef} className="flex flex-col gap-4">
        {/* Map through sections and render each activity */}
        <AnimatePresence>
          {Object.entries(day.sections || {}).map(([section, data]) => (
            <div key={section} ref={setActivityItemRef}>
              <ActivityCard
                title={
                  section.charAt(0).toUpperCase() +
                  section.slice(1) +
                  " Activity"
                }
                data={data}
              />
            </div>
          ))}
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

  // Animate loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500); // Update dots every 500ms

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Handler functions for processing streaming events
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
      const day = prev[dayNumber] || { date: "", sections: {} };
      const sectionData = day.sections[section] || {};
      if (!sectionData[key] || sectionData[key] === "") {
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
      }

      // Return unchanged state if the key already has content
      return prev;
    });

    // Timeout code...
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

        // Set a timer to remove loading state even if no data comes through
        const loadingTimeout = setTimeout(() => {
          setLoading(false);
        }, 3000);

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
                  clearTimeout(loadingTimeout);
                  break;
                }

                handleEvent(data);

                // Show data as soon as we receive any section data, not just day 1
                if (data.type === "sectionStart") {
                  setLoading(false);
                  clearTimeout(loadingTimeout);
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

  return (
    <div className="relative bg-background-white flex flex-col justify-center items-center w-full min-h-screen px-4">
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
      <div className="my-8 md:my-16">
        <h1 className="text-3xl md:text-5xl text-text-green-800 text-center font-bold">
          Your itinerary is here
        </h1>
      </div>
      {/* Main Content Container */}
      <div className="bg-white flex flex-col gap-6 md:gap-10 items-center p-5 md:p-10 w-full sm:max-w-[90%] md:max-w-[80%] lg:max-w-[60%] rounded-3xl shadow-[0px_0px_20px_5px_rgba(38,70,83,0.2)]">
        {error ? (
          <div className="bg-red-100 p-6 rounded-lg mb-8 shadow-md text-center border border-red-300 w-full">
            <h3 className="text-xl font-bold mb-2 text-red-700">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <>
            {/* Show loading indicator at the top if still loading */}
            {loading && (
              <div className="text-center text-gray-800 text-xl sm:text-2xl font-semibold py-6 flex flex-col items-center">
                <div className="mb-4">
                  Your Travel Itinerary is being planned{dots}
                </div>
                <Loader2 className="animate-spin h-8 w-8 text-text-green-800" />
              </div>
            )}

            {/* Always show days, even if still loading more */}
            {Object.entries(days).length > 0 ? (
              Object.entries(days).map(([dayNumber, day]) => (
                <DayCard
                  key={dayNumber}
                  day={day}
                  dayNumber={parseInt(dayNumber)}
                />
              ))
            ) : loading ? null : ( // Don't show anything else if loading and no days yet
              <div className="text-center text-gray-800 text-xl py-8">
                No itinerary data available yet. Please wait a moment...
              </div>
            )}
          </>
        )}
      </div>
      <div className="h-10 md:h-20"></div> {/* Bottom spacing */}
    </div>
  );
};

export default Page;
