"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

function Page() {
  const [date, setDate] = useState({
    from: new Date(2022, 0, 20),
    to: addDays(new Date(2022, 0, 20), 20),
  });
  const [monthsToShow, setMonthsToShow] = useState(2);

  // Responsively adjust number of calendar months shown
  useEffect(() => {
    function handleResize() {
      setMonthsToShow(window.innerWidth < 1024 ? 1 : 2);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-center items-center py-16 md:py-20 bg-[url(/hero-bg.jpg)] bg-center bg-cover">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center px-6 max-w-[90%] md:max-w-[80%] lg:max-w-[70%] text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.7)] mb-16 lg:mb-20"
      >
        Your Ultimate AI Travel Companion: Plan, Explore, Enjoy!
      </motion.h1>

      {/* Search Box */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.2 }}
        className="relative w-[90%] sm:w-[85%] md:w-[80%] lg:pl-8 lg:max-w-5xl bg-white/25 backdrop-blur-sm rounded-xl lg:rounded-full p-4 lg:p-2 shadow-lg"
      >
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-6 items-center">
          {/* From Input */}
          <div className="w-full lg:w-[25%]">
            <Input
              type="text"
              placeholder="From"
              className="bg-transparent text-white placeholder:text-white/80 border-b-2 border-white border-t-0 border-x-0 rounded-none focus:border-b-white transition-[border-color] duration-300 ease-linear focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-lg"
            />
          </div>

          <Separator className="hidden lg:block h-8 w-px bg-white" />

          {/* To Input */}
          <div className="w-full lg:w-[25%]">
            <Input
              type="text"
              placeholder="To"
              className="bg-transparent text-white placeholder:text-white/80 border-b-2 border-white border-t-0 border-x-0 rounded-none focus:border-b-white transition-[border-color] duration-300 ease-linear focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-lg"
            />
          </div>

          <Separator className="hidden lg:block h-8 w-px bg-white" />

          {/* Date Picker */}
          <div className="w-full lg:w-[30%]">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left bg-transparent border-b-2 border-white border-t-0 border-x-0 rounded-none text-white text-lg hover:bg-transparent hover:text-white focus-visible:ring-0 focus-visible:outline-none h-12",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        <span className="hidden lg:inline">
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </span>
                        <span className="inline lg:hidden">
                          {format(date.from, "LLL dd")} -{" "}
                          {format(date.to, "LLL dd")}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="hidden md:inline">
                          {format(date.from, "LLL dd, y")}
                        </span>
                        <span className="inline md:hidden">
                          {format(date.from, "LLL dd")}
                        </span>
                      </>
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={monthsToShow}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Plan Trip Button */}
          <div className="w-full lg:w-auto mt-4 lg:mt-0">
            <Button
              variant="primary"
              className="w-full lg:w-auto bg-white text-black rounded-full py-6 px-8 text-lg font-medium hover:bg-transparent hover:text-white transition-all duration-300 ease-linear border-2 border-transparent hover:border-white"
            >
              Plan Trip
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Page;
