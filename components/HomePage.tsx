"use client";

import CustomerReviews from "@/components/CustomerReview";
import EmailSubscription from "@/components/EmailSubmission";
import HeroSection from "@/components/hero";
import RelatedPost from "@/components/RelatedPost";
import VideoReviews from "@/components/VideoReview";
import Categories from "./Categories";
import HomeSeoSection from "./HomeSeoSection";


const HomePage = () => {

  return (
    <div className="relative">
      {/* ✅ Fixed Calculator (scrollable, NO zoom) */}
      {/* <div
        className="
          fixed z-30
          right-3 top-24
          md:right-6 md:top-28
          origin-top-right
          pointer-events-none
        "
      >
        <div
          className="
            pointer-events-auto
            rounded-2xl bg-white/95 shadow-2xl border border-black/5
            overflow-auto
            max-h-[calc(100vh-7rem)]
            max-w-[calc(100vw-1.5rem)]
            w-[320px]
            md:w-[700px]
          ">
          <MovingCalculator />
        </div>
      </div> */}

      {/* Main Content */}
      <div className="overflow-y-auto">
        <HeroSection />
        <h1 className="sr-only">Moving Quote Texas - Local & Long Distance Movers</h1>

        <div>
          <h2 className="text-3xl font-bold text-center mt-7 pl-5">
            Recent <span className="text-orange-600">Articles</span>
          </h2>
          <div className="mb-6 mt-2">
            <div className="w-16 h-1 bg-orange-600 mx-auto"></div>
          </div>
        </div>

        <RelatedPost currentPostID="119" />
        <HomeSeoSection />
        <CustomerReviews />
        <VideoReviews />
        <Categories />
        <EmailSubscription />
      </div>
    </div>
  );
};

export default HomePage;
