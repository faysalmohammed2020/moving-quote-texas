import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Categories from "@/components/Categories";

// ✅ Unique metadata: Duplicate title/meta fix (page-level)
export const metadata: Metadata = {
  title: "Long Distance Movers in Texas | Safe & Affordable Moving Quote",
  description:
    "Planning a long-distance move in Texas or across the U.S.? Get a fast, accurate quote with packing, storage, and vehicle transport options. Licensed, insured, and on-time delivery.",
  alternates: {
    canonical: "https://www.movingquotetexas.com/services/long-distance-moving",
  },
  openGraph: {
    title: "Long Distance Movers in Texas | Moving Quote Texas",
    description:
      "Reliable long-distance moving with packing, storage, and vehicle transport. Request a free quote today.",
    url: "https://www.movingquotetexas.com/services/long-distance-moving",
    siteName: "Moving Quote Texas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Long Distance Movers in Texas | Moving Quote Texas",
    description:
      "Reliable long-distance moving with packing, storage, and vehicle transport. Request a free quote today.",
  },
};

const FAQS = [
  {
    q: "How much does a long-distance move cost?",
    a: "Pricing depends on distance, shipment size/weight, access conditions (stairs/elevators), timing, and add-ons like packing or storage. Request a free quote for a precise estimate.",
  },
  {
    q: "How long will my move take?",
    a: "Transit time varies by route and schedule. During your quote we share the estimated pickup and delivery window so you can plan confidently.",
  },
  {
    q: "Are my items insured?",
    a: "Yes. We offer multiple protection options. Your coordinator will explain coverage choices during booking.",
  },
  {
    q: "Do you provide packing materials and packing services?",
    a: "Yes. We can supply moving boxes, padding, and specialty materials, and we also offer full-service packing and unpacking.",
  },
  {
    q: "Can you store my items if my new home isn’t ready?",
    a: "Absolutely. We provide secure short-term and long-term storage solutions with flexible pickup and delivery.",
  },
];

function buildJsonLd() {
  const url = "https://www.movingquotetexas.com/services/long-distance-moving";
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Long Distance Moving Services",
    serviceType: "Long Distance Moving",
    areaServed: [
      { "@type": "State", name: "Texas" },
      { "@type": "Country", name: "United States" },
    ],
    provider: {
      "@type": "Organization",
      name: "Moving Quote Texas",
      url: "https://www.movingquotetexas.com",
    },
    url,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      description: "Free moving quote for long-distance moving services.",
      availability: "https://schema.org/InStock",
      url,
    },
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  };
}

export default function LongDistanceMoving() {
  const jsonLd = buildJsonLd();

  return (
    <main className="bg-white">
      {/* ✅ Structured data: helps SEO understanding */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Intro Section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Long Distance Movers in Texas You Can Trust
        </h1>

        <p className="text-lg text-gray-600">
          Whether you&apos;re moving across Texas or relocating to another state, we make long-distance moving simple:
          clear pricing, careful handling, and on-time delivery. Get a fast quote, choose the services you need, and
          let a dedicated coordinator guide your move from start to finish.
        </p>

        {/* ✅ Internal links: reduce “only one incoming link” risk, improves site structure */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition"
          >
            Get a Free Quote
          </Link>
          <Link
            href="/services/storage-solutions"
            className="inline-flex items-center justify-center rounded-xl border px-5 py-3 text-gray-800 font-semibold hover:shadow transition"
          >
            Explore Storage Options
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-xl border px-5 py-3 text-gray-800 font-semibold hover:shadow transition"
          >
            Read Moving Tips
          </Link>
        </div>

        {/* ✅ More unique text: fixes low word count / text-html ratio */}
        <div className="mt-10 space-y-4 text-gray-700 leading-relaxed">
          <h2 className="text-xl font-bold text-gray-900">What to Expect From Our Long Distance Moving Service</h2>
          <p>
            Long-distance moves require more planning than local moves because timing, routing, and inventory accuracy
            matter. Our process starts with a detailed quote so you know what you&apos;re paying for—distance, shipment size,
            access conditions, and any add-ons like packing, storage, or vehicle transport. We then assign a coordinator to
            confirm schedules and keep you updated through pickup and delivery.
          </p>
          <p>
            We protect furniture with padding and wrapping, label boxes for easier unpacking, and use secure loading methods
            to minimize shifting during transit. If your destination isn&apos;t ready, we can move your items into storage and
            deliver when you are ready—so you never feel stuck between homes.
          </p>
          <p>
            If you&apos;re comparing movers, focus on: licensing and insurance, a clear written estimate, realistic delivery
            windows, and communication. Our goal is to make long-distance moving feel predictable—no surprise fees, no
            confusing timelines, and no guesswork.
          </p>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white rounded-xl border hover:shadow-lg transition">
            <Image
              src="/image/delevery3.jpg"
              alt="Experienced long distance movers"
              width={112}
              height={112}
              className="mx-auto h-28 mb-4 object-contain"
              priority={false}
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Experienced Movers</h3>
            <p className="text-gray-600 text-sm">
              Trained crews for long-haul moves, careful packing, and safe loading to protect your belongings end-to-end.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border hover:shadow-lg transition">
            <Image
              src="/image/delevery4.jpg"
              alt="Safe and secure moving protection"
              width={112}
              height={112}
              className="mx-auto h-28 mb-4 object-contain"
              priority={false}
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Safe &amp; Secure</h3>
            <p className="text-gray-600 text-sm">
              Furniture protection, labeled inventory, and secure transport practices to reduce damage risk on long routes.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border hover:shadow-lg transition">
            <Image
              src="/image/img5.jpg"
              alt="Moving support and coordination"
              width={112}
              height={112}
              className="mx-auto h-28 mb-4 object-contain"
              priority={false}
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Dedicated Support</h3>
            <p className="text-gray-600 text-sm">
              A coordinator helps confirm timing, services, and updates so you always know what happens next.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          Our Long Distance Moving Services
        </h2>

        <p className="text-gray-700 max-w-4xl mx-auto text-center mb-10">
          Choose only what you need—or bundle services for a smoother move. We can handle packing, loading, storage, and
          specialty transport to match your timeline and budget.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Packing & Unpacking", desc: "Full-service packing and unpacking to keep items safe and organized." },
            { title: "Loading & Unloading", desc: "Careful handling to protect furniture, boxes, and fragile items." },
            { title: "Custom Crating", desc: "Extra protection for fragile, valuable, or oversized pieces." },
            { title: "Storage Solutions", desc: "Secure short-term and long-term storage with flexible delivery." },
            { title: "Vehicle Transport", desc: "Safe transportation for cars, motorcycles, and specialty vehicles." },
            { title: "Furniture Assembly", desc: "Disassembly and reassembly so your home is move-in ready faster." },
          ].map((item, idx) => (
            <div key={idx} className="p-6 border rounded-xl hover:shadow-lg transition">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* ✅ More unique content: improves word count & reduces “thin content” */}
        <div className="mt-12 grid lg:grid-cols-2 gap-10 text-gray-700 leading-relaxed">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">How We Price Long Distance Moves</h3>
            <p>
              Most long-distance estimates depend on distance, shipment size, access (stairs, elevators, long carry),
              timing/seasonality, and any add-ons like packing, storage, or crating. To keep quotes accurate, we confirm
              pickup and delivery details and build a plan that matches your schedule.
            </p>
            <p className="mt-3">
              If you want to lower costs, consider booking earlier, decluttering before packing, and choosing flexible dates
              when possible. We&apos;ll walk you through options that make sense for your move.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Routes We Commonly Handle</h3>
            <p>
              We help customers move from Texas to nearby states and across the country. Whether it&apos;s a family relocation,
              a job transfer, or a college move, we focus on safe handling and clear communication from pickup to delivery.
            </p>
            <p className="mt-3">
              Need storage between homes or vehicle transport? We can combine services so you don&apos;t have to coordinate
              multiple vendors.
            </p>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            How Our Long Distance Moving Process Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { step: "1", title: "Free Quote", desc: "Share your details for an accurate estimate and service options." },
              { step: "2", title: "Planning", desc: "A coordinator confirms timing, inventory, and any add-ons you want." },
              { step: "3", title: "Moving Day", desc: "We pack (if needed), load safely, and start transport on schedule." },
              { step: "4", title: "Delivery", desc: "We unload, place items, and can help unpack and set up your home." },
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-white rounded-xl shadow-sm border">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="p-6 border rounded-xl hover:shadow transition">
              <h3 className="font-semibold text-gray-800 mb-2">{faq.q}</h3>
              <p className="text-gray-600 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* ✅ Extra internal link block for better crawling/context */}
        <div className="mt-10 rounded-xl bg-gray-50 border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Helpful Links</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              Need storage? <Link className="underline" href="/services/storage-solutions">Storage Solutions</Link>
            </li>
            <li>
              Moving a car too? <Link className="underline" href="/services/auto-transport">Vehicle Transport</Link>
            </li>
            <li>
              Want tips? <Link className="underline" href="/blog">Moving Blog</Link>
            </li>
            <li>
              Ready to talk? <Link className="underline" href="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>
      </section>

      <Categories />
    </main>
  );
}
