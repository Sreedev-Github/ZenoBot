"use client";

import { ArrowBigDown, ArrowDownIcon } from "lucide-react";

const page = () => {
  return (
    <div className="relative bg-background-white flex flex-col justify-center items-center w-full">
      <div className="my-16">
        <h1 className="text-5xl text-text-green-800">Your itinerary is here</h1>
      </div>

      {/* All Days Cards Container  */}
      <div className="bg-white flex flex-col gap-10 items-center p-10 w-[60%] rounded-3xl shadow-[0px_0px_20px_5px_rgba(38,70,83,0.2)]">
        {/* Day Card */}
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 justify-center bg-secondary-background-white rounded-3xl shadow-[0_0_35px_0px_rgba(0,0,0,0.25)] p-5 w-full"
          >
            {/* Date */}
            <div className="relative text-xl flex flex-row justify-center">
              <h1 className="text-center">15/04/2025</h1>
              <ArrowDownIcon className="absolute right-5  text-text-green-800" />
            </div>
            {/* Activities */}
            <div className="bg-activity-background p-10 rounded-xl">
              <p className="text-text-green-800 text-left">Morning Activity</p>
              <div className="text-muted-gray">
                <p>Activity : Visit Christ Church</p>
                <p>Location : Christ Church, Shimla</p>
                <p>Description : Explore the historic church built in 1857.</p>
                <p>Transporation : Any</p>
              </div>
            </div>
            <div className="bg-activity-background p-10 rounded-xl">
              <p className="text-text-green-800 text-left">
                Afternoon Activity
              </p>
              <div className="text-muted-gray">
                <p>Activity : Visit Christ Church</p>
                <p>Location : Christ Church, Shimla</p>
                <p>Description : Explore the historic church built in 1857.</p>
                <p>Transporation : Any</p>
              </div>
            </div>
            <div className="bg-activity-background p-10 rounded-xl">
              <p className="text-text-green-800 text-left">Evening Activity</p>
              <div className="text-muted-gray">
                <p>Activity : Visit Christ Church</p>
                <p>Location : Christ Church, Shimla</p>
                <p>Description : Explore the historic church built in 1857.</p>
                <p>Transporation : Any</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rest of the Day cards */}
    </div>
  );
};

export default page;
