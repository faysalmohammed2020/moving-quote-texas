// app/(main)/layout.tsx

import Footer from "@/components/Footer";
import HeaderMenu from "@/components/Header";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderMenu />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}