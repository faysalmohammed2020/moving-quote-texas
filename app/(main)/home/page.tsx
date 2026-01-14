import HomePage from "@/components/HomePage";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Moving Quote Texas | Local & Long Distance Moving Services",
  description:
    "Get fast, affordable moving quotes in Texas. Local and long-distance movers, packing, storage, and vehicle transport. Trusted crews, clear pricing, and smooth delivery.",
  alternates: {
    canonical: "https://movingquotetexas.com/",
  },
  openGraph: {
    title: "Moving Quote Texas | Local & Long Distance Moving Services",
    description:
      "Affordable moving quotes in Texas with packing, storage and long-distance options.",
    url: "https://movingquotetexas.com/",
    siteName: "Moving Quote Texas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moving Quote Texas",
    description:
      "Affordable moving quotes in Texas with packing, storage and long-distance options.",
  },
};

export default function Page() {
  return <HomePage />;
}
