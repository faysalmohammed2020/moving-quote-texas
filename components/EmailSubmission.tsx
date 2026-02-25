import React from "react";
import Image from "next/image";

const EmailSubscription = () => {
  return (
    <section className="bg-gray-800 text-white rounded-lg p-6 md:flex items-center">
      <div className="md:w-2/3 md:pr-6 ml-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-2">
          Subscribe to us for{" "}
          <span className="text-orange-600 font-bold">Offer & Upadats</span>
        </h2>
        <h3 className="text-2xl font-bold mb-2">Don&apos;t miss anything!</h3>
        <p className="text-sm text-gray-400 mb-4">
          Join our community of 60,000+ who regularly receive the best moiving
          service in USA.
        </p>
        <form className="flex items-center">
          <div className="flex items-center bg-gray-700 rounded-md w-full max-w-md">
            <span className="px-4 text-gray-400">&#x2709;</span>
            <input
              type="email"
              placeholder="buzzmoving@gmail.com"
              className="bg-transparent focus:outline-none text-sm text-white placeholder-gray-500 w-full py-2"
            />
          </div>
          <button
            type="submit"
            className="ml-6 bg-lime-500 text-black font-semibold px-6 py-2 rounded-md hover:bg-lime-600 transition"
          >
            Subscribe
          </button>
        </form>
      </div>
      <div className="hidden md:block md:w-1/3 md:pl-6">
        <div className="relative">
          <Image
            src="/image/movers.png"
            alt="Creative Brief"
            width={650}
            height={450}
            className="rounded-lg object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default EmailSubscription;
