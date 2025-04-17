"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card } from "@/components/ui/card";

// Register ScrollTrigger with GSAP
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ItineraryTimeline = () => {
  const [activeDay, setActiveDay] = useState(0);
  const sectionsRef = useRef([]);
  const timelineRef = useRef(null);
  const containerRef = useRef(null);
  // Add ref to track scrolling state at component level
  const isScrollingRef = useRef(false);

  // Sample itinerary data
  const itineraryData = [
    {
      date: "15/04/2025",
      morning: {
        name: "Visit Christ Church",
        location: "Christ Church, Shimla",
        description: "Explore the historic church built in 1857.",
        transportation: "Any",
      },
      afternoon: {
        name: "Walk to the Ridge",
        location: "The Mall, Shimla",
        description:
          "Stroll along the scenic ridge and enjoy the views of the surrounding mountains.",
        transportation: "Any",
      },
      evening: {
        name: "Visit the Jakhoo Temple",
        location: "Jakhoo Temple, Shimla",
        description:
          "Explore the ancient temple dedicated to Hanuman and enjoy the panoramic views of the city.",
        transportation: "Any",
      },
      additionalActivity: {
        name: "Visit the Indian Institute of Advanced Study",
        location: "Indian Institute of Advanced Study, Shimla",
        description:
          "Explore the museum and library showcasing a vast collection of art, literature, and science.",
      },
    },
    {
      date: "16/04/2025",
      morning: {
        name: "Shimla Heritage Walk",
        location: "Shimla Old Town",
        description:
          "Take a guided tour through Shimla's colonial architecture and history.",
        transportation: "Walk",
      },
      afternoon: {
        name: "Lunch at Cafe Sol",
        location: "The Mall Road, Shimla",
        description: "Enjoy authentic Himachali cuisine with mountain views.",
        transportation: "Any",
      },
      evening: {
        name: "Shopping at Lakkar Bazaar",
        location: "Lakkar Bazaar, Shimla",
        description:
          "Browse wooden crafts and local souvenirs at this famous market.",
        transportation: "Taxi",
      },
      additionalActivity: {
        name: "Sunset at Scandal Point",
        location: "The Ridge, Shimla",
        description:
          "Watch the sunset at this historic meeting place with panoramic mountain views.",
      },
    },
    {
      date: "17/04/2025",
      morning: {
        name: "Hike to Chadwick Falls",
        location: "Chadwick Falls, Shimla",
        description:
          "A refreshing morning hike to the beautiful waterfall through pine forests.",
        transportation: "Taxi and Walk",
      },
      afternoon: {
        name: "Picnic at Summer Hill",
        location: "Summer Hill, Shimla",
        description:
          "Enjoy a peaceful picnic surrounded by nature and pine trees.",
        transportation: "Bus",
      },
      evening: {
        name: "Dinner at Ashiana Restaurant",
        location: "The Mall Road, Shimla",
        description:
          "Savor local and international cuisine at this popular restaurant.",
        transportation: "Taxi",
      },
      additionalActivity: {
        name: "Visit Shimla State Museum",
        location: "State Museum, Shimla",
        description:
          "Explore artifacts showcasing Himachal's rich cultural heritage and history.",
      },
    },
    {
      date: "18/04/2025",
      morning: {
        name: "Visit Christ Church",
        location: "Christ Church, Shimla",
        description: "Explore the historic church built in 1857.",
        transportation: "Any",
      },
      afternoon: {
        name: "Walk to the Ridge",
        location: "The Mall, Shimla",
        description:
          "Stroll along the scenic ridge and enjoy the views of the surrounding mountains.",
        transportation: "Any",
      },
      evening: {
        name: "Visit the Jakhoo Temple",
        location: "Jakhoo Temple, Shimla",
        description:
          "Explore the ancient temple dedicated to Hanuman and enjoy the panoramic views of the city.",
        transportation: "Any",
      },
      additionalActivity: {
        name: "Visit the Indian Institute of Advanced Study",
        location: "Indian Institute of Advanced Study, Shimla",
        description:
          "Explore the museum and library showcasing a vast collection of art, literature, and science.",
      },
    },
    {
      date: "19/04/2025",
      morning: {
        name: "Shimla Heritage Walk",
        location: "Shimla Old Town",
        description:
          "Take a guided tour through Shimla's colonial architecture and history.",
        transportation: "Walk",
      },
      afternoon: {
        name: "Lunch at Cafe Sol",
        location: "The Mall Road, Shimla",
        description: "Enjoy authentic Himachali cuisine with mountain views.",
        transportation: "Any",
      },
      evening: {
        name: "Shopping at Lakkar Bazaar",
        location: "Lakkar Bazaar, Shimla",
        description:
          "Browse wooden crafts and local souvenirs at this famous market.",
        transportation: "Taxi",
      },
      additionalActivity: {
        name: "Sunset at Scandal Point",
        location: "The Ridge, Shimla",
        description:
          "Watch the sunset at this historic meeting place with panoramic mountain views.",
      },
    },
    {
      date: "20/04/2025",
      morning: {
        name: "Hike to Chadwick Falls",
        location: "Chadwick Falls, Shimla",
        description:
          "A refreshing morning hike to the beautiful waterfall through pine forests.",
        transportation: "Taxi and Walk",
      },
      afternoon: {
        name: "Picnic at Summer Hill",
        location: "Summer Hill, Shimla",
        description:
          "Enjoy a peaceful picnic surrounded by nature and pine trees.",
        transportation: "Bus",
      },
      evening: {
        name: "Dinner at Ashiana Restaurant",
        location: "The Mall Road, Shimla",
        description:
          "Savor local and international cuisine at this popular restaurant.",
        transportation: "Taxi",
      },
      additionalActivity: {
        name: "Visit Shimla State Museum",
        location: "State Museum, Shimla",
        description:
          "Explore artifacts showcasing Himachal's rich cultural heritage and history.",
      },
    },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;

    const timeline = timelineRef.current;
    const container = containerRef.current;

    // Don't reset refs as it causes issues
    // Clear any existing ScrollTriggers
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    // Define all event handlers at the top level of useEffect
    let currentIndex = activeDay;
    let lastScrollTime = 0;

    // Define wheel handler at useEffect level to be accessible in cleanup
    const handleWheel = (e) => {
      // Prevent default scroll behavior
      e.preventDefault();

      // Don't process if already scrolling
      if (isScrollingRef.current) return;

      // Implement a time-based throttle for touchpad scrolling
      const now = Date.now();
      if (now - lastScrollTime < 800) {
        return; // Ignore scrolls that happen too quickly
      }

      // Normalize the scroll direction regardless of intensity
      // We only care about the direction, not the magnitude
      const direction = Math.sign(e.deltaY); // Will be 1, -1, or 0

      // Only process non-zero directions
      if (direction === 0) return;

      // Calculate next index based on direction (only +/- 1)
      const nextIndex = currentIndex + direction;

      // Validate the next index is within bounds before proceeding
      if (nextIndex < 0 || nextIndex >= itineraryData.length) {
        // We're at the end of the timeline, don't do anything
        return;
      }

      // Set scrolling state and update time
      isScrollingRef.current = true;
      lastScrollTime = now;
      currentIndex = nextIndex;

      // Update active day state
      setActiveDay(nextIndex);

      // Animate to the new section
      animateToSectionSafe(nextIndex);

      // Force a longer cooldown period to prevent accidental double scrolls
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    };

    // Touch handlers defined at top level too
    let touchStartY = 0;
    let lastTouchTime = 0;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      // Don't process if already scrolling
      if (isScrollingRef.current) {
        e.preventDefault();
        return;
      }

      // Time-based throttle for touchpad gestures
      const now = Date.now();
      if (now - lastTouchTime < 800) {
        e.preventDefault();
        return;
      }

      const touchY = e.touches[0].clientY;
      const diff = touchStartY - touchY;

      // Only process if significant touch movement
      if (Math.abs(diff) > 30) {
        e.preventDefault();

        // Normalize the direction to +1 or -1 only
        const direction = diff > 0 ? 1 : -1;

        // Calculate next index (always +/- 1)
        const nextIndex = currentIndex + direction;

        // Validate the next index is within bounds
        if (nextIndex < 0 || nextIndex >= itineraryData.length) {
          return; // Don't do anything if we're at the bounds
        }

        // Set scrolling state with a guaranteed timeout to reset
        isScrollingRef.current = true;
        lastTouchTime = now;
        currentIndex = nextIndex;

        // Update active day
        setActiveDay(nextIndex);

        // Animate to the section
        animateToSectionSafe(nextIndex);

        // Reset touch start for continuous scrolling
        touchStartY = touchY;

        // Force a timeout to reset scrolling state
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 800);
      }
    };

    const handleTouchEnd = () => {
      // No additional logic needed here since we set timeouts in the handlers
    };

    // Safe animation function that checks DOM before animating
    const animateToSectionSafe = (index) => {
      // Always re-get the current sections to ensure they're available
      const sections = sectionsRef.current;
      const dateIndicators = document.querySelectorAll(".date-indicator");

      // Check if elements exist before animating
      if (
        !sections ||
        sections.length === 0 ||
        !sections[index] ||
        !sections[activeDay]
      ) {
        console.warn("Missing section references");
        isScrollingRef.current = false;
        return;
      }

      if (dateIndicators.length === 0) {
        console.warn("Date indicators not found");
        isScrollingRef.current = false;
        return;
      }

      // Lock scrolling during animation
      isScrollingRef.current = true;

      // Create a timeline for smoother sequencing
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
      });

      // Update which dates are visible
      updateVisibleDates(index);

      // Pre-position the target section and cards for smoother entrance
      tl.set(
        sections[index],
        {
          display: "block",
          opacity: 0,
          scale: 0.98,
          visibility: "hidden", // Hide initially to prevent flickering
        },
        0
      );

      // Pre-position cards in the new section
      tl.set(
        sections[index].querySelectorAll(".activity-card"),
        {
          y: 15,
          opacity: 0,
          scale: 1,
        },
        0
      );

      // Fade out current section
      tl.to(
        sections[activeDay],
        {
          opacity: 0,
          scale: 1,
          duration: 0.4,
        },
        0
      );

      // Switch sections
      tl.set(sections[activeDay], {
        display: "none",
      });

      tl.set(sections[index], {
        visibility: "visible", // Now show it
      });

      // Fade in new section
      tl.to(
        sections[index],
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
        },
        "-=0.2"
      );

      // Bring in cards with staggered effect
      tl.to(
        sections[index].querySelectorAll(".activity-card"),
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 1,
          clearProps: "scale", // Clean up to prevent performance issues
        },
        "-=0.3"
      );
    };

    // Add keyboard navigation for accessibility
    const handleKeyDown = (e) => {
      if (isScrollingRef.current) return;

      let direction = 0;

      // Arrow up/down or Page up/down for navigation
      switch (e.key) {
        case "ArrowUp":
        case "PageUp":
          direction = -1;
          break;
        case "ArrowDown":
        case "PageDown":
          direction = 1;
          break;
        default:
          return; // Not a navigation key
      }

      const nextIndex = currentIndex + direction;

      // Validate bounds
      if (nextIndex < 0 || nextIndex >= itineraryData.length) {
        return;
      }

      // Set states
      isScrollingRef.current = true;
      lastScrollTime = Date.now();
      currentIndex = nextIndex;
      setActiveDay(nextIndex);

      // Animate
      animateToSectionSafe(nextIndex);

      // Force a timeout to reset scrolling state
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);

      // Prevent default to avoid page scrolling
      e.preventDefault();
    };

    // Initialize after DOM is ready
    const initializeTimeline = () => {
      const dateIndicators = document.querySelectorAll(".date-indicator");
      const sections = sectionsRef.current;

      if (
        !timeline ||
        !dateIndicators.length ||
        !sections ||
        !sections.length
      ) {
        // Try again later if elements aren't ready
        setTimeout(initializeTimeline, 100);
        return;
      }

      // Update timeline indicators to show only 3 at a time
      updateVisibleDates(activeDay);

      // Initialize sections
      sections.forEach((section, i) => {
        if (section) {
          gsap.set(section, {
            opacity: i === activeDay ? 1 : 0,
            scale: i === activeDay ? 1 : 0.95,
            display: i === activeDay ? "block" : "none",
          });
        }
      });

      // Animate initial cards
      if (sections[activeDay]) {
        const cards = sections[activeDay].querySelectorAll(".activity-card");
        if (cards.length) {
          gsap.fromTo(
            cards,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.1,
              duration: 0.6,
              ease: "power3.out",
            }
          );
        }
      }

      // Add event listeners after everything is set up
      container.addEventListener("wheel", handleWheel, { passive: false });
      container.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      container.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      container.addEventListener("touchend", handleTouchEnd, { passive: true });
      window.addEventListener("keydown", handleKeyDown); // Add keyboard navigation
    };

    // Start initialization
    document.body.style.overflow = "hidden";
    setTimeout(initializeTimeline, 500);

    // Cleanup
    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
        container.removeEventListener("touchend", handleTouchEnd);
      }
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [itineraryData.length, activeDay]);

  // Handler for clicking date indicators
  const handleDateClick = (index) => {
    // Use the ref instead of local variable
    if (index === activeDay || isScrollingRef.current) return;

    isScrollingRef.current = true;
    setActiveDay(index);

    // Get the current sections
    const currentSections = sectionsRef.current;

    // Create a timeline for smooth animations
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        isScrollingRef.current = false;
      },
    });

    // Update visible dates
    updateVisibleDates(index);

    // Animate timeline indicators
    tl.to(
      ".date-indicator",
      {
        opacity: (i) => (i === index ? 1 : 0.4),
        scale: (i) => (i === index ? 1.2 : 0.9),
        duration: 0.4,
      },
      0
    );

    if (currentSections[activeDay] && currentSections[index]) {
      // Pre-position the new section
      tl.set(
        currentSections[index],
        {
          display: "block",
          opacity: 0,
          scale: 0.98,
          visibility: "hidden", // Hide initially to prevent flickering
        },
        0
      );

      // Pre-position cards
      tl.set(
        currentSections[index].querySelectorAll(".activity-card"),
        {
          y: 15,
          opacity: 0,
          scale: 0.97,
        },
        0
      );

      // Fade out current section
      tl.to(
        currentSections[activeDay],
        {
          opacity: 0,
          scale: 0.95,
          duration: 0.4,
        },
        0
      );

      // Switch sections
      tl.set(currentSections[activeDay], { display: "none" });
      tl.set(currentSections[index], { visibility: "visible" });

      // Fade in new section
      tl.to(
        currentSections[index],
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
        },
        "-=0.2"
      );

      // Staggered card animation
      tl.to(
        currentSections[index].querySelectorAll(".activity-card"),
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.07,
          ease: "back.out(1.2)",
          clearProps: "scale",
        },
        "-=0.3"
      );
    }
  };

  // For the initial animation of cards on first render
  useEffect(() => {
    if (typeof window === "undefined" || !sectionsRef.current[activeDay])
      return;

    const cards =
      sectionsRef.current[activeDay].querySelectorAll(".activity-card");
    if (cards.length) {
      gsap.fromTo(
        cards,
        {
          y: 30,
          opacity: 0,
          scale: 0.97,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.08,
          duration: 0.6,
          delay: 0.2,
          ease: "back.out(1.2)",
          clearProps: "scale",
        }
      );
    }
  }, []);

  // Add a new function to update visible dates
  const updateVisibleDates = (currentIndex) => {
    const dateIndicators = document.querySelectorAll(".date-indicator");
    if (!dateIndicators.length) return;

    const timelineHeight = timelineRef.current.clientHeight;
    // Position in exact middle of timeline height
    const middlePosition = timelineHeight / 2;
    const spacing = 100; // Spacing between dates in pixels

    dateIndicators.forEach((indicator, idx) => {
      // Determine visibility and position
      const isVisible =
        idx === currentIndex - 1 || // Previous
        idx === currentIndex || // Current
        idx === currentIndex + 1; // Next

      // Position the indicators
      if (isVisible) {
        let verticalPosition;

        if (idx === currentIndex - 1) {
          // Previous date (positioned above current)
          verticalPosition = middlePosition - spacing;
        } else if (idx === currentIndex) {
          // Current date (positioned in middle)
          verticalPosition = middlePosition;
        } else {
          // Next date (positioned below current)
          verticalPosition = middlePosition + spacing;
        }

        gsap.to(indicator, {
          y: verticalPosition,
          opacity: idx === currentIndex ? 1 : 0.6,
          scale: idx === currentIndex ? 1.2 : 0.9,
          xPercent: -50,
          display: "flex",
          duration: 0.4,
          ease: "power2.inOut",
        });
      } else {
        // Hide indicators that are not visible
        gsap.to(indicator, {
          opacity: 0,
          display: "none",
          duration: 0.2,
        });
      }
    });
  };

  // Add a helper inside the component to check if a date should be rendered
  const shouldRenderDate = (index) => {
    // Always render the active day and its immediate neighbors
    return Math.abs(index - activeDay) <= 1;
  };

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white min-h-screen transition-colors duration-300">
      <div className="h-16 flex items-center justify-center bg-white dark:bg-black sticky top-0 z-10">
        <h1 className="text-2xl font-bold">Your Itinerary Details</h1>
      </div>

      {/* Create a wrapper with real scrollable height */}
      <div style={{ height: `${100 * itineraryData.length}vh` }}>
        <div ref={containerRef} className="h-screen overflow-hidden">
          <div className="flex h-full">
            {/* Left side - Timeline */}
            <div
              ref={timelineRef}
              className="relative w-1/4 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-12 overflow-hidden"
            >
              <div className="timeline-markers relative h-full w-full flex flex-col items-center">
                <div className="absolute h-full w-0.5 bg-gradient-to-b from-transparent via-gray-400 dark:via-gray-600 to-transparent left-1/2 transform -translate-x-1/2 z-0"></div>

                {/* Replace the day counters with First/Last day navigation buttons */}
                {activeDay > 0 && (
                  <div
                    className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-gray-200 dark:bg-gray-800 rounded-full px-4 py-2 text-sm font-medium cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleDateClick(0)}
                  >
                    First Day
                  </div>
                )}

                {activeDay < itineraryData.length - 1 && (
                  <div
                    className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-200 dark:bg-gray-800 rounded-full px-4 py-2 text-sm font-medium cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleDateClick(itineraryData.length - 1)}
                  >
                    Last Day
                  </div>
                )}

                {/* Date indicators - centered around the current day */}
                {itineraryData.map((day, index) => (
                  <div
                    key={index}
                    className={`date-indicator cursor-pointer flex-col items-center absolute left-1/2 transition-all duration-300 ease-in-out ${
                      shouldRenderDate(index) ? "flex" : "hidden"
                    }`}
                    onClick={() => handleDateClick(index)}
                  >
                    <div
                      className={`w-5 h-5 rounded-full mb-3 transition-all ${
                        activeDay === index
                          ? "bg-black dark:bg-white border-2 border-white dark:border-black"
                          : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    ></div>
                    <div
                      className={`text-lg font-semibold transition-all ${
                        activeDay === index
                          ? "text-black dark:text-white"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {day.date}
                    </div>
                    <div
                      className={`text-xs ${
                        activeDay === index
                          ? "text-black dark:text-white"
                          : "text-gray-500 dark:text-gray-500"
                      }`}
                    >
                      Day {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Day content */}
            <div className="w-3/4 px-10 py-16 relative overflow-hidden">
              {itineraryData.map((day, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    // Ensure we're not overwriting the array but adding to it
                    if (el && !sectionsRef.current[index]) {
                      sectionsRef.current[index] = el;
                    }
                  }}
                  className={`day-section absolute top-0 left-0 w-full h-full p-10 transition-opacity ${
                    activeDay === index ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <h2 className="text-3xl font-bold mb-8 text-center">
                    Day {index + 1} - {day.date}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Morning */}
                    <Card className="activity-card bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 backdrop-blur-sm">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mr-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-black dark:text-white"
                          >
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2" />
                            <path d="M12 20v2" />
                            <path d="m4.93 4.93 1.41 1.41" />
                            <path d="m17.66 17.66 1.41 1.41" />
                            <path d="M2 12h2" />
                            <path d="M20 12h2" />
                            <path d="m6.34 17.66-1.41 1.41" />
                            <path d="m19.07 4.93-1.41 1.41" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold">Morning</h3>
                      </div>
                      <h4 className="font-semibold text-lg">
                        {day.morning.name}
                      </h4>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        📍 {day.morning.location}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {day.morning.description}
                      </p>
                      <div className="text-sm bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full inline-block">
                        🚗 {day.morning.transportation}
                      </div>
                    </Card>

                    {/* Afternoon */}
                    <Card className="activity-card bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 backdrop-blur-sm">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mr-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-black dark:text-white"
                          >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold">Afternoon</h3>
                      </div>
                      <h4 className="font-semibold text-lg">
                        {day.afternoon.name}
                      </h4>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        📍 {day.afternoon.location}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {day.afternoon.description}
                      </p>
                      <div className="text-sm bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full inline-block">
                        🚗 {day.afternoon.transportation}
                      </div>
                    </Card>

                    {/* Evening */}
                    <Card className="activity-card bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 backdrop-blur-sm">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mr-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-black dark:text-white"
                          >
                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold">Evening</h3>
                      </div>
                      <h4 className="font-semibold text-lg">
                        {day.evening.name}
                      </h4>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        📍 {day.evening.location}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {day.evening.description}
                      </p>
                      <div className="text-sm bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full inline-block">
                        🚗 {day.evening.transportation}
                      </div>
                    </Card>

                    {/* Additional Activity */}
                    <Card className="activity-card bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 backdrop-blur-sm">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mr-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-black dark:text-white"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="m15 9-6 6" />
                            <path d="m9 9 6 6" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold">
                          Additional Activity
                        </h3>
                      </div>
                      <h4 className="font-semibold text-lg">
                        {day.additionalActivity.name}
                      </h4>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        📍 {day.additionalActivity.location}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {day.additionalActivity.description}
                      </p>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryTimeline;
