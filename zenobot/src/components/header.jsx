"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
          <h1 className="text-2xl md:text-3xl font-bold text-white">ZenoBot</h1>
        </div>

        {/* Navigation Links - Desktop & Tablet */}
        <div className="hidden md:flex align-text-center md:gap-8 lg:gap-32  justify-evenly py-4 px-6 md:px-10 rounded-full bg-white bg-opacity-15 outline-2 outline outline-white/25">
          <a href="#" className="text-white relative group">
            Home
            <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-white rounded-full group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
          </a>
          <a href="#" className="text-white relative group">
            About
            <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-white rounded-full group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
          </a>
          <a href="#" className="text-white relative group">
            Contact
            <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-white rounded-full group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
          </a>
          <a href="#" className="text-white relative group">
            Feedback
            <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-white rounded-full group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
          </a>
        </div>

        {/* Login Button - Desktop & Tablet */}
        <button className="hidden md:block bg-white text-black p-2 md:p-4 px-6 md:px-10 rounded-full hover:bg-transparent hover:text-white transition-all duration-300 ease-linear border-2 border-transparent hover:border-white">
          Login
        </button>

        {/* Hamburger Menu - Mobile Only */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-full bg-white bg-opacity-15 border border-white/25"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-0.5 bg-white mb-1.5 transition-all duration-300 ${
              isMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`block w-5 h-0.5 bg-white transition-opacity duration-300 ${
              isMenuOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`block w-5 h-0.5 bg-white mt-1.5 transition-all duration-300 ${
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
            className="md:hidden absolute top-16 left-0 right-0 mx-4 p-4 rounded-lg bg-white bg-opacity-15 backdrop-blur-sm border border-white/25 z-50"
          >
            <div className="flex flex-col gap-4">
              <a
                href="#"
                className="text-white text-lg py-2 px-4 hover:bg-white/10 rounded-md transition-colors"
              >
                Home
              </a>
              <a
                href="#"
                className="text-white text-lg py-2 px-4 hover:bg-white/10 rounded-md transition-colors"
              >
                About
              </a>
              <a
                href="#"
                className="text-white text-lg py-2 px-4 hover:bg-white/10 rounded-md transition-colors"
              >
                Contact
              </a>
              <a
                href="#"
                className="text-white text-lg py-2 px-4 hover:bg-white/10 rounded-md transition-colors"
              >
                Feedback
              </a>
              <button className="bg-white text-black py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors mt-2">
                Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Header;
