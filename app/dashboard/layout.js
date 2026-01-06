import Sidebar from "@/components/ui/Sidebar";
import Navbar from "@/components/ui/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-full bg-gray-100 text-gray-900">
      <Sidebar />
      <main className="w-[86%] md:w-[92%] lg:w-[84%] bg-[#f7f8fa] overflow-y-scroll">
        <Navbar />
        {children}
      </main>
    </div>
  );
}
