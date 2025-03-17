"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

function TripDetailsPage() {
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");
  const days = searchParams.get("days");
  const budget = searchParams.get("budget");

  useEffect(() => {
    // Show loader for 5 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Full-screen loader overlay */}
      <AnimatePresence>
        {loading && (
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

      {/* Main content - appears when loading is complete */}
      <div className="container mx-auto px-4 py-8 max-w-4xl min-h-screen flex items-center justify-center">
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white/50 dark:bg-black/50 rounded-lg p-6 shadow-lg w-full"
          >
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold mb-6 text-center text-black dark:text-white"
            >
              Your Trip Details
            </motion.h1>

            <div className="space-y-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col p-4 bg-white/70 dark:bg-black/70 rounded-md"
              >
                <span className="text-black/60 dark:text-white/60">From</span>
                <span className="text-xl font-semibold text-black dark:text-white">
                  {from}
                </span>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col p-4 bg-white/70 dark:bg-black/70 rounded-md"
              >
                <span className="text-black/60 dark:text-white/60">To</span>
                <span className="text-xl font-semibold text-black dark:text-white">
                  {to}
                </span>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col p-4 bg-white/70 dark:bg-black/70 rounded-md"
              >
                <span className="text-black/60 dark:text-white/60">Date</span>
                <span className="text-xl font-semibold text-black dark:text-white">
                  {date}
                </span>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="flex flex-col p-4 bg-white/70 dark:bg-black/70 rounded-md"
              >
                <span className="text-black/60 dark:text-white/60">
                  Duration
                </span>
                <span className="text-xl font-semibold text-black dark:text-white">
                  {days} {parseInt(days) === 1 ? "day" : "days"}
                </span>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex flex-col p-4 bg-white/70 dark:bg-black/70 rounded-md"
              >
                <span className="text-black/60 dark:text-white/60">Budget</span>
                <span className="text-xl font-semibold text-black dark:text-white">
                  {budget}
                </span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-8 text-center"
            >
              <p className="text-black/70 dark:text-white/70 italic">
                We're generating your personalized travel itinerary...
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </>
  );
}

export default TripDetailsPage;
