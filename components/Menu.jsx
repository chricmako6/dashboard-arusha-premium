import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // Import the next/image component
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "MENU",
    items: [
      { icon: "/home.svg", name: "Home", link: "/dashboard" },
      { icon: "/teacher.svg", name: "Inventory", link: "/dashboard/teacher" },
      { icon: "/student.svg", name: "Production", link: "/dashboard/student" },
      { icon: "/parent.svg", name: "Supplier", link: "/dashboard/parent" },
      { icon: "/schooll.svg", name: "Finance", link: "/dashboard/finance" },
      { icon: "/lesson.svg", name: "Report", link: "/dashboard/lesson" },
      { icon: "/exam.svg", name: "Exams", link: "/dashboard/exam" },
      { icon: "/assignment.svg", name: "Assignments", link: "/dashboard/assignment" },
      { icon: "/attendance.svg", name: "Attendance", link: "/dashboard/attandance" },
      { icon: "/event.svg", name: "Events", link: "/dashboard/event" },
      { icon: "/message2.svg", name: "Messages", link: "/dashboard/message" },
      { icon: "/announcement.svg", name: "Announcements", link: "/dashboard/announcement" },
    ],
  },
  {
    title: "OTHER",
    items: [
      { icon: "/profile2.svg", name: "Profile", link: "/dashboard/profile" },
      { icon: "/gears1.svg", name: "Setting", link: "/dashboard/setting" },
      { icon: "/logout.svg", name: "Logout", link: "/dashboard/logout" },
    ],
  },
];

export default function Menu() {
  const [currentPath, setCurrentPath] = useState("");
  const pathname = usePathname();

  // Update the currentPath state on the client side
  useEffect(() => {
    setCurrentPath(pathname || "/");
  }, [pathname]);

  return (
    
    <nav className="flex flex-col gap-6">
      {menuItems.map((menu, menuIndex) => (
        <div key={menuIndex}>
          {/* Render Menu Title */}
          <h3 className="text-gray-500 text-sm font-semibold mb-2">{menu.title}</h3>

          {/* Render Menu Items */}
          <div className="flex flex-col gap-2">
            {menu.items.map((item, itemIndex) => (
              <Link
                key={itemIndex}
                href={item.link}
                className={`flex items-center gap-2 p-2 rounded-full md:rounded-xl ${
                  currentPath === item.link
                    ? "bg-amber-200"
                    : "text-gray-700 hover:bg-amber-100"
                }`}
              >
                <Image
                  src={item.icon}
                  alt={item.name}
                  width={25}
                  height={25}
                  className="w-6 h-6"
                />
                <span className="hidden lg:block">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
