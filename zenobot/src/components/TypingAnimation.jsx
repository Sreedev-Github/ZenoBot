import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TypingAnimation = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    setIsComplete(false);

    if (!text) {
      setIsComplete(true);
      return;
    }

    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text[i]);
        i++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block ml-0.5"
        >
          |
        </motion.span>
      )}
    </>
  );
};

export default TypingAnimation;
