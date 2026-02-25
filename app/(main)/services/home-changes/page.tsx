"use client";

import Categories from "@/components/Categories";
import Image from "next/image";

export default function HomeChanges() {
  return (
    <main className="bg-white">
      {/* Intro Section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Professional Home Changes & Remodeling Services
        </h1>
        <p className="text-lg text-gray-600">
          Transform your house into the dream home you’ve always wanted. From minor upgrades to full renovations, 
          our expert team ensures high-quality craftsmanship, tailored design, and stress-free project management.
        </p>
      </section>

      {/* Key Benefits */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <Image
              src="/image/quality.jpg"
              alt="High Quality Work"
              width={112}
              height={112}
              className="mx-auto h-28 mb-4 object-contain"
              priority={false}
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">High-Quality Work</h3>
            <p className="text-gray-600 text-sm">
              We use top-grade materials and skilled labor to ensure long-lasting results.
            </p>
          </div>

          <div>
            <Image
              src="/image/design.png"
              alt="Custom Design"
              width={112}
              height={112}
              className="mx-auto h-28 mb-4 object-contain"
              priority={false}
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Custom Design</h3>
            <p className="text-gray-600 text-sm">
              Our team works with you to design spaces that reflect your style and needs.
            </p>
          </div>

          <div>
            <Image
              src="/image/support.webp"
              alt="Project Support"
              width={112}
              height={112}
              className="mx-auto h-28 mb-4 object-contain"
              priority={false}
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Complete Support</h3>
            <p className="text-gray-600 text-sm">
              From consultation to completion, we handle everything so you can relax.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          Our Home Change & Remodeling Services
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Kitchen Remodeling", desc: "Upgrade cabinets, countertops, appliances, and layouts for modern kitchens." },
            { title: "Bathroom Renovation", desc: "Transform your bathroom with new fixtures, tiling, and spa-like designs." },
            { title: "Room Additions", desc: "Add extra rooms, offices, or extensions to meet your growing needs." },
            { title: "Flooring Installation", desc: "Hardwood, tile, vinyl, or carpet installed with precision." },
            { title: "Painting & Wallpaper", desc: "Fresh coats of paint or designer wallpapers to revitalize your home." },
            { title: "Lighting Upgrades", desc: "Modern lighting solutions to enhance ambience and functionality." },
            { title: "Basement Finishing", desc: "Turn unused basements into functional living or entertainment spaces." },
            { title: "Exterior Renovations", desc: "Roofing, siding, decks, and patios to boost curb appeal." },
            { title: "Smart Home Upgrades", desc: "Integrate automation, security, and energy-efficient systems." },
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
            How Our Home Change Process Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { step: "1", title: "Consultation", desc: "We discuss your ideas, goals, and budget in detail." },
              { step: "2", title: "Design & Planning", desc: "Our designers create a tailored plan and 3D models if required." },
              { step: "3", title: "Execution", desc: "Our professional crew handles all construction and installation." },
              { step: "4", title: "Final Touch", desc: "We inspect and polish every detail to deliver a flawless finish." },
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

      {/* Extra Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          Why Choose Us for Home Changes?
        </h2>
        <ul className="grid md:grid-cols-2 gap-6 text-gray-700 list-disc pl-6">
          <li>Free estimates and transparent pricing with no hidden charges.</li>
          <li>Licensed, insured, and certified professionals.</li>
          <li>Eco-friendly materials and energy-efficient options.</li>
          <li>On-time project completion with guaranteed satisfaction.</li>
          <li>Dedicated project managers for smooth communication.</li>
          <li>After-service support and maintenance options available.</li>
        </ul>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {[
            {
              q: "How long does a remodeling project take?",
              a: "Timelines vary depending on project size, but most renovations take between 2–8 weeks. We provide a detailed schedule upfront.",
            },
            {
              q: "Do you provide free estimates?",
              a: "Yes, we provide free consultations and detailed cost estimates tailored to your needs.",
            },
            {
              q: "Can you work within my budget?",
              a: "Absolutely! We customize designs and material options to fit your budget without compromising quality.",
            },
            {
              q: "Do I need permits for home changes?",
              a: "Certain projects require permits. We handle all the paperwork and ensure compliance with local regulations.",
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
