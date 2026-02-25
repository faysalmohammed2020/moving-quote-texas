// app/(main)/layout.tsx

import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grow grid place-items-center px-4 py-4 ">
      {children}
    </div>
  );
}
