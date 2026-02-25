"use client";

import React, { useState } from "react";
import { visitorData, Visitor } from "@/app/data/VisitorData";

const VisitorMarquee: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div
      className="overflow-hidden h-full w-full relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`absolute w-full ${
          isPaused ? "paused" : "animate-vertical-marquee"
        } flex flex-col`}
      >
        {[...visitorData, ...visitorData].map(
          (visitor: Visitor, index: number) => (
            <div
              key={index}
              className="bg-gray-100 flex gap-5 p-4 rounded-md shadow-md mb-4 w-full"
            >
              <p className="text-sm font-medium text-gray-800">
                <span className="font-bold">IP:</span> {visitor.ip}
              </p>
              <p className="text-sm font-medium text-gray-800">
                <span className="font-bold">Location:</span> {visitor.location}
              </p>
              <p className="text-sm font-medium text-gray-800">
                <span className="font-bold">Time:</span> {visitor.time}
              </p>
              <p className="text-sm font-medium text-gray-800">
                <span className="font-bold">Date:</span> {visitor.date}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default VisitorMarquee;
