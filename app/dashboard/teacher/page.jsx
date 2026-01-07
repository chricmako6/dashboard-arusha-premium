"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaPlus } from "react-icons/fa6";
import { HiDotsHorizontal } from "react-icons/hi";
import { PiDotsThreeCircle } from "react-icons/pi";
import { ImBin } from "react-icons/im";
import { BiSolidEdit } from "react-icons/bi";
import PaginationComponent from "@/components/ui01/PaginationComponent";

function teacherPage() {
  const teachers = [
    {
      id: 1,
      name: "John Doe",
      teacherId: "TCH-001",
      subject: "Mathematics",
      phone: "(555) 101-2020",
      address: "101 High St, Springfield",
      email: "johndoe@school.edu",
      image: "/user1.png",
      classes: ["Grade 10", "Grade 11"],
    },
    {
      id: 2,
      name: "Jane Smith",
      teacherId: "TCH-002",
      subject: "English",
      phone: "(555) 203-4040",
      address: "204 Lake Rd, Springfield",
      email: "janesmith@school.edu",
      image: "/user2.png",
      classes: ["Grade 9", "Grade 12"],
    },
    {
      id: 3,
      name: "Michael Brown",
      teacherId: "TCH-003",
      subject: "Science",
      phone: "(555) 505-6060",
      address: "303 River Ln, Springfield",
      email: "michaelb@school.edu",
      image: "/user3.png",
      classes: ["Grade 8", "Grade 10"],
    },
    {
      id: 4,
      name: "Sarah Johnson",
      teacherId: "TCH-004",
      subject: "History",
      phone: "(555) 707-8080",
      address: "505 Maple Ave, Springfield",
      email: "sarahj@school.edu",
      image: "/user4.png",
      classes: ["Grade 7", "Grade 9"],
    },
    {
      id: 5,
      name: "Sarah Johnson",
      teacherId: "TCH-004",
      subject: "History",
      phone: "(555) 707-8080",
      address: "505 Maple Ave, Springfield",
      email: "sarahj@school.edu",
      image: "/user4.png",
      classes: ["Grade 7", "Grade 9"],
    },
    {
      id: 6,
      name: "Sarah Johnson",
      teacherId: "TCH-004",
      subject: "History",
      phone: "(555) 707-8080",
      address: "505 Maple Ave, Springfield",
      email: "sarahj@school.edu",
      image: "/user4.png",
      classes: ["Grade 7", "Grade 9"],
    },
    {
      id: 7,
      name: "Sarah Johnson",
      teacherId: "TCH-004",
      subject: "History",
      phone: "(555) 707-8080",
      address: "505 Maple Ave, Springfield",
      email: "sarahj@school.edu",
      image: "/user4.png",
      classes: ["Grade 7", "Grade 9"],
    },
    {
      id: 8,
      name: "Sarah Johnson",
      teacherId: "TCH-004",
      subject: "History",
      phone: "(555) 707-8080",
      address: "505 Maple Ave, Springfield",
      email: "sarahj@school.edu",
      image: "/user4.png",
      classes: ["Grade 7", "Grade 9"],
    },
    {
      id: 9,
      name: "Sarah Johnson",
      teacherId: "TCH-004",
      subject: "History",
      phone: "(555) 707-8080",
      address: "505 Maple Ave, Springfield",
      email: "sarahj@school.edu",
      image: "/user4.png",
      classes: ["Grade 7", "Grade 9"],
    },
    {
      id: 10,
      name: "Sarah Johnson",
      teacherId: "TCH-004",
      subject: "History",
      phone: "(555) 707-8080",
      address: "505 Maple Ave, Springfield",
      email: "sarahj@school.edu",
      image: "/user4.png",
      classes: ["Grade 7", "Grade 9"],
    },
    {
      id: 11,
      name: "Sarah Johnson",
      teacherId: "TCH-004",
      subject: "History",
      phone: "(555) 707-8080",
      address: "505 Maple Ave, Springfield",
      email: "sarahj@school.edu",
      image: "/user4.png",
      classes: ["Grade 7", "Grade 9"],
    },
    {
      id: 12,
      name: "Sarah Johnson",
      teacherId: "TCH-004",
      subject: "History",
      phone: "(555) 707-8080",
      address: "505 Maple Ave, Springfield",
      email: "sarahj@school.edu",
      image: "/user4.png",
      classes: ["Grade 7", "Grade 9"],
    },
    {
      id: 13,
      name: "Sarah Johnson",
      teacherId: "TCH-004",
      subject: "History",
      phone: "(555) 707-8080",
      address: "505 Maple Ave, Springfield",
      email: "sarahj@school.edu",
      image: "/user4.png",
      classes: ["Grade 7", "Grade 9"],
    },
  ];

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const teachersPerPage = 10;

  const totalPages = Math.ceil(teachers.length / teachersPerPage);
  const currentTeachers = teachers.slice(
    (currentPage - 1) * teachersPerPage,
    currentPage * teachersPerPage
  );

  // State for selected teacher IDs
  const [selected, setSelected] = useState([]);
  const masterRef = useRef(null);

  // Update master checkbox indeterminate state
  useEffect(() => {
    if (!masterRef.current) return;
    const allCount = teachers.length;
    const selectedCount = selected.length;

    masterRef.current.indeterminate =
      selectedCount > 0 && selectedCount < allCount;
  }, [selected, teachers.length]);

  const isAllSelected = selected.length === teachers.length && teachers.length > 0;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelected([]);
    } else {
      setSelected(teachers.map((t) => t.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <div className="bg-white rounded-md p-4 mt-4 shadow-md w-[98%] mx-auto">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">All Teachers List</h1>
        <span className="flex justify-between items-center gap-2">
          {/* SEARCH BAR */}
          <div className="hidden md:flex items-center bg-gray-200 p-1 rounded-full ring-gray-300 px-2">
            <Image
              src="/search.svg"
              alt="Search Icon"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <input
              type="text"
              placeholder="Search by ID, Name..."
              className="p-1 w-80 border-none bg-transparent text-xs gap-2 focus:outline-none"
            />
          </div>
          {/* BUTTONS */}
          <span className="bg-[#fae27c] p-2 rounded-full cursor-pointer hover:bg-yellow-300">
            <HiDotsHorizontal />
          </span>
          <span className="bg-[#fae27c] p-2 rounded-full cursor-pointer hover:bg-yellow-300">
            <FaPlus />
          </span>
        </span>
      </div>

      {/* TEACHERS TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#fae27c] rounded-t-md text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-2 rounded-tl-xl">
                <input
                  ref={masterRef}
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  aria-label="Select all teachers"
                  className="w-4 h-4"
                />
              </th>
              <th className="px-4 py-6">Name</th>
              <th className="px-4 py-6">Teacher ID</th>
              <th className="px-4 py-6">Subject</th>
              <th className="px-4 py-6">Classes</th>
              <th className="px-4 py-6">Phone</th>
              <th className="px-4 py-6">Address</th>
              <th className="px-4 py-6 rounded-tr-xl">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentTeachers.map((t) => {
              const checked = selected.includes(t.id);
              return (
                <tr key={t.id} className="border-b border-gray-200 hover:bg-amber-100">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelectOne(t.id)}
                      aria-label={`Select ${t.name}`}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="flex items-center gap-2 px-4 py-5">
                    <Image
                      src={t.image}
                      alt={t.name}
                      width={30}
                      height={30}
                      className="w-8 h-8 rounded-full object-cover bg-amber-400"
                    />
                    <div>
                      <p className="font-medium text-gray-700">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-5">{t.teacherId}</td>
                  <td className="px-4 py-5">{t.subject}</td>
                  <td className="px-4 py-5">{t.classes.join(", ")}</td>
                  <td className="px-4 py-5">{t.phone}</td>
                  <td className="px-4 py-5">{t.address}</td>
                  <td className="px-4 py-5 text-gray-500 text-xl">
                    <button className="hover:text-blue-500">
                      <PiDotsThreeCircle />
                    </button>
                    <button className="ml-2 hover:text-green-500">
                      <BiSolidEdit />
                    </button>
                    <button className="ml-2 hover:text-red-500">
                      <ImBin />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION SECTION */}
      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default teacherPage;
