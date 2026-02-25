'use client'

import AdminDashboard from "@/components/AdminDashboard";
const DashboardPage: React.FC = () => {
return (
    <div>
      {/* Header */}
       <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </header>
      <AdminDashboard />
    </div>
  );
};

export default DashboardPage;
