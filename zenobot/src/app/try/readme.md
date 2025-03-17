# ZenoBot Travel Planner - Frontend Documentation

This README breaks down the travel planner interface of the ZenoBot application, explaining each component and function step by step. The application features a multi-step form that collects travel preferences and generates a personalized travel itinerary.

## Table of Contents

1. [Core Structure](#core-structure)
2. [Data Definitions](#data-definitions)
3. [Component State Management](#component-state-management)
4. [Form Navigation and Validation](#form-navigation-and-validation)
5. [User Input Handlers](#user-input-handlers)
6. [Location Dropdown Functionality](#location-dropdown-functionality)
7. [Keyboard Navigation](#keyboard-navigation)
8. [Step-Specific UI Components](#step-specific-ui-components)
9. [Layout and Animation](#layout-and-animation)

## Core Structure

```jsx
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
// ...additional imports
```

This section establishes the foundation of the component. The "use client" directive specifies that this is a client-side component in Next.js. The imports bring in React hooks for state management, Framer Motion for animations, and Next.js router for navigation. Additional utility imports include UI icons and date formatting tools.

## Data Definitions

```jsx
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
```

These constants define the content used throughout the form:

- questions: An array of prompts displayed for each step of the form

- budgetOptions: An array of objects defining the available budget choices, each containing a label, description, value, and associated icon

This approach centralizes the content, making it easier to modify prompts or add new budget options without changing the component structure.

## State Variables

```jsx

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

```

This section initializes all state variables needed for the component:

- Form progress: currentStep, answers
- Input control: inputValue, from, to, travelDate, tripDuration, selectedBudget
- UI state: showDropdown, filteredOptions, selectedOptionIndex, isDatePickerOpen, selectedBudgetIndex
- Validation: fromIsValid, toIsValid

The budgetStateRef uses a React ref to maintain a reference to budget-related state that won't trigger re-renders when updated, helpful for keyboard navigation handlers.

On initial load, the travel date is set to today's date using the useEffect hook.

## Location Data Processing

```jsx
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
```

This code transforms the imported states data (a JSON object with states and cities) into a flat array of location strings. The useMemo hook ensures this computation only happens once, not on every render.

Each location is formatted as "City, State" for consistent display and easy filtering. This approach efficiently converts a hierarchical data structure into a user-friendly format for dropdown selection.

## Navigation and Form Submission

```jsx
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
  console.log("URL:", url); // Check the constructed URL
  router.push(url);
};
```

This function handles form submission when the user completes all steps:

- Constructs a URLSearchParams object containing all form data
- Formats the travel date as "yyyy-MM-dd" if present
- Creates a URL string with query parameters
- Logs the URL for debugging purposes
- Navigates to the trip details page using Next.js router

This approach passes all form data through URL parameters, making it accessible to the destination page without needing complex state management between pages.

## Form

```jsx
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
```

This function determines whether the current step has valid input:

- Step 0 (from location): Requires a valid location selection

- Step 1 (to location): Requires a valid location selection

- Step 2 (date): Requires a non-null date

- Step 3 (duration): Requires a positive number

- Step 4 (budget): Requires a selection

The validation result is stored in isStepValid for use throughout the component. This centralized validation approach ensures consistency and makes it easy to update validation rules.

## Navigation Handlers

```jsx
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
```

These functions handle navigation between form steps:

### handleNext:

- Checks if the current step is valid

- Creates a copy of the answers array

- Stores the current step's value in the appropriate format

- Updates answers and advances to the next step

- Resets input-related state for the new step

### handlePrevious:

- Checks if it's not the first step

- Moves back to the previous step

- Restores input value based on the step (for locations)

This implementation ensures a smooth user experience when navigating between steps while preserving entered data.

## Keyboard Navigation

```jsx
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
```

This complex handler enables keyboard navigation throughout the form:

- Arrow Down/Up: Navigate through dropdown options or budget choices

- Enter:
  - Select a dropdown option if one is focused
  - Select a budget option or submit if on the budget step
  - Advance to next step if input is valid
  - Close dropdown if open with no selection
- Escape: Close open dropdowns

Different behaviors are applied based on the current step, particularly for the budget step (step 4) which has unique navigation requirements. This implementation enhances accessibility by providing comprehensive keyboard support.

## Location Dropdown Management

```jsx
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
```

This effect handles filtering location options based on user input:

- Only runs for steps 0 and 1 (location inputs)

- If input is empty, clears and hides dropdown

- Otherwise, filters locations containing the input text (case-insensitive)

- Updates filtered options and shows dropdown

- Resets selected option index

This implementation provides real-time filtering as the user types, enhancing the search experience.

## Duration Controls

```jsx
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
```

This section manages the trip duration control:

- Two functions handle incrementing and decrementing the duration, ensuring it stays between 1 and 14 days
- A global key event listener allows using +/- keys to adjust the duration
- The listener is only active when on step 3 (duration step)
- The cleanup function removes the listener when leaving the step or unmounting

This implementation adds an intuitive keyboard interface for adjusting duration values, complementing the button controls.

## Budget Selection Focus Management

```jsx
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
```

These effects manage focus and state for the budget selection step:

- The first effect keeps the budgetStateRef updated with the latest budget-related state

- The second effect initializes the selected budget index when reaching step 4

- The third effect sets focus on the container when reaching step 4 and also initializes the index

- This approach ensures proper keyboard navigation and visual focus indicators in the budget selection step.

## Step-Specific UI Rendering

```jsx
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
    // Additional cases for other steps...
  }
};
```

This function renders different UI elements based on the current step. For brevity, I'll explain just the "From" location input (case 0):

- Renders an input field with dropdown for location selection

- Input changes update multiple state values and validation

- The dropdown appears conditionally when options are available

- Selected and hovered options have special styling

- Clicking an option updates all related state values

The function contains similar UI implementations for each step, each tailored to the type of input required:

- Case 1: Destination location (similar to case 0)
- Case 2: Date picker using Popover and Calendar components
- Case 3: Duration selector with +/- buttons and keyboard support
- Case 4: Budget options with visual cards and keyboard navigation

This approach keeps the main component clean while allowing for complex, step-specific UI logic.

### Layout and Animation

```jsx
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
```

This section defines the complete UI layout with several key elements:

- Progress Bar: A fixed bar at the top showing completion progress
- Step Indicators: Dots showing current and completed steps
- Question Display: Current question with animation between steps
- Navigation Controls: Previous/next buttons with hover animations
- Input Area: Dynamic content based on current step
- Answers Preview: Summary of previously completed steps

The layout uses Framer Motion extensively for animations:

- AnimatePresence manages component transitions
- motion.div elements have enter/exit animations
- Navigation buttons have hover and tap animations
- The progress bar animates to show completion percentage

The UI supports both light and dark modes using Tailwind's dark mode classes, ensuring a cohesive experience regardless of user preference.

This design creates a guided, step-by-step experience that progressively collects information while keeping users informed of their progress and previous selections.
