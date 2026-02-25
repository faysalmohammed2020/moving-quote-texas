"use client";

import React from "react";
import Image from "next/image";
import { reviews } from "@/app/data/review";
import Link from "next/link";

const CustomerReviews: React.FC = () => {
  const initialReviews = reviews.slice(0, 3); // Display only the first 3 reviews initially
  // const [displayedReviews, setDisplayedReviews] = useState(initialReviews);

  return (
    <section className="bg-gray-50 p-6">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">
          What People <span className="text-red-600">Think About Us</span>
        </h2>
        <div className="mb-6">
          <div className="w-16 h-1 bg-red-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {initialReviews.map((review, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col items-start"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  {Array.from({ length: review.rating }).map((_, idx) => (
                    <span key={idx} className="text-yellow-500">
                      &#9733;
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-400">{review.date}</p>
              </div>
              <p className="text-sm text-gray-600 mt-4">{review.text}</p>
              <div className="flex items-center mt-4">
                <Image
                  src={review.image}
                  alt={review.name}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <div className="ml-4">
                  <p className="font-bold text-gray-700">{review.name}</p>
                  <p className="text-sm text-gray-500">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/review"
            className="px-4 py-2 bg-blue-600 text-white shadow-md hover:bg-blue-700 transition"
          >
            VIEW MORE
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
