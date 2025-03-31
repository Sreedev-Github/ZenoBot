"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

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

export default function TryPage() {
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

  const router = useRouter();

  const handleSubmit = () => {
    const queryParams = new URLSearchParams({
      from: from || "",
      to: to || "",
      date: travelDate ? format(travelDate, "yyyy-MM-dd") : "",
      days: tripDuration.toString(),
      budget: selectedBudget || "",
    });

    const url = `/trip-details?${queryParams.toString()}`;
    router.push(url);
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
            console.log("Selecting budget:", selectedOption.value); // Debug log
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
              className="w-full bg-transparent border-b-2 dark:border-white/30 text-black dark:text-white text-xl py-3 px-2 focus:outline-none border-black/40 transition-colors"
              placeholder="Enter your starting location..."
              autoFocus
            />
            {showDropdown && filteredOptions.length > 0 && (
              <div className="absolute w-full mt-1 max-h-60 overflow-y-auto bg-black/80 dark:bg-white border border-white/20 dark:border-white/20 rounded-md z-50">
                {filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 cursor-pointer text-white dark:text-black ${
                      selectedOptionIndex === index
                        ? "bg-white/20 dark:bg-black/20"
                        : "hover:bg-white/10 dark:hover:bg-black/10"
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
              className="w-full bg-transparent border-b-2 dark:border-white/30 text-black dark:text-white text-xl py-3 px-2 focus:outline-none border-black/40 transition-colors"
              placeholder="Enter your destination..."
              autoFocus
            />
            {showDropdown && filteredOptions.length > 0 && (
              <div className="absolute w-full mt-1 max-h-60 overflow-y-auto bg-black/80 dark:bg-white border border-white/20 dark:border-white/20 rounded-md z-50">
                {filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 cursor-pointer text-white dark:text-black ${
                      selectedOptionIndex === index
                        ? "bg-white/20 dark:bg-black/20"
                        : "hover:bg-white/10 dark:hover:bg-black/10"
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
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  tabIndex="0" // Make it focusable
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left bg-transparent dark:border-white/30 border-black/30 dark:text-white text-black text-xl py-3 px-2 rounded-none  hover:border-black dark:hover:border-white hover:bg-transparent focus-visible:ring-0 focus-visible:outline-none",
                    !travelDate && "text-white/50 dark:text-black/50"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setIsDatePickerOpen(true);
                    }
                  }}
                  autoFocus // Added autoFocus attribute
                >
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  {travelDate
                    ? format(travelDate, "MMM dd, yyyy")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0 bg-white dark:bg-black text-black dark:text-white border border-white/20 dark:border-black/20 rounded-md shadow-md">
                <Calendar
                  mode="single"
                  selected={travelDate}
                  onSelect={(date) => {
                    setTravelDate(date);
                    setIsDatePickerOpen(false); // Close the Popover
                  }}
                  initialFocus
                  className="w-auto border-none shadow-none"
                />
              </PopoverContent>
            </Popover>
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
                    ? "border-black/50 dark:border-white/50 text-black dark:text-white"
                    : "border-black/20 dark:border-white/20 text-black/30 dark:text-white/30"
                }`}
              >
                <Minus className="w-5 h-5" />
              </motion.button>

              <div className="text-black dark:text-white text-4xl font-bold w-24 text-center">
                {tripDuration}
              </div>

              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={incrementDuration}
                disabled={tripDuration >= 14}
                className={`flex items-center justify-center w-12 h-12 rounded-full border ${
                  tripDuration < 14
                    ? "border-black/50 dark:border-white/50 text-black dark:text-white"
                    : "border-black/20 dark:border-white/20 text-black/30 dark:text-white/30"
                }`}
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="text-black/60 dark:text-white/60 text-center mt-4">
              {tripDuration === 1 ? "day" : "days"}
            </div>
          </div>
        );
      case 4:
        return (
          <div
            className="w-full flex flex-col items-center focus-visible:ring-0 focus-visible:outline-none"
            tabIndex="0" // Change from -1 to 0 to make it focusable
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
                          ? "bg-black dark:bg-white text-white dark:text-black border-black/50 dark:border-white/50"
                          : isFocused
                          ? "bg-white/70 dark:bg-black/70 text-black dark:text-white border-black/70 dark:border-white/70 ring-2 ring-black dark:ring-white"
                          : "bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/80 text-black dark:text-white border-black/50 dark:border-white/50"
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black">
      <div className="w-full max-w-xl px-4 py-12 relative">
        {/* Progress bar - at top of screen */}
        <div className="fixed top-0 left-0 w-full bg-white/5 dark:bg-black/5 h-1">
          <motion.div
            className="h-full bg-black dark:bg-white"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentStep + 1) / questions.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="mt-16 md:mt-24">
          {/* Steps indicator */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? "w-4 bg-black dark:bg-white"
                      : index < currentStep
                      ? "bg-black/80 dark:bg-white/80"
                      : "bg-black/30 dark:bg-white/30"
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
              <h2 className="text-black dark:text-white text-2xl sm:text-3xl font-bold mb-8 text-center px-4">
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
                    className="bg-black/10 dark:bg-white/10 rounded-lg p-3 sm:p-4"
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
