import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PushPopLoader = ({
  message,
  submessage,
  color = "#38bdf8",
  darkMode = false,
}) => {
  const [dots, setDots] = useState("");

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Define colors based on darkMode
  const bgColor = darkMode ? "#1E1E1E" : "#fff";
  const textColor = darkMode ? "#FFFFFF" : "#333";
  const subTextColor = darkMode ? "#B0B0B0" : "#666";

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-8">
      {/* Loader circles */}
      <div className="flex space-x-3 mb-8">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 1, 1, 0],
              opacity: [0, 1, 1, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: color }}
          ></motion.div>
        ))}
      </div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-center"
      >
        <h3
          className={`text-xl font-medium mb-2 ${
            darkMode ? "text-text-white" : "text-text-green-800"
          }`}
        >
          {message}
          <span className="inline-block w-8">{dots}</span>
        </h3>
        {submessage && (
          <p
            className={`text-sm ${
              darkMode ? "text-muted-gray-dark" : "text-muted-gray"
            }`}
          >
            {submessage}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default PushPopLoader;
