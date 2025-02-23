import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowBigDownIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

function page() {
  return (
    <div className="relative h-[90vh] flex flex-col gap-10 justify-center items-center bg-[url(/hero-bg.jpg)] bg-center bg-cover shadow-inner">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      <p className="relative text-7xl font-bold text-center max-w-[50vw] text-slate-50 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.7)] mt-auto">
        Your Ultimate AI Travel Companion: Plan, Explore, Enjoy!
      </p>

      <div className="relative mb-auto flex gap-5 min-w-[50%] bg-white bg-opacity-15 rounded-full p-4 shadow-lg">
        <Input
          type="text"
          placeholder="From"
          className="bg-transparent text-white placeholder:text-white border-t-0 border-x-0 border-b-2 focus-visible:ring-0 focus-visible:ring-offset-0  focus-visible:outline-none border-white rounded-none"
        />
        <Input
          type="text"
          placeholder="To"
          className="bg-transparent text-white placeholder:text-white border-t-0 border-x-0 border-b-2 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none border-white rounded-none"
        />

        {/* Dropdown for Days */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-transparent border-none text-white text-lg hover:bg-transparent hover:border-none hover:text-white focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:outline-none"
            >
              From <ArrowBigDownIcon size={24} />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none">
            <DropdownMenuLabel>From</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Something</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default page;
