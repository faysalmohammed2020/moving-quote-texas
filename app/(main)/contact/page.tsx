import type { Metadata } from "next";
import Link from "next/link";
import MovingCostCalculator from "@/components/MovingCostCalculator";

export const metadata: Metadata = {
  title: "Contact Moving Quote Texas | Get a Free Moving Quote",
  description:
    "Contact Moving Quote Texas for fast moving quotes. Call +1 888 202 1370 or email info@movingquotetexas.com. Local and long-distance moving support with packing, storage, and vehicle transport.",
  alternates: {
    canonical: "https://www.movingquotetexas.com/contact",
  },
  openGraph: {
    title: "Contact Moving Quote Texas | Get a Free Moving Quote",
    description:
      "Call or email Moving Quote Texas for a fast, accurate moving quote. Local & long-distance services available.",
    url: "https://www.movingquotetexas.com/contact",
    siteName: "Moving Quote Texas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Moving Quote Texas",
    description: "Get a fast moving quote. Call +1 888 202 1370 or email info@movingquotetexas.com.",
  },
};

function buildLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    name: "Moving Quote Texas",
    url: "https://www.movingquotetexas.com",
    telephone: "+18882021370",
    email: "info@movingquotetexas.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "2719 Hollywood Blvd #1372",
      addressLocality: "Hollywood",
      addressRegion: "FL",
      postalCode: "33020",
      addressCountry: "US",
    },
    areaServed: [{ "@type": "State", name: "Texas" }, { "@type": "Country", name: "United States" }],
  };
}

const ContactPage = () => {
  const jsonLd = buildLocalBusinessJsonLd();

  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <section className="bg-gradient-to-b from-gray-50 to-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Contact <span className="text-teal-700">Moving Quote Texas</span>
          </h1>
          <p className="text-gray-600 mt-3 max-w-3xl leading-relaxed">
            Get a fast, accurate moving quote for local or long-distance moves. We can help with packing, storage,
            and vehicle transport—so you don’t need multiple vendors.
          </p>

          {/* Quick actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="tel:+18882021370"
              className="inline-flex items-center justify-center rounded-xl bg-teal-700 px-5 py-3 text-white font-semibold hover:bg-teal-800 transition"
            >
              Call: +1 888 202 1370
            </a>
            <a
              href="mailto:info@movingquotetexas.com"
              className="inline-flex items-center justify-center rounded-xl border px-5 py-3 text-gray-900 font-semibold hover:shadow transition"
            >
              Email Us
            </a>
            <Link
              href="/services/long-distance-moving"
              className="inline-flex items-center justify-center rounded-xl border px-5 py-3 text-gray-900 font-semibold hover:shadow transition"
            >
              Long Distance Moving
            </Link>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left column */}
          <div className="space-y-6">
            {/* Contact card */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Details</h2>

              <div className="grid sm:grid-cols-2 gap-5 text-gray-700">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Address</p>
                  <p className="mt-1">2719 Hollywood Blvd #1372</p>
                  <p>Hollywood, FL 33020</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Service area: Texas + long-distance routes across the U.S.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Phone</p>
                    <a href="tel:+18882021370" className="text-teal-700 font-semibold hover:underline">
                      +1 888 202 1370
                    </a>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900">Email</p>
                    <a href="mailto:info@movingquotetexas.com" className="text-teal-700 font-semibold hover:underline">
                      info@movingquotetexas.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust / Info cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { title: "Response Time", desc: "Quotes typically sent within 24 hours." },
                { title: "Moving Options", desc: "Local, long-distance, packing & storage." },
                { title: "Support", desc: "Coordinator guidance from start to finish." },
              ].map((c, i) => (
                <div key={i} className="rounded-2xl border bg-gray-50 p-5 hover:shadow-md transition">
                  <p className="font-bold text-gray-900">{c.title}</p>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>

            {/* Helpful instructions (SEO but designed) */}
            <div className="rounded-2xl border bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">What We Need for an Accurate Quote</h2>
              <p className="text-gray-600 mb-4">
                Share a few details and we’ll recommend the best service plan for your timeline and budget.
              </p>

              <ul className="grid sm:grid-cols-2 gap-3 text-gray-700">
                {[
                  "Pickup & delivery ZIP codes",
                  "Move date (or flexible range)",
                  "Home type and access (stairs/elevator)",
                  "Estimated inventory size (bedrooms/large items)",
                  "Add-ons: packing, storage, crating",
                  "Vehicle transport (if needed)",
                ].map((t, idx) => (
                  <li key={idx} className="rounded-xl bg-gray-50 border p-3 text-sm">
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/services/storage-solutions"
                  className="rounded-xl border px-5 py-3 text-gray-900 font-semibold hover:shadow transition"
                >
                  Storage Solutions
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

          {/* Right column: Calculator */}
          <div className="rounded-2xl border bg-white shadow-sm p-5 sticky top-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Moving Cost Calculator</h2>
              <span className="text-xs rounded-full bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1">
                Instant Estimate
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Use the calculator to get a quick estimate. For the most accurate quote, contact us with your move details.
            </p>

            <div className="rounded-2xl border bg-gray-50 p-3">
              <MovingCostCalculator />
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <a
                href="tel:+18882021370"
                className="flex-1 rounded-xl bg-teal-700 px-5 py-3 text-white font-semibold text-center hover:bg-teal-800 transition"
              >
                Call Now
              </a>
              <a
                href="mailto:info@movingquotetexas.com"
                className="flex-1 rounded-xl border px-5 py-3 text-gray-900 font-semibold text-center hover:shadow transition"
              >
                Email Us
              </a>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Tip: Flexible dates can reduce costs. Ask about packing and storage bundles.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
