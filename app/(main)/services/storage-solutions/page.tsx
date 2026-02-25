"use client";

import Categories from "@/components/Categories";
import Image from "next/image";

export default function StorageSolutions() {
  return (
    <main className="bg-white">
      {/* Intro Section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Secure Storage Solutions
        </h1>
        <p className="text-lg text-gray-600">
          From short-term storage during a move to long-term solutions for your belongings, 
          we provide clean, climate-controlled, and secure storage facilities tailored to your needs.
        </p>
      </section>

      {/* Key Benefits */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <Image
              src="/image/secure.png"
              alt="Secure Units"
              width={112}
              height={112}
              className="mx-auto h-28 mb-4 object-contain"
              priority={false}
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure Units</h3>
            <p className="text-gray-600 text-sm">
              24/7 surveillance, gated access, and individually locked storage rooms.
            </p>
          </div>

          <div>
            <Image
              src="/image/climate.png"
              alt="Climate Control"
              width={112}
              height={112}
              className="mx-auto h-28 mb-4 object-contain"
              priority={false}
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Climate-Controlled</h3>
            <p className="text-gray-600 text-sm">
              Perfect for sensitive items such as electronics, artwork, and furniture.
            </p>
          </div>

          <div>
            <Image
              src="/image/flexible.png"
              alt="Flexible Plans"
              width={112}
              height={112}
              className="mx-auto h-28 mb-4 object-contain"
              priority={false}
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Flexible Plans</h3>
            <p className="text-gray-600 text-sm">
              Choose short-term or long-term rentals with flexible payment options.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          Our Storage Services
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Short-Term Storage", desc: "Convenient for in-between moves or temporary holding." },
            { title: "Long-Term Storage", desc: "Affordable, safe storage for months or years." },
            { title: "Furniture Storage", desc: "Protective environment to keep furniture safe and dust-free." },
            { title: "Business Storage", desc: "Archive important documents and inventory with ease." },
            { title: "Climate-Controlled Units", desc: "Maintain stable temperature and humidity for sensitive items." },
            { title: "Vehicle Storage", desc: "Secure spaces for cars, bikes, and small recreational vehicles." },
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
            How Our Storage Solutions Work
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { step: "1", title: "Choose Your Plan", desc: "Select from short or long-term storage options." },
              { step: "2", title: "Pack & Transport", desc: "We help with packing and safely transporting your items." },
              { step: "3", title: "Secure Storage", desc: "Items are placed in monitored, climate-controlled facilities." },
              { step: "4", title: "Access Anytime", desc: "Retrieve your belongings whenever you need them." },
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

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {[
            {
              q: "Is my storage unit secure?",
              a: "Yes, all units are monitored by CCTV, gated access, and insurance options are available.",
            },
            {
              q: "What items can I store?",
              a: "You can store furniture, boxes, business inventory, and more. Hazardous materials are prohibited.",
            },
            {
              q: "Can I access my items anytime?",
              a: "Yes, our facilities offer 24/7 access for maximum convenience.",
            },
            {
              q: "Do you offer pickup and delivery?",
              a: "Absolutely! Our moving team can transport items directly to and from your storage unit.",
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
