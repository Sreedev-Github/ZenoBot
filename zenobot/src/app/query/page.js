"use client";

import QueryStreaming from "@/components/QueryStreaming";

export default function QueryPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        ZenoBot Travel Planner
      </h1>
      <QueryStreaming />
    </div>
  );
}
