import Link from "next/link";

function HomeSeoFullSection() {
  return (
    <section className="bg-white py-14">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Moving Services Across <span className="text-blue-600">Texas</span>
          </h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Fast quotes, careful handling, and flexible options for local and long-distance moves.
          </p>
          <div className="w-16 h-1 bg-blue-600 mx-auto mt-5" />
        </div>

        {/* Cards Row */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Transparent Quotes",
              desc: "Know what impacts pricing—distance, shipment size, access, timing, and add-ons like packing or storage.",
            },
            {
              title: "Flexible Services",
              desc: "Packing & unpacking, secure loading, custom crating, storage solutions, and vehicle transport.",
            },
            {
              title: "Smooth Delivery",
              desc: "A coordinator helps confirm schedules and updates so your move stays predictable.",
            },
          ].map((c, i) => (
            <div key={i} className="rounded-2xl border bg-gray-50 p-6 hover:shadow-md transition">
              <h3 className="text-lg font-bold text-gray-900">{c.title}</h3>
              <p className="text-gray-600 text-sm mt-2 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Content Blocks (SEO text but designed) */}
        <div className="grid lg:grid-cols-2 gap-8 mt-10">
          <div className="rounded-2xl border p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Why Customers Choose Moving Quote Texas
            </h3>
            <ul className="space-y-3 text-gray-700 leading-relaxed">
              <li>• Clear communication from quote to delivery</li>
              <li>• Careful packing and furniture protection</li>
              <li>• Flexible scheduling and storage options</li>
              <li>• Local and long-distance move support</li>
            </ul>
            <p className="text-gray-600 text-sm mt-4">
              Compare movers by licensing, estimate clarity, delivery windows, and responsiveness—these details matter
              most in a long-distance move.
            </p>
          </div>

          <div className="rounded-2xl border p-6 bg-gray-50">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Get the Right Moving Plan
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Tell us your move date, pickup and drop-off locations, and any specialty items. We’ll recommend the best
              service mix for your timeline—packing, storage, or vehicle transport—so you don’t need multiple vendors.
            </p>

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition"
              >
                Get a Free Quote
              </Link>
              <Link
                href="/services/long-distance-moving"
                className="rounded-xl border px-5 py-3 text-gray-900 font-semibold hover:shadow transition"
              >
                Long Distance Moving
              </Link>
              <Link
                href="/blog"
                className="rounded-xl border px-5 py-3 text-gray-900 font-semibold hover:shadow transition"
              >
                Moving Tips
              </Link>
            </div>
          </div>
        </div>

        {/* Optional: Extra SEO paragraph (still styled) */}
        <div className="mt-10 rounded-2xl border p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Planning a Local or Long-Distance Move?
          </h3>
          <div className="text-gray-700 leading-relaxed space-y-4">
            <p>
              Moving Quote Texas helps families and businesses relocate with confidence. Whether you’re moving within
              Texas or across state lines, we focus on clear estimates, careful handling, and dependable delivery.
            </p>
            <p>
              Our services can include packing, loading, storage between homes, custom crating for fragile items, and
              vehicle transport. Start with a free quote and we’ll guide you to the best plan for your budget and schedule.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeSeoFullSection;
