import React from "react";
import MovingCalculator from "./MovingCostCalculator";

const HeroSection: React.FC = () => {
  return (
    <section className="relative text-white lg:h-[600px] overflow-hidden">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/image/hero.mp4"
        autoPlay
        loop
        muted
        playsInline
      ></video>
      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center lg:px-12 py-8 lg:py-16">
        {/* Left Content */}
        <div className="mt-44">
          <h1 className="text-5xl xl:text-6xl font-bold leading-tight mb-4">
            Moving Quote Texas
          </h1>
          <p className="text-2xl xl:text-3xl font-semibold leading-tight mb-6">
            Trusted Moving Company
          </p>
          <div className="flex gap-6 justify-center lg:justify-start items-center mt-8">
            <div>
              <h2 className="text-2xl font-bold">126+</h2>
              <p className="text-gray-300 text-sm">Moves today</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold">98%</h2>
              <p className="text-gray-300 text-sm">Results rated</p>
            </div>
          </div>
        </div>

        <div className="bg-transparent shadow-lg
         pointer-events-auto
            rounded-2xl border border-black/5
            overflow-auto
            max-h-[calc(100vh-7rem)]
            max-w-[calc(100vw-1.5rem)]
            w-[320px]
            md:w-[700px]">
          <MovingCalculator />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
