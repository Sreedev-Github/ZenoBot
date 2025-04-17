"use client";

import React, { createContext, useState, useContext } from "react";

const TravelContext = createContext();

export const TravelProvider = ({ children }) => {
  const [travelData, setTravelData] = useState(null);

  return (
    <TravelContext.Provider value={{ travelData, setTravelData }}>
      {children}
    </TravelContext.Provider>
  );
};

export const useTravelContext = () => useContext(TravelContext);
