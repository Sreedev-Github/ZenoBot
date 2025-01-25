"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Plane,
  Calendar,
  Loader2,
  Clock,
  Bus,
  Train,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {} from "lucide-react";
import states from "@/utils/stateCities.json"; // Ensure correct import path
import { Input } from "@/components/ui/input";

// Console log to verify data
// console.log('States data:', states);

export default function QueryPage() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [days, setDays] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  // Update getAllCityStateOptions
  const getAllCityStateOptions = useMemo(() => {
    try {
      const options = [];
      console.log('Processing states:', states); // Debug log
      if (states && typeof states === 'object') {
        Object.entries(states).forEach(([state, cities]) => {
          if (Array.isArray(cities)) {
            cities.forEach((city, index) => {
              options.push({ key: `${city}, ${state}-${index}`, value: `${city}, ${state}` });
            });
          }
        });
      }
      console.log('Generated options:', options); // Debug log
      return options;
    } catch (error) {
      console.error('Error processing states:', error);
      return [];
    }
  }, []);

  const getFilteredLocations = (searchTerm) => {
    if (!searchTerm) return [];
    return getAllCityStateOptions.filter(location =>
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
    if (!from || !to || !days) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError(null);

    const query = `I am planning a travel to ${to} from ${from}, can you help you plan the trip in India as I am only planning a ${days} day trip and will be taking a flight for travel. Take the values as you please ... and suggest me with random values that you please, make sure the trip planning is not detailed. Please do not ask any questions.`;

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
          <div className="max-w-4xl mx-auto mt-8">
            <div className="backdrop-blur-xl bg-white/10 p-8 rounded-2xl shadow-2xl border border-white/20">
              <form onSubmit={onSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      />
                      {showFromDropdown && (
                        <div className="absolute w-full mt-1 max-h-60 overflow-y-auto bg-gray-800 border border-white/20 rounded-md z-[100]">
                          {getFilteredLocations(fromSearch).length > 0 ? (
                            getFilteredLocations(fromSearch).map((location) => (
                              <div
                                key={location.key}
                                className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white"
                                onClick={() => {
                                  setFrom(location.value);
                                  setFromInput(location.value);
                                  setShowFromDropdown(false);
                                }}
                              >
                                {location.value}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-400">No matches found</div>
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
                      />
                      {showToDropdown && toInput && (
                        <div className="absolute w-full mt-1 max-h-60 overflow-y-auto bg-gray-800 border border-white/20 rounded-md z-50">
                          {getFilteredLocations(toSearch).map((location) => (
                            <div
                              key={location.key}
                              className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white"
                              onClick={() => {
                                setTo(location.value);
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
                      <Calendar className="w-4 h-4 mr-2" />
                      Duration
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal border border-white/20 bg-white/5 hover:bg-white/10 text-white"
                        >
                          {days || "Select Days"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white border border-white/20">
                        {[...Array(7)].map((_, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={() =>
                              setDays(
                                `${index + 1} day${index === 0 ? "" : "s"}`
                              )
                            }
                            className="hover:bg-white/10"
                          >
                            {index + 1} day{index === 0 ? "" : "s"}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
