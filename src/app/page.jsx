"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Send,
  CalendarIcon,
  Minus,
  Plus,
  Wallet,
  CreditCard,
  Gem,
} from "lucide-react";
import states from "@/utils/stateCities.json";
import { format } from "date-fns";
import { useTravelContext } from "@/context/travelContext.jsx";

const questions = [
  "Enter your starting location...",
  "Enter your destination...",
  "Pick a date...",
  "How long will you be staying?",
  "What is your budget?",
];

const budgetOptions = [
  {
    label: "Low Budget",
    description: "Economy travel and accommodations",
    value: "Low Budget",
    icon: Wallet,
  },
  {
    label: "Medium Budget",
    description: "Comfortable travel with some luxuries",
    value: "Medium Budget",
    icon: CreditCard,
  },
  {
    label: "High Budget",
    description: "Premium travel and exclusive experiences",
    value: "High Budget",
    icon: Gem,
  },
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(["", "", "", "", ""]);
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [travelDate, setTravelDate] = useState(null);
  const [tripDuration, setTripDuration] = useState(3);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(-1);
  const [selectedBudget, setSelectedBudget] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromIsValid, setFromIsValid] = useState(false);
  const [toIsValid, setToIsValid] = useState(false);
  const [selectedBudgetIndex, setSelectedBudgetIndex] = useState(-1);

  const budgetStateRef = React.useRef({
    selectedBudgetIndex: -1,
    selectedBudget: "",
    budgetOptions: budgetOptions,
  });

  useEffect(() => {
    setTravelDate(new Date());
  }, []);

  // Create flattened location options from the states object
  const locationOptions = useMemo(() => {
    const options = [];
    if (states && typeof states === "object") {
      Object.entries(states).forEach(([state, cities]) => {
        if (Array.isArray(cities)) {
          cities.forEach((city) => {
            options.push(`${city}, ${state}`);
          });
        }
      });
    }
    return options;
  }, []);

  const { setTravelData } = useTravelContext();
  const router = useRouter();

  const handleSubmit = () => {
    const travelData = {
      from,
      to,
      date: travelDate ? format(travelDate, "yyyy-MM-dd") : "",
      duration: tripDuration,
      budget: selectedBudget,
    };
    setTravelData(travelData);
    router.push("/trip-details");
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        return fromIsValid;
      case 1:
        return toIsValid;
      case 2:
        return travelDate !== null;
      case 3:
        return tripDuration > 0;
      case 4:
        return selectedBudget !== "";
      default:
        return false;
    }
  };

  const isStepValid = validateStep();

  const handleNext = () => {
    if (isStepValid) {
      const newAnswers = [...answers];

      // Store the appropriate value based on the step
      if (currentStep === 0) {
        newAnswers[currentStep] = from;
      } else if (currentStep === 1) {
        newAnswers[currentStep] = to;
      } else if (currentStep === 2) {
        newAnswers[currentStep] = travelDate
          ? format(travelDate, "MMM dd, yyyy")
          : "";
      } else if (currentStep === 3) {
        newAnswers[currentStep] = `${tripDuration} ${
          tripDuration === 1 ? "day" : "days"
        }`;
      } else if (currentStep === 4) {
        newAnswers[currentStep] = selectedBudget;
      }

      setAnswers(newAnswers);
      setCurrentStep((prevStep) => prevStep + 1);
      setInputValue("");
      setShowDropdown(false);
      setSelectedOptionIndex(-1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);

      // Set the appropriate input value when going back
      if (prevStep === 0) {
        setInputValue(from || "");
      } else if (prevStep === 1) {
        setInputValue(to || "");
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (currentStep === 4) {
        // For budget step, navigate through budget options
        setSelectedBudgetIndex((prevIndex) =>
          Math.min(prevIndex + 1, budgetOptions.length - 1)
        );
      } else {
        // Existing code for dropdown navigation
        setSelectedOptionIndex((prevIndex) =>
          Math.min(prevIndex + 1, filteredOptions.length - 1)
        );
        // Make sure dropdown is visible when using arrow keys
        if (filteredOptions.length > 0) {
          setShowDropdown(true);
        }
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (currentStep === 4) {
        // For budget step, navigate through budget options
        setSelectedBudgetIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      } else {
        // Existing code for dropdown navigation
        setSelectedOptionIndex((prevIndex) => Math.max(prevIndex - 1, -1));
        // Make sure dropdown is visible when using arrow keys
        if (filteredOptions.length > 0) {
          setShowDropdown(true);
        }
      }
    } else if (e.key === "Enter") {
      e.preventDefault();

      if (currentStep === 4) {
        // For budget step - check if we have a valid index
        if (
          selectedBudgetIndex >= 0 &&
          selectedBudgetIndex < budgetOptions.length
        ) {
          const selectedOption = budgetOptions[selectedBudgetIndex];

          // Check if this budget is already selected
          if (selectedBudget === selectedOption.value) {
            // If it's already selected, submit the form
            handleSubmit();
          } else {
            // Otherwise, select this budget option
            setSelectedBudget(selectedOption.value);
          }
        }
      }
      // If dropdown is visible and an option is selected, use that option
      else if (showDropdown && selectedOptionIndex !== -1) {
        const selectedOption = filteredOptions[selectedOptionIndex];
        if (currentStep === 0) {
          setFrom(selectedOption);
          setFromIsValid(true);
        } else if (currentStep === 1) {
          setTo(selectedOption);
          setToIsValid(true);
        }
        setInputValue(selectedOption);
        setShowDropdown(false);
        setSelectedOptionIndex(-1);
      }
      // If no dropdown or no selection but input is valid, go to next step
      else if (isStepValid) {
        handleNext();
      }
      // If dropdown is visible but no selection, close it
      else if (showDropdown) {
        setShowDropdown(false);
      }
    } else if (e.key === "Escape") {
      // Add escape key support to close dropdown
      if (showDropdown) {
        e.preventDefault();
        setShowDropdown(false);
        setSelectedOptionIndex(-1);
      }
    }
  };

  useEffect(() => {
    if (currentStep === 0 || currentStep === 1) {
      if (inputValue.trim() === "") {
        setFilteredOptions([]);
        setShowDropdown(false);
        return;
      }

      const filtered = locationOptions.filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
      setShowDropdown(true);
      setSelectedOptionIndex(-1);
    }
  }, [inputValue, locationOptions, currentStep]);

  const incrementDuration = () => {
    setTripDuration((prevDuration) => Math.min(prevDuration + 1, 14));
  };

  const decrementDuration = () => {
    setTripDuration((prevDuration) => Math.max(prevDuration - 1, 1));
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.key === "-" || e.key === "Subtract") && tripDuration > 1) {
        decrementDuration();
      } else if ((e.key === "+" || e.key === "Add") && tripDuration < 14) {
        incrementDuration();
      }
    };

    // Add event listener when component mounts and step is 3 (duration step)
    if (currentStep === 3) {
      window.addEventListener("keydown", handleGlobalKeyDown);
    }

    // Remove event listener when component unmounts or step changes
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [currentStep, tripDuration]);

  useEffect(() => {
    budgetStateRef.current = {
      selectedBudgetIndex,
      selectedBudget,
      budgetOptions,
    };
  }, [selectedBudgetIndex, selectedBudget]);

  // Add this useEffect to initialize the budget index when needed

  useEffect(() => {
    if (currentStep === 4) {
      // Initialize with the first option if nothing is selected
      if (selectedBudget === "") {
        setSelectedBudgetIndex(0);
      } else {
        // Find the index of the currently selected budget
        const index = budgetOptions.findIndex(
          (option) => option.value === selectedBudget
        );
        setSelectedBudgetIndex(index !== -1 ? index : 0);
      }
    }
  }, [currentStep, selectedBudget]);

  // Add this useEffect to handle focus and keyboard events for the budget step

  useEffect(() => {
    if (currentStep === 4) {
      // Set initial focus to the container when reaching step 4
      const container = document.querySelector(
        ".w-full.flex.flex-col.items-center"
      );
      if (container) {
        container.focus();
      }

      // Initialize with the first option if nothing is selected
      if (selectedBudget === "") {
        setSelectedBudgetIndex(0);
      } else {
        // Find the index of the currently selected budget
        const index = budgetOptions.findIndex(
          (option) => option.value === selectedBudget
        );
        setSelectedBudgetIndex(index !== -1 ? index : 0);
      }
    }
  }, [currentStep, selectedBudget]);

  useEffect(() => {
    if (isDatePickerOpen) {
      const handleClickOutside = (event) => {
        const calendarElement = document.querySelector(".calendar-dropdown");
        if (calendarElement && !calendarElement.contains(event.target)) {
          if (!event.target.closest("button[data-calendar-trigger]")) {
            setIsDatePickerOpen(false);
          }
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isDatePickerOpen]);

  const renderInput = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="relative dropdown-container">
            <input
              type="text"
              value={from}
              onChange={(e) => {
                const newValue = e.target.value;
                setFrom(newValue);
                setInputValue(newValue);
                // Invalidate when text is changed manually
                setFromIsValid(locationOptions.includes(newValue));

                // Show dropdown when typing
                if (newValue.trim() !== "") {
                  setShowDropdown(true);
                } else {
                  setShowDropdown(false);
                }
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-b-2 dark:border-white/30 text-text-green-800 dark:text-white text-xl py-3 px-2 focus:outline-none border-text-green-800/40 transition-colors"
              placeholder="Enter your starting location..."
              autoFocus
            />
            {showDropdown && filteredOptions.length > 0 && (
              <div className="absolute w-full mt-1 max-h-60 overflow-y-auto bg-white/95 dark:bg-black/90 border border-text-green-800/20 dark:border-white/20 rounded-md z-50 shadow-[0px_5px_15px_rgba(0,0,0,0.1)]">
                {filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 cursor-pointer text-text-green-800 dark:text-white ${
                      selectedOptionIndex === index
                        ? "bg-text-green-800/10 dark:bg-white/20"
                        : "hover:bg-text-green-800/5 dark:hover:bg-white/10"
                    }`}
                    onClick={() => {
                      setFrom(option);
                      setInputValue(option); // Update inputValue as well
                      setFromIsValid(true); // Mark as valid when selected from dropdown
                      setShowDropdown(false);
                      setSelectedOptionIndex(-1);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 1:
        return (
          <div className="relative dropdown-container">
            <input
              type="text"
              value={to}
              onChange={(e) => {
                const newValue = e.target.value;
                setTo(newValue);
                setInputValue(newValue);
                // Invalidate when text is changed manually
                setToIsValid(locationOptions.includes(newValue));

                // Show dropdown when typing
                if (newValue.trim() !== "") {
                  setShowDropdown(true);
                } else {
                  setShowDropdown(false);
                }
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-b-2 dark:border-white/30 text-text-green-800 dark:text-white text-xl py-3 px-2 focus:outline-none border-text-green-800/40 transition-colors"
              placeholder="Enter your destination..."
              autoFocus
            />
            {showDropdown && filteredOptions.length > 0 && (
              <div className="absolute w-full mt-1 max-h-60 overflow-y-auto bg-white/95 dark:bg-black/90 border border-text-green-800/20 dark:border-white/20 rounded-md z-50 shadow-[0px_5px_15px_rgba(0,0,0,0.1)]">
                {filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 cursor-pointer text-text-green-800 dark:text-white ${
                      selectedOptionIndex === index
                        ? "bg-text-green-800/10 dark:bg-white/20"
                        : "hover:bg-text-green-800/5 dark:hover:bg-white/10"
                    }`}
                    onClick={() => {
                      setTo(option);
                      setInputValue(option); // Update inputValue as well
                      setToIsValid(true); // Mark as valid when selected from dropdown
                      setShowDropdown(false);
                      setSelectedOptionIndex(-1);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="w-full">
            <div className="relative">
              <button
                data-calendar-trigger
                className="w-full flex items-center justify-between bg-transparent border-b-2 dark:border-white/30 border-text-green-800/40 text-text-green-800 dark:text-white text-xl py-3 px-2 focus:outline-none"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              >
                <span className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  {travelDate
                    ? format(travelDate, "MMM dd, yyyy")
                    : "Pick a date"}
                </span>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    isDatePickerOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDatePickerOpen && (
                <div className="absolute z-50 calendar-dropdown mt-1 left-1/2 -translate-x-1/2 w-full max-w-xs bg-white dark:bg-black rounded-lg shadow-xl p-4 border border-text-green-800/20 dark:border-gray-700">
                  {/* Header with month navigation */}
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={() => {
                        const newDate = new Date(travelDate || new Date());
                        newDate.setMonth(newDate.getMonth() - 1);
                        setTravelDate(newDate);
                      }}
                      className="p-2 rounded-full text-text-green-800 dark:text-gray-300 hover:bg-text-green-800/5 dark:hover:bg-gray-900"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <h3 className="text-text-green-800 dark:text-white font-medium">
                      {format(travelDate || new Date(), "MMMM yyyy")}
                    </h3>

                    <button
                      onClick={() => {
                        const newDate = new Date(travelDate || new Date());
                        newDate.setMonth(newDate.getMonth() + 1);
                        setTravelDate(newDate);
                      }}
                      className="p-2 rounded-full text-text-green-800 dark:text-gray-300 hover:bg-text-green-800/5 dark:hover:bg-gray-900"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Day labels */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-text-green-800/60 dark:text-gray-400"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {(() => {
                      const date = travelDate || new Date();
                      const year = date.getFullYear();
                      const month = date.getMonth();

                      // Get first day of month
                      const firstDayOfMonth = new Date(year, month, 1);
                      const daysInMonth = new Date(
                        year,
                        month + 1,
                        0
                      ).getDate();

                      // Calculate days to display from previous month
                      const firstDayIndex = firstDayOfMonth.getDay(); // 0 = Sunday

                      // Create array of dates to display
                      const daysArray = [];

                      // Add empty cells for days from previous month
                      for (let i = 0; i < firstDayIndex; i++) {
                        daysArray.push(
                          <div key={`empty-${i}`} className="h-8 w-8"></div>
                        );
                      }

                      // Add days of current month
                      for (let day = 1; day <= daysInMonth; day++) {
                        const currentDate = new Date(year, month, day);
                        const isSelected =
                          travelDate &&
                          currentDate.getDate() === travelDate.getDate() &&
                          currentDate.getMonth() === travelDate.getMonth() &&
                          currentDate.getFullYear() ===
                            travelDate.getFullYear();

                        const isToday =
                          currentDate.getDate() === new Date().getDate() &&
                          currentDate.getMonth() === new Date().getMonth() &&
                          currentDate.getFullYear() ===
                            new Date().getFullYear();

                        daysArray.push(
                          <button
                            key={day}
                            onClick={() => {
                              setTravelDate(new Date(year, month, day));
                              setIsDatePickerOpen(false);
                            }}
                            className={`flex items-center justify-center h-8 w-8 rounded-full text-sm transition-colors
                        ${
                          isSelected
                            ? "bg-text-green-800 dark:bg-white text-white dark:text-black font-medium"
                            : isToday
                            ? "bg-text-green-800/20 dark:bg-gray-800 text-text-green-800 dark:text-white font-medium"
                            : "text-text-green-800 dark:text-white hover:bg-text-green-800/10 dark:hover:bg-gray-800"
                        }`}
                          >
                            {day}
                          </button>
                        );
                      }

                      return daysArray;
                    })()}
                  </div>

                  {/* Today button */}
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => {
                        setTravelDate(new Date());
                        setIsDatePickerOpen(false);
                      }}
                      className="px-3 py-1.5 text-sm bg-text-green-800 dark:bg-white text-white dark:text-black rounded-md hover:bg-text-green-800/90 dark:hover:bg-gray-200 font-medium transition-colors"
                    >
                      Today
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full flex flex-col items-center">
            <div className="flex items-center justify-center space-x-5">
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={decrementDuration}
                disabled={tripDuration <= 1}
                className={`flex items-center justify-center w-12 h-12 rounded-full border ${
                  tripDuration > 1
                    ? "border-text-green-800/50 dark:border-white/50 text-text-green-800 dark:text-white"
                    : "border-text-green-800/20 dark:border-white/20 text-text-green-800/30 dark:text-white/30"
                }`}
              >
                <Minus className="w-5 h-5" />
              </motion.button>

              <div className="text-text-green-800 dark:text-white text-4xl font-bold w-24 text-center">
                {tripDuration}
              </div>

              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={incrementDuration}
                disabled={tripDuration >= 14}
                className={`flex items-center justify-center w-12 h-12 rounded-full border ${
                  tripDuration < 14
                    ? "border-text-green-800/50 dark:border-white/50 text-text-green-800 dark:text-white"
                    : "border-text-green-800/20 dark:border-white/20 text-text-green-800/30 dark:text-white/30"
                }`}
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="text-text-green-800/60 dark:text-white/60 text-center mt-4">
              {tripDuration === 1 ? "day" : "days"}
            </div>
          </div>
        );
      case 4:
        return (
          <div
            className="w-full flex flex-col items-center focus-visible:ring-0 focus-visible:outline-none"
            tabIndex="0"
            onKeyDown={handleKeyDown}
            ref={(el) => {
              // Auto-focus this container when step 4 is active
              if (currentStep === 4 && el) {
                el.focus();
              }
            }}
          >
            {budgetOptions.map((option, index) => {
              const Icon = option.icon;
              const isSelected = selectedBudget === option.value;
              const isFocused = selectedBudgetIndex === index;
              return (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full max-w-md flex items-center justify-center p-4 rounded-lg border transition-colors cursor-pointer mb-4
                    ${
                      isSelected
                        ? "bg-text-green-800 dark:bg-white text-white dark:text-black border-text-green-800/50 dark:border-white/50"
                        : isFocused
                        ? "bg-white/70 dark:bg-black/70 text-text-green-800 dark:text-white border-text-green-800/70 dark:border-white/70 ring-2 ring-text-green-800 dark:ring-white"
                        : "bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/80 text-text-green-800 dark:text-white border-text-green-800/50 dark:border-white/50"
                    }`}
                  onClick={() => {
                    if (selectedBudget === option.value) {
                      // If already selected, submit the form
                      handleSubmit();
                    } else {
                      // Otherwise just select this option
                      setSelectedBudget(option.value);
                    }
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="text-lg font-semibold flex justify-center gap-4">
                      {option.label} {Icon && <Icon className="h-5 w-5" />}
                    </div>
                    <div className="text-sm">{option.description}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center bg-background-white dark:bg-black">
      <div className="w-full max-w-xl px-4 relative">
        {/* Progress bar - at top of screen */}
        <div className="fixed top-0 left-0 w-full bg-white/5 dark:bg-black/5 h-1 z-[60]">
          <motion.div
            className="h-full bg-text-green-800 dark:bg-white"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentStep + 1) / questions.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="mt-8">
          {/* Steps indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? "w-4 bg-text-green-800 dark:bg-white"
                      : index < currentStep
                      ? "bg-text-green-800/80 dark:bg-white/80"
                      : "bg-text-green-800/30 dark:bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-10"
            >
              <h2 className="text-text-green-800 dark:text-white text-2xl sm:text-3xl font-bold mb-8 text-center px-4">
                {questions[currentStep]}
              </h2>
            </motion.div>
          </AnimatePresence>

          <div className="relative flex items-center">
            {/* Left Arrow */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-black/30 dark:border-white/30 mr-2 sm:mr-3 ${
                currentStep === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-100 cursor-pointer"
              }`}
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white" />
            </motion.button>

            {/* Input Field */}
            <motion.div
              className="flex-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {renderInput()}
            </motion.div>

            {/* Right Arrow */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border ${
                isStepValid
                  ? "border-black/30 dark:border-white/30 opacity-100 cursor-pointer"
                  : "border-black/10 dark:border-white/10 opacity-30 cursor-not-allowed"
              } ml-2 sm:ml-3`}
              onClick={() => {
                // If on last step, submit form
                if (currentStep === questions.length - 1) {
                  handleSubmit();
                } else {
                  // Otherwise, go to next step
                  handleNext();
                }
              }}
              disabled={!isStepValid}
            >
              {currentStep === questions.length - 1 ? (
                <Send className="w-4 h-4 sm:w-5 sm:h-5 text-black dark:text-white" />
              ) : (
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white" />
              )}
            </motion.button>
          </div>

          {/* Preview of answers */}
          <div className="mt-12 sm:mt-16 space-y-3 sm:space-y-4">
            {answers.map(
              (answer, index) =>
                answer && (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: index < currentStep ? 1 : 0 }}
                    className="bg-black/10 dark:bg-white/10 rounded-lg p-3 sm:p-4 shadow-[0px_0px_10px_1px_rgba(38,70,83,0.1)]"
                  >
                    <div className="text-black/60 dark:text-white/60 text-xs sm:text-sm">
                      {questions[index]}
                    </div>
                    <div className="text-black dark:text-white text-sm sm:text-base">
                      {answer}
                    </div>
                  </motion.div>
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
