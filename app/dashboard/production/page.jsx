"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaPlus } from "react-icons/fa6";
import { HiDotsHorizontal } from "react-icons/hi";
import { PiDotsThreeCircle } from "react-icons/pi";
import { ImBin } from "react-icons/im";
import { BiSolidEdit } from "react-icons/bi";
import PaginationComponent from "@/components/ui01/PaginationComponent";

function productionPage() {
  const teachers = [
    {
      id: 1,
      name: "John Doe",
      teacherId: "TCH-001",
      subject: "120",
      classes: "20",
      phone: "Active",
      address: "$59.66",
      image: "/user1.png",
    },
    {
      id: 2,
      name: "John Doe",
      teacherId: "TCH-002",
      subject: "160",
      classes: "20",
      phone: "In stock",
      address: "$59.66",
      image: "/user2.png",
    },
    {
      id: 3,
      name: "John Doe",
      teacherId: "TCH-001",
      subject: "120",
      classes: "20",
      phone: "Out of stock",
      address: "$59.66",
      image: "/user3.png",
    },
    {
      id: 4,
      name: "John Doe",
      teacherId: "TCH-001",
      subject: "120",
      classes: "20",
      phone: "Active",
      address: "$59.66",
      image: "/user4.png",
    },
    {
      id: 5,
      name: "John Doe",
      teacherId: "TCH-001",
      subject: "120",
      classes: "20",
      phone: "Active",
      address: "$59.66",
      image: "/user5.png",
    },
    {
      id: 6,
      name: "John Doe",
      teacherId: "TCH-001",
      subject: "120",
      classes: "20",
      phone: "Active",
      address: "$59.66",
      image: "/user6.png",
    },
    {
      id: 7,
      name: "John Doe",
      teacherId: "TCH-001",
      subject: "120",
      classes: "20",
      phone: "Active",
      address: "$59.66",
      image: "/user7.png",
    },
    {
      id: 8,
      name: "John Doe",
      teacherId: "TCH-001",
      subject: "120",
      classes: "20",
      phone: "Active",
      address: "$59.66",
      image: "/user8.png",
    },
    {
      id: 9,
      name: "John Doe",
      teacherId: "TCH-001",
      subject: "120",
      classes: "20",
      phone: "Active",
      address: "$59.66",
      image: "/user9.png",
    },
    {
      id: 10,
      name: "John Doe",
      teacherId: "TCH-001",
      subject: "120",
      classes: "20",
      phone: "Active",
      address: "$59.66",
      image: "/user10.png",
    },
    {
      id: 11,
      name: "John Doe",
      teacherId: "TCH-001",
      subject: "120",
      classes: "20",
      phone: "Active",
      address: "$59.66",
      image: "/user1.png",
    },
    {
      id: 12,
      name: "John Doe",
      teacherId: "TCH-001",
      subject: "120",
      classes: "20",
      phone: "Active",
      address: "$59.66",
      image: "/user1.png",
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
        <h1 className="text-lg font-semibold">All Product List</h1>
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
              className="px-2 py-2 w-80 border-none bg-transparent text-xs gap-2 focus:outline-none"
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
              <th className="px-4 py-6">ITEM NAME</th>
              <th className="px-4 py-6">SKU</th>
              <th className="px-4 py-6">ITEM SOLD</th>
              <th className="px-4 py-6">TOTAL SELL</th>
              <th className="px-4 py-6">STATUS</th>
              <th className="px-4 py-6">PRICE</th>
              <th className="px-4 py-6 rounded-tr-xl">ACTION</th>
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
                  <td className="px-4 py-5">{t.classes}</td>
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

export default productionPage;
