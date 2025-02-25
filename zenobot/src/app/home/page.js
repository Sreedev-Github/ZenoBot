"use client";

import React, { useState } from "react";
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
  return (
    <div className="relative h-[90vh] flex flex-col gap-14 justify-center items-center bg-[url(/hero-bg.jpg)] bg-center bg-cover shadow-inner">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      <p className="relative text-7xl font-bold text-center max-w-[50vw] text-slate-50 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.7)] mt-auto">
        Your Ultimate AI Travel Companion: Plan, Explore, Enjoy!
      </p>

      <div className="relative mb-auto flex gap-8 min-w-[50%] bg-white bg-opacity-25 rounded-full p-2 shadow-lg pl-8">
        <Input
          type="text"
          placeholder="From"
          className="
            my-auto bg-transparent text-white placeholder:text-white
            border-b-2 border-transparent
            focus:border-b-white
            transition-[border-color] duration-300 ease-linear
            focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0
          "
        />

        <Separator className="max-w-10 rotate-90 my-auto bg-white" />

        <Input
          type="text"
          placeholder="To"
          className=" my-auto bg-transparent text-white placeholder:text-white
                    border-t-0 border-x-0
                     border-b-2 border-transparent
                     focus:border-b-white
                     transition-all duration-300 ease-linear
                     focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        <Separator className="max-w-10 rotate-90 my-auto bg-white" />

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
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
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
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Plan Trip Button */}

        <Button
          variant="primary"
          className="bg-white text-black rounded-full py-9 px-14 text-xl hover:bg-transparent hover:text-white transition-all duration-300 ease-linear border-2 border-transparent hover:border-white"
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
