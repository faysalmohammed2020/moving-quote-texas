"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { reviews } from "@/app/data/review";

function Stars({ rating }: { rating: number }) {
  const safe = Math.max(0, Math.min(5, rating));
  return (
    <div className="flex items-center gap-1" aria-label={`${safe} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < safe ? "text-yellow-500" : "text-gray-200"}>
          ★
        </span>
      ))}
    </div>
  );
}

function toDateTime(dateStr: string) {
  // If date is already ISO, keep it; otherwise just return empty string to avoid invalid dateTime.
  // You can improve this if you have a consistent date format in your data.
  if (!dateStr) return "";
  if (dateStr.includes("T") && dateStr.includes("-")) return dateStr;
  return "";
}

const CustomerReviews: React.FC = () => {
  const avgRating = useMemo(() => {
    if (!reviews?.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, []);

  return (
    <section className="bg-gray-50 py-14">
      <div className="max-w-6xl mx-auto px-6">
        {/* ✅ H1 added */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            What People <span className="text-red-600">Think About Us</span>
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Real feedback from customers who used our moving quotes and services. Average rating:{" "}
            <span className="font-semibold text-gray-900">{avgRating || "—"}</span>/5.
          </p>
          <div className="w-16 h-1 bg-red-600 mx-auto mt-5" />
        </div>

        {/* Trust row */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {[
            { title: "Clear Communication", desc: "Coordinators help confirm dates, details, and expectations." },
            { title: "Careful Handling", desc: "Furniture protection and safe loading practices for peace of mind." },
            { title: "Flexible Options", desc: "Packing, storage, long-distance, and vehicle transport add-ons." },
          ].map((x, i) => (
            <div key={i} className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition">
              <p className="font-bold text-gray-900">{x.title}</p>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{x.desc}</p>
            </div>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <article key={index} className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <Stars rating={Number(review.rating) || 0} />
                <time
                  className="text-sm text-gray-400"
                  dateTime={toDateTime(String(review.date))}
                  aria-label={`Review date: ${review.date}`}
                >
                  {review.date}
                </time>
              </div>

              <p className="text-sm text-gray-700 mt-4 leading-relaxed">“{review.text}”</p>

              <div className="flex items-center mt-6">
                <Image
                  src={review.image}
                  alt={`${review.name} profile photo`}
                  width={48}
                  height={48}
                  className="rounded-full border object-cover"
                  sizes="48px"
                />
                <div className="ml-4">
                  <p className="font-bold text-gray-900">{review.name}</p>
                  <p className="text-sm text-gray-500">{review.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-gray-600 mb-4">
            Want an accurate moving quote? Share your details and we’ll recommend the right plan.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
            >
              Get a Free Quote
            </Link>
            <Link
              href="/about-us/testimonial"
              className="rounded-xl border px-5 py-3 text-gray-900 font-semibold hover:shadow transition"
            >
              Watch Video Testimonials
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
