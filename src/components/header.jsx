"use client";
import React from "react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

function Header() {
  return (
    <div className="fixed top-0 left-0 right-0 w-full p-4 z-50 bg-nav-bg dark:bg-nav-bg-dark backdrop-blur-md shadow-md dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)]">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex justify-between items-center mx-4 md:mx-8"
      >
        {/* Logo */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white dark:text-text-white">
            <a href="/">ZenoBot</a>
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
