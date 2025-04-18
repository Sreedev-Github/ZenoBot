"use client";
import { ArrowDownIcon } from "lucide-react";

const DayCard = ({ day = "15/04/2025" }) => {
  return (
    <div className="flex flex-col gap-4 justify-center bg-secondary-background-white rounded-3xl shadow-[0_0_35px_0px_rgba(0,0,0,0.25)] p-5 w-full">
      <div className="relative flex flex-row justify-between items-center p-2 rounded-lg transition-colors">
        <h1 className="text-center font-medium">{day}</h1>
        <ArrowDownIcon className="absolute right-2 md:right-5 text-text-green-800 transition-transform" />
      </div>

      {/* Activities Container */}
      <div className="flex flex-col gap-4">
        {/* Morning Activity */}
        <div className="bg-activity-background p-4 md:p-8 lg:p-10 rounded-2xl shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)]">
          <p className="text-text-green-800 text-left font-semibold">
            Morning Activity
          </p>
          <div className="text-muted-gray text-sm md:text-base">
            <p>Activity : Visit Christ Church</p>
            <p>Location : Christ Church, Shimla</p>
            <p>Description : Explore the historic church built in 1857.</p>
            <p>Transporation : Any</p>
          </div>
        </div>

        {/* Additional activities with same structure */}
        <div className="bg-activity-background p-4 md:p-8 lg:p-10 rounded-2xl shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)]">
          <p className="text-text-green-800 text-left font-semibold">
            Afternoon Activity
          </p>
          <div className="text-muted-gray text-sm md:text-base">
            <p>Activity : Visit Christ Church</p>
            <p>Location : Christ Church, Shimla</p>
            <p>Description : Explore the historic church built in 1857.</p>
            <p>Transporation : Any</p>
          </div>
        </div>

        <div className="bg-activity-background p-4 md:p-8 lg:p-10 rounded-2xl shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)]">
          <p className="text-text-green-800 text-left font-semibold">
            Additional Activity
          </p>
          <div className="text-muted-gray text-sm md:text-base">
            <p>Activity : Visit Christ Church</p>
            <p>Location : Christ Church, Shimla</p>
            <p>Description : Explore the historic church built in 1857.</p>
            <p>Transporation : Any</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  const mockDays = ["15/04/2025", "16/04/2025", "17/04/2025", "18/04/2025"];
  return (
    <div className="relative bg-background-white flex flex-col justify-center items-center w-full min-h-screen px-4">
      <div className="my-8 md:my-16">
        <h1 className="text-3xl md:text-5xl text-text-green-800 text-center font-bold">
          Your itinerary is here
        </h1>
      </div>
      {/* All Days Cards Container */}
      <div className="bg-white flex flex-col gap-6 md:gap-10 items-center p-5 md:p-10 w-full sm:max-w-[90%] md:max-w-[80%] lg:max-w-[60%] rounded-3xl shadow-[0px_0px_20px_5px_rgba(38,70,83,0.2)]">
        {mockDays.map((day, index) => (
          <DayCard key={index} day={day} />
        ))}
      </div>
      <div className="h-10 md:h-20"></div> {/* Bottom spacing */}
    </div>
  );
};

export default Page;
