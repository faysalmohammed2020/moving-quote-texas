"use client";

import Categories from "@/components/Categories";
import Image from "next/image";

export default function AutoTransportService() {
  return (
    <main className="bg-white">
      {/* Intro Section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Reliable Auto Transport Services
        </h1>
        <p className="text-lg text-gray-600">
          Open and enclosed vehicle shipping, coast-to-coast. We coordinate pickup, transit, and delivery with care—so your car arrives on time and in pristine condition.
        </p>
      </section>

      {/* Key Benefits */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <Image
              src="/image/opencarier.jpg"
              alt="Open carrier transport"
              width={112}
              height={112}
              className="mx-auto h-28 mb-4 object-contain"
              priority={false}
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Open & Enclosed</h3>
            <p className="text-gray-600 text-sm">
              Choose budget-friendly open carriers or premium enclosed trailers for extra protection.
            </p>
          </div>

          <div>
            <Image
              src="/image/insured.png"
              alt="Fully insured shipments"
              width={112}
              height={112}
              className="mx-auto h-28 mb-4 object-contain"
              priority={false}
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Fully Insured</h3>
            <p className="text-gray-600 text-sm">
              Comprehensive coverage and vetted carriers for complete peace of mind.
            </p>
          </div>

          <div>
            <Image
              src="/image/real-time.jpg"
              alt="Real-time shipment tracking"
              width={112}
              height={112}
              className="mx-auto h-28 mb-4 object-contain"
              priority={false}
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Real-Time Tracking</h3>
            <p className="text-gray-600 text-sm">
              Stay updated from pickup to drop-off with proactive status alerts.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          Our Auto Transport Services
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Door-to-Door Shipping", desc: "Convenient pickup and delivery at your chosen locations when accessible." },
            { title: "Open Carrier", desc: "Cost-effective transport for standard vehicles and everyday moves." },
            { title: "Enclosed Carrier", desc: "Extra protection for exotics, classics, and luxury cars." },
            { title: "Expedited Transport", desc: "Priority scheduling for time-sensitive deliveries." },
            { title: "Dealer & Auction Logistics", desc: "Bulk moves and coordinated schedules for dealers and auctions." },
            { title: "Multi-Vehicle Transport", desc: "Ship multiple cars together to save time and costs." },
          ].map((item, idx) => (
            <div key={idx} className="p-6 border rounded-xl hover:shadow-lg transition">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            How Our Auto Transport Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { step: "1", title: "Instant Quote", desc: "Share pickup, delivery, and vehicle details to get pricing." },
              { step: "2", title: "Scheduling", desc: "We match your route with a vetted, insured carrier." },
              { step: "3", title: "Pickup & Inspection", desc: "Condition report at pickup; vehicle is secured for transit." },
              { step: "4", title: "Delivery & Sign-off", desc: "Final inspection on arrival—simple and hassle-free." },
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-white rounded-xl shadow-sm">
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

      {/* Vehicle Types */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          Vehicles We Transport
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            "Sedans & Hatchbacks",
            "SUVs & Crossovers",
            "Pickup Trucks",
            "Motorcycles",
            "Classic & Collector Cars",
            "Luxury & Exotic Cars",
            "EVs & Hybrids",
            "ATVs & Small Recreational",
          ].map((label, idx) => (
            <div key={idx} className="p-5 border rounded-xl text-center hover:shadow transition">
              <p className="font-medium text-gray-800">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {[
            {
              q: "How is pricing calculated?",
              a: "Rates depend on distance, vehicle type, carrier type (open vs enclosed), seasonality, and lead time. Request a free quote for exact pricing.",
            },
            {
              q: "Can I put items in the car?",
              a: "Light personal items (under 100 lbs) may be allowed at the carrier’s discretion; additional weight can affect pricing and insurance.",
            },
            {
              q: "Do you ship inoperable vehicles?",
              a: "Yes, with advance notice. Special equipment and winches may be required.",
            },
            {
              q: "What’s the typical transit time?",
              a: "Most cross-country routes take 5–10 days depending on distance and weather/traffic conditions.",
            },
          ].map((faq, idx) => (
            <div key={idx} className="p-6 border rounded-xl hover:shadow transition">
              <h3 className="font-semibold text-gray-800 mb-2">{faq.q}</h3>
              <p className="text-gray-600 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <Categories />
    </main>
  );
}
