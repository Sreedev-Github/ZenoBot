"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

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
      setMonthsToShow(window.innerWidth < 768 ? 1 : 2);
    }

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="py-10 relative w-[100vw] h-[100%] flex flex-col gap-14 justify-center items-center bg-[url(/hero-bg.jpg)] bg-center bg-cover shadow-inner">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      <p className="relative text-base md:text-7xl my-auto font-bold text-center px-2 lg:max-w-[50vw] text-slate-50 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.7)]">
        Your Ultimate AI Travel Companion: Plan, Explore, Enjoy!
      </p>

      <div className="relative mb-auto flex-col flex gap-8 max-w-[80%] min-w-[50%] bg-white bg-opacity-25 rounded-xl p-2 shadow-lg px-4 md:pl-8">
        <Input
          type="text"
          placeholder="From"
          className="
            my-auto bg-transparent text-white placeholder:text-white
            border-b-2 md:border-transparent border-white border-t-0 border-x-0
            focus:border-b-white
            transition-[border-color] duration-300 ease-linear
            focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0
          "
        />

        <Separator className="hidden md:visible max-w-10 rotate-90 my-auto bg-white" />

        <Input
          type="text"
          placeholder="To"
          className=" my-auto bg-transparent text-white placeholder:text-white
                    border-t-0 border-x-0
                     border-b-2 md:border-transparent border-white
                     focus:border-b-white
                     transition-all duration-300 ease-linear
                     focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        <Separator className="hidden md:visible max-w-10 rotate-90 my-auto bg-white" />

        {/* Dropdown for Days */}
        <div
          className={cn(
            "grid gap-2 bg-transparent",
            !date && "text-muted-foreground"
          )}
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "my-auto w-[300px] justify-start text-left font-normal bg-transparent border-none text-white text-lg hover:bg-transparent hover:border-none hover:text-white focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:outline-none",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {/* Medium and up: show "Jan 29, 2025" style */}
                      <span className="hidden md:inline">
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </span>
                      {/* Smaller screens: show "Jan 29" style */}
                      <span className="inline md:hidden">
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
            <PopoverContent className="w-auto p-0" align="start">
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

        <Button
          variant="primary"
          className=" bg-white text-black rounded-full md:py-9 md:px-14 md:text-xl hover:bg-transparent hover:text-white transition-all duration-300 ease-linear border-2 border-transparent hover:border-white"
        >
          Plan Trip
        </Button>
      </div>
    </div>
  );
}

export default Page;

{
  /* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-transparent border-none text-white text-lg hover:bg-transparent hover:border-none hover:text-white focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:outline-none"
            >
              Duration <CalendarIcon className="mr-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none">
            <DropdownMenuLabel>Number of Days</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Something</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */
}
