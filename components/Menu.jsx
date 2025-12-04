import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; 
import { IoIosArrowDown } from "react-icons/io";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "MENU",
    items: [
      { icon: "/home.svg", name: "Home", link: "/dashboard" },
      { 
        icon: "/teacher.svg",
        name: "Inventory", 
        link: "/dashboard/teacher",
        submenu: [
          { name: "Inventory List", link: "/dashboard/teacher/list" },
          { name: "Add Inventory", link: "/dashboard/teacher/add" },
          { name: "Inventory Report", link: "/dashboard/teacher/report" },
        ]
      },
      { icon: "/student.svg", name: "Production", link: "/dashboard/student" },
      { icon: "/parent.svg", name: "Supplier", link: "/dashboard/parent" },
      { icon: "/schooll.svg", name: "Finance", link: "/dashboard/finance" },
      { icon: "/lesson.svg", name: "Report", link: "/dashboard/lesson" },
      { icon: "/event.svg", name: "Events", link: "/dashboard/event" },
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
  const [openDropdown, setOpenDropdown] = useState(null);
  const pathname = usePathname();

  // Update the currentPath state on the client side
  useEffect(() => {
    setCurrentPath(pathname || "/");
  }, [pathname]);

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <nav className="flex flex-col gap-6">
      {menuItems.map((menu, menuIndex) => (
        <div key={menuIndex}>
          {/* Render Menu Title */}
          <h3 className="text-gray-500 text-sm font-semibold mb-2">
            {menu.title}
          </h3>

          {/* Render Menu Items */}
          <div className="flex flex-col gap-2">
            {menu.items.map((item, itemIndex) => (
              <div key={itemIndex}>
                {item.submenu ? (
                  <button
                    onClick={() => toggleDropdown(itemIndex)}
                    className={`w-full flex items-center gap-2 p-2 rounded-full md:rounded-xl justify-between ${
                      openDropdown === itemIndex
                        ? "bg-amber-200"
                        : "text-gray-700 hover:bg-amber-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={item.icon}
                        alt={item.name}
                        width={25}
                        height={25}
                        className="w-6 h-6"
                      />
                      <span className="hidden lg:block">{item.name}</span>
                    </div>
                    <span className={`transform transition-transform ${openDropdown === itemIndex ? "rotate-180" : ""}`}>
                      <IoIosArrowDown />
                    </span>
                  </button>
                ) : (
                  <Link
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
                )}

                {/* Submenu Items */}
                {item.submenu && openDropdown === itemIndex && (
                  <div className="flex flex-col gap-1 mt-2 ml-4">
                    {item.submenu.map((submenuItem, submenuIndex) => (
                      <Link
                        key={submenuIndex}
                        href={submenuItem.link}
                        className={`text-sm p-2 rounded-lg transition ${
                          currentPath === submenuItem.link
                            ? "bg-amber-100 text-amber-900 font-semibold"
                            : "text-gray-600 hover:bg-amber-50"
                        }`}
                      >
                        {submenuItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
