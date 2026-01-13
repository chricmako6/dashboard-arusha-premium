'use client';
import React,{ useState } from 'react';
import Side from "./component/side";
import NavbarAdmin from "./component/navbarAdmin";
import { PiDotsThreeOutlineBold } from 'react-icons/pi';

function DashboardLayout({ children }) {
   const [loading, setLoading] = useState(true);

    React.useEffect(() => {
      const timer = setTimeout(() => {
         setLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
        <div className="text-gray-700 flex items-center">
            Loading<span className='animate-pulse ml-1'><PiDotsThreeOutlineBold className="w-10 h-10 "/></span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-100 text-gray-900">
      <Side />
      <main className="w-[86%] md:w-[92%] lg:w-[84%] bg-[#f7f8fa] overflow-y-scroll">
        <NavbarAdmin />
        {children}
      </main>
    </div>
  );
}
export default DashboardLayout;