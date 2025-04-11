"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="absolute w-full p-4 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-md">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex justify-between items-center mx-4 md:mx-8"
      >
        {/* Logo */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
            <a href="/home">ZenoBot</a>
          </h1>
        </div>

        {/* Theme Toggle */}
        <div>
          <ThemeToggle />
        </div>
      </motion.div>
    </div>
  );
}

export default Header;
