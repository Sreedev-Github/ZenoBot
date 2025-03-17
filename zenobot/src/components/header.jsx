"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="absolute w-full p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex justify-between items-center mx-2 md:mx-6 lg:mx-10"
      >
        {/* Logo or Website Name */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
            ZenoBot
          </h1>
        </div>

        {/* Navigation Links - Desktop & Tablet */}
        <div className="hidden md:flex align-text-center md:gap-8 lg:gap-32 justify-evenly py-4 px-6 md:px-10 rounded-full bg-black dark:bg-slate-50 text-white dark:text-black outline-2 outline outline-white/25 dark:outline-black/25 shadow-md">
          <a href="#" className="relative group">
            Home
            <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-white dark:bg-black rounded-full group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
          </a>
          <a href="#" className="relative group">
            About
            <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-white dark:bg-black rounded-full group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
          </a>
          <a href="#" className="relative group">
            Contact
            <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-white dark:bg-black rounded-full group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
          </a>
          <a href="#" className="relative group">
            Feedback
            <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-white dark:bg-black rounded-full group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
          </a>
        </div>

        <div className="flex gap-4 items-center">
          {/* Theme Toggle */}
          <div className="md:block hidden">
            <ThemeToggle />
          </div>

          {/* Login Button - Desktop & Tablet */}
          <button className="hidden md:block bg-black dark:bg-white text-white dark:text-black p-2 md:p-4 px-6 md:px-10 rounded-full hover:bg-transparent hover:text-black dark:hover:text-white transition-all duration-300 ease-linear border-2 border-transparent hover:border-black dark:hover:border-white">
            Login
          </button>
        </div>

        {/* Hamburger Menu - Mobile Only */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-full bg-white dark:bg-black bg-opacity-15 border border-white/25 dark:border-black/25"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-0.5 bg-black dark:bg-white mb-1.5 transition-all duration-300 ${
              isMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`block w-5 h-0.5 bg-black dark:bg-white transition-opacity duration-300 ${
              isMenuOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`block w-5 h-0.5 bg-black dark:bg-white mt-1.5 transition-all duration-300 ${
              isMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </button>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden absolute top-16 left-0 right-0 mx-4 p-4 rounded-lg bg-white dark:bg-black bg-opacity-15 backdrop-blur-sm border border-white/25 dark:border-black/25 z-50"
          >
            <div className="flex flex-col gap-4">
              <a
                href="#"
                className="text-black dark:text-white text-lg py-2 px-4 hover:bg-white/10 dark:hover:bg-black/10 rounded-md transition-colors"
              >
                Home
              </a>
              <a
                href="#"
                className="text-black dark:text-white text-lg py-2 px-4 hover:bg-white/10 dark:hover:bg-black/10 rounded-md transition-colors"
              >
                About
              </a>
              <a
                href="#"
                className="text-black dark:text-white text-lg py-2 px-4 hover:bg-white/10 dark:hover:bg-black/10 rounded-md transition-colors"
              >
                Contact
              </a>
              <a
                href="#"
                className="text-black dark:text-white text-lg py-2 px-4 hover:bg-white/10 dark:hover:bg-black/10 rounded-md transition-colors"
              >
                Feedback
              </a>
              <button className="bg-black dark:bg-white text-white dark:text-black py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors mt-2">
                Login
              </button>
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Header;
