"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

function PageFadeWrapper({ children }) {
  return (
    <div className="relative">
      {/* Main Content */}
      {children}

      {/* Black overlay that fades out on page load */}
      <AnimatePresence>
        <motion.div
          key="pageFadeOverlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-50 pointer-events-none"
        />
      </AnimatePresence>
    </div>
  );
}

export default PageFadeWrapper;
