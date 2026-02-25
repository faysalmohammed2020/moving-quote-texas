import React, { ReactNode } from "react";
import Sidebar from "@/components/Sidebar"; // Adjust the import path as per your project structure

interface DashboardLayoutProps {
  children: ReactNode; // Accepts nested routes or pages as children
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-auto flex-shrink-0 bg-white">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-grow p-4 max-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
