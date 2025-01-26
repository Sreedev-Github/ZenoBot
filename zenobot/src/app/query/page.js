"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Plane,
  CalendarIcon,
  Loader2,
  Clock,
  Bus,
  Train,
  IndianRupee,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { addDays, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import states from "@/utils/stateCities.json"; // Ensure correct import path
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Console log to verify data
// console.log('States data:', states);

export default function QueryPage() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [date, setDate] = useState({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  // Update getAllCityStateOptions
  const getAllCityStateOptions = useMemo(() => {
    try {
      const options = [];
      // console.log('Processing states:', states);
      if (states && typeof states === "object") {
        Object.entries(states).forEach(([state, cities]) => {
          if (Array.isArray(cities)) {
            cities.forEach((city, index) => {
              options.push({
                key: `${city}, ${state}-${index}`,
                value: `${city}, ${state}`,
              });
            });
          }
        });
      }
      // console.log('Generated options:', options);
      return options;
    } catch (error) {
      console.error("Error processing states:", error);
      return [];
    }
  }, []);

  const getFilteredLocations = (searchTerm) => {
    if (!searchTerm) return [];
    return getAllCityStateOptions.filter((location) =>
      location.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".relative")) {
        setShowFromDropdown(false);
        setShowToDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFromSearch(fromInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [fromInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setToSearch(toInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [toInput]);
   

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!fromInput || !toInput || !date || !budget) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError(null);

    const query = `I am planning a travel in India, from ${fromInput} to ${toInput}. Could you please help me plan the trip from ${date.from} to ${date.to}. Please suggest me the best places to visit, activities to do, food to eat, and accommodation. I would like a detailed itenarary for each day.`;

    console.log(query);
    

    try {
      const res = await fetch("/api/ask-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const result = await res.json();
      if (res.ok) {
        setResponse(result.reply);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An error occurred while fetching the response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/travel-pattern.jpg')] bg-cover bg-fixed">
      <div className="min-h-screen bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-16 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Zeno Trip Planner
            </h1>
            <p className="text-xl text-gray-300">
              Your Ultimate AI Travel Companion: Plan, Explore, Enjoy!
            </p>
          </div>

          {/* Form Section */}
          <div className="max-w-6xl mx-auto mt-8">
            <div className="backdrop-blur-xl bg-white/10 p-8 rounded-2xl shadow-2xl border border-white/20">
              <form onSubmit={onSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* From Location */}
                  <div className="space-y-2 relative">
                    <label className="flex items-center text-sm font-medium text-gray-300">
                      <MapPin className="w-4 h-4 mr-2" />
                      From
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={fromInput}
                        onChange={(e) => {
                          setFromInput(e.target.value);
                          setShowFromDropdown(true);
                        }}
                        className="w-full border border-white/20 bg-white/5 text-white"
                        placeholder="Search city..."
                        disabled={loading}
                      />
                      {showFromDropdown && (
                        <div className="absolute w-full mt-1 max-h-60 overflow-y-auto bg-gray-800 border border-white/20 rounded-md z-[100]">
                          {getFilteredLocations(fromSearch).length > 0 ? (
                            getFilteredLocations(fromSearch).map((location) => (
                              <div
                                key={location.key}
                                className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white"
                                onClick={() => {
                                  setFromInput(location.value);
                                  setShowFromDropdown(false);
                                }}
                              >
                                {location.value}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-400">
                              No matches found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* To Location */}
                  <div className="space-y-2 relative">
                    <label className="flex items-center text-sm font-medium text-gray-300">
                      <Plane className="w-4 h-4 mr-2" />
                      To
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={toInput}
                        onChange={(e) => {
                          setToInput(e.target.value);
                          setShowToDropdown(true);
                        }}
                        className="w-full border border-white/20 bg-white/5 text-white"
                        placeholder="Search city..."
                        disabled={loading}
                      />
                      {showToDropdown && toInput && (
                        <div className="absolute w-full mt-1 max-h-60 overflow-y-auto bg-gray-800 border border-white/20 rounded-md z-50">
                          {getFilteredLocations(toSearch).map((location) => (
                            <div
                              key={location.key}
                              className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white"
                              onClick={() => {
                                setToInput(location.value);
                                setShowToDropdown(false);
                              }}
                            >
                              {location.value}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Days Selection */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-300">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Duration
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
                          disabled={loading}
                          className={cn(
                            "w-full justify-start text-left font-normal border border-white/20 bg-white/5 hover:bg-white/10 text-white overflow-hidden",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date?.from ? (
                            date.to ? (
                              <span className="flex items-center">
                                <span className="mr-1">{format(date.from, "LLL dd, y")}</span>
                                <span className="mx-1">-</span>
                                <span>{format(date.to, "LLL dd, y")}</span>
                              </span>
                            ) : (
                              <span>{format(date.from, "LLL dd, y")}</span>
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

                  {/* Budget */}
                  <div className="space-y-2 relative">
                    <label className="flex items-center text-sm font-medium text-gray-300">
                      <IndianRupee className="w-4 h-4 mr-2" />
                      Budget
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={budget}
                        onChange={(e) => {
                          setBudget(e.target.value);
                        }}
                        className="w-full border border-white/20 bg-white/5 text-white"
                        placeholder="Enter budget..."
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white py-2 rounded-lg transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Planning your trip...
                    </div>
                  ) : (
                    "Plan My Trip"
                  )}
                </Button>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                  {error}
                </div>
              )}

              {response && (
                <div className="mt-8 space-y-6">
                  {(() => {
                    try {
                      const travelPlan = JSON.parse(response);
                      // Validate if we have all days as per duration
                      const tripDays = parseInt(
                        travelPlan.trip.duration.split(" ")[0]
                      );

                      return (
                        <>
                          {/* Trip Overview Card - remains same */}
                          <Card className="bg-white/5 border-white/20 text-white">
                            <CardHeader>
                              <CardTitle className="text-xl">
                                Trip Overview
                              </CardTitle>
                              <CardDescription className="text-gray-300">
                                {travelPlan.trip.origin} to{" "}
                                {travelPlan.trip.destination}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex gap-4">
                                <Badge variant="outline" className="text-white">
                                  {travelPlan.trip.duration}
                                </Badge>
                                <Badge variant="outline" className="text-white">
                                  {travelPlan.trip.type}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Itinerary Cards with validation */}
                          {Array.from({ length: tripDays }).map((_, index) => {
                            const dayData = travelPlan.itinerary.find(
                              (day) => day[`day ${index + 1}`]
                            );
                            const dayActivities = dayData
                              ? dayData[`day ${index + 1}`]
                              : [];

                            return (
                              <Card
                                key={index}
                                className="bg-white/5 border-white/20 text-white"
                              >
                                <CardHeader>
                                  <CardTitle className="text-xl">
                                    Day {index + 1}
                                  </CardTitle>
                                  {!dayActivities.length && (
                                    <CardDescription className="text-yellow-400">
                                      No activities planned for this day
                                    </CardDescription>
                                  )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  {dayActivities.map((activity, actIndex) => (
                                    <div
                                      key={actIndex}
                                      className="p-4 bg-white/5 rounded-lg space-y-2"
                                    >
                                      <div className="flex items-center gap-2 text-emerald-400">
                                        <Clock className="w-4 h-4" />
                                        <span>{activity.time}</span>
                                      </div>
                                      <h3 className="text-lg font-medium">
                                        {activity.activity}
                                      </h3>
                                      <p className="text-gray-300 text-sm">
                                        {activity.description}
                                      </p>
                                      {activity.transportation && (
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                          {activity.transportation ===
                                            "flight" && (
                                            <Plane className="w-4 h-4" />
                                          )}
                                          {activity.transportation ===
                                            "bus" && (
                                            <Bus className="w-4 h-4" />
                                          )}
                                          {activity.transportation ===
                                            "train" && (
                                            <Train className="w-4 h-4" />
                                          )}
                                          <span>{activity.transportation}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </CardContent>
                              </Card>
                            );
                          })}

                          <Card className="bg-white/5 border-white/20 text-white">
                            <CardHeader>
                              <CardTitle className="text-xl">
                                Accommodation
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>
                                  {JSON.parse(response).accommodation.location}
                                </span>
                              </div>
                              <Badge
                                className="mt-2 text-white"
                                variant="outline"
                              >
                                {JSON.parse(response).accommodation.type}
                              </Badge>
                            </CardContent>
                          </Card>

                          {/* Food Recommendations Card */}
                          <Card className="bg-white/5 border-white/20 text-white">
                            <CardHeader>
                              <CardTitle className="text-xl">
                                Food Recommendations
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Badge variant="outline" className="text-white">
                                {JSON.parse(response).food.type}
                              </Badge>
                              <p className="mt-2 text-gray-300">
                                {JSON.parse(response).food.recommended}
                              </p>
                            </CardContent>
                          </Card>
                        </>
                      );
                    } catch (err) {
                      console.error("Error parsing response:", err);
                      return (
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                          Error parsing travel plan data
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
