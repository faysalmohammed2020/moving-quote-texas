import type { Metadata } from "next";
import Link from "next/link";
import { VideoData } from "@/app/data/videoReview";

export const metadata: Metadata = {
  title: "Customer Video Testimonials | Moving Quote Texas Reviews",
  description:
    "Watch real customer video testimonials from Moving Quote Texas. See moving experiences, service quality, and why customers trust us for local and long-distance moves.",
  alternates: {
    canonical: "https://www.movingquotetexas.com/about-us/testimonial",
  },
  openGraph: {
    title: "Customer Video Testimonials | Moving Quote Texas",
    description:
      "Real customer video reviews and testimonials for Moving Quote Texas.",
    url: "https://www.movingquotetexas.com/about-us/testimonial",
    siteName: "Moving Quote Texas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Customer Video Testimonials | Moving Quote Texas",
    description:
      "Watch real customer video reviews and testimonials for Moving Quote Texas.",
  },
};

const ReviewsPage = () => {
  return (
    <main className="bg-gray-50">
      <section className="py-10 px-2">
        <div className="container mx-auto text-center">
          {/* ✅ H1 added (Missing H1 fix) */}
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Customer <span className="text-blue-600">Video Testimonials</span>
          </h1>

          <div className="mb-6">
            <div className="w-16 h-1 bg-blue-600 mx-auto" />
          </div>

          {/* ✅ Add real text content (Low word count + Text/HTML ratio fix) */}
          <div className="max-w-4xl mx-auto text-gray-700 leading-relaxed text-left md:text-center mb-10 space-y-4">
            <p>
              Choosing the right movers is a big decision. That’s why we collect
              customer feedback and share real video testimonials—so you can see
              what it’s like to work with our team before you book.
            </p>
            <p>
              From careful packing and secure loading to clear communication on
              delivery timelines, our goal is to make every move smooth and
              stress-free. Whether you’re moving locally in Texas or planning a
              long-distance relocation, these reviews highlight what customers
              value most: reliability, professionalism, and peace of mind.
            </p>
            <p>
              Ready to get started? Request a free quote and we’ll match you
              with the right service options for your move.
            </p>

            {/* ✅ Internal links improve site structure */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition"
              >
                Get a Free Quote
              </Link>
              <Link
                href="/services/long-distance-moving"
                className="inline-flex items-center justify-center rounded-xl border px-5 py-3 text-gray-800 font-semibold hover:shadow transition"
              >
                Long Distance Moving
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-xl border px-5 py-3 text-gray-800 font-semibold hover:shadow transition"
              >
                Moving Tips
              </Link>
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-md">
            {VideoData.map((video, index) => (
              <div
                key={index}
                className="bg-white shadow-lg p-4 flex flex-col items-center rounded-xl"
              >
                {/* ✅ small improvement: lazy load iframe for performance */}
                <iframe
                  className="w-full h-48 mb-4 rounded-lg"
                  src={video.url}
                  title={video.title}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <h2 className="text-lg font-semibold text-gray-900">
                  {video.title}
                </h2>
                <p className="text-sm text-gray-500">{video.location}</p>
              </div>
            ))}
          </div>

          {/* ✅ Extra content block to strengthen page */}
          <div className="max-w-4xl mx-auto mt-12 bg-white border rounded-xl p-6 text-left">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              What Customers Typically Mention
            </h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>On-time arrival and clear communication</li>
              <li>Careful handling of furniture and fragile items</li>
              <li>Transparent pricing and straightforward scheduling</li>
              <li>Helpful coordinators and friendly crews</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ReviewsPage;
