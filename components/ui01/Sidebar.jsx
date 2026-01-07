"use client";

import Link from "next/link";
import Menu from "./Menu";

export default function Sidebar() {
  return (
    <section className="w-[14%] md:w-[8%] lg:w-[16%] bg-white p-4">
      {/* Logo Section */}
      <Link href="/" className="flex items-center justify-center lg:justify-start gap-2 mb-6">
        <span className="hidden md:block text-xl font-bold">Logo</span>
      </Link>

      {/* Menu Section */}
      <Menu />
    </section>
  );
}
