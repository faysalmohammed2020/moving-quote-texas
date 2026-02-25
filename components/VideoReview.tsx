"use client";

import React from "react";
import Link from "next/link";
import { VideoData } from "@/app/data/videoReview";

const VideoReviews = () => {
  const initialVideos = VideoData.slice(0, 3);

  return (
    <section className="bg-gray-50 py-10 p-2">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">
          Our Moving <span className="text-blue-600">Reviews</span>
        </h2>
        <div className="mb-6">
          <div className="w-16 h-1 bg-blue-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-md">
          {initialVideos.map((video, index) => (
            <div
              key={index}
              className="bg-white shadow-lg p-4 flex flex-col items-center rounded-xl"
            >
              <iframe
                className="w-full h-48 mb-4"
                src={video.url}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <h3 className="text-lg font-semibold">{video.title}</h3>
              <p className="text-sm text-gray-500">{video.location}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link
            href="/about-us/testimonial"
            className="px-4 py-2 bg-blue-600 text-white shadow-md hover:bg-blue-700 transition"
          >
            VIEW MORE
          </Link>
        </div>
      </div>
    </section>
  );
};

export default VideoReviews;
