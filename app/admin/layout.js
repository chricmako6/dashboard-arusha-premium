import Side from "./component/side";
import NavbarAdmin from "./component/navbarAdmin";

export default function DashboardLayout({ children }) {
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
