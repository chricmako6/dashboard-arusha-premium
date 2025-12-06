"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { IoArrowBack } from "react-icons/io5";

function InventoryAdd() {
  const [uploadedImages, setUploadedImages] = useState([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImages((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReplaceImage = (index) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadedImages((prev) => {
            const newImages = [...prev];
            newImages[index] = event.target.result;
            return newImages;
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="bg-white rounded-md p-6 mt-4 shadow-md w-[98%] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Add Inventory Item</h2>
        <button className="px-6 py-2 flex items-center gap-2 bg-amber-200 hover:bg-amber-100 rounded-md">
            <IoArrowBack />
            <Link href="inventory">Back</Link>
        </button>
      </div>

      <form action="inventory" method="" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Name */}
        <div className="col-span-1 lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <div className="md:flex items-center bg-gray-100 p-2 rounded-xl ring-gray-300 px-2">
                <input
                type="text"
                placeholder="Item Name"
                className="ml-2 p-1 w-full border-none bg-transparent focus:outline-none"
                />
            </div>
        </div>

        {/* SKU */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
          <div className="md:flex items-center bg-gray-100 p-2 rounded-xl ring-gray-300 px-2">
            <select className="w-full border border-gray-100 rounded-md p-1 focus:outline-none">
                <option>Select</option>
            </select>
          </div>
        </div>

        {/* Weight (lbs / oz) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
          <div className="flex gap-2">
            <div className="md:flex items-center bg-gray-100 p-2 rounded-xl ring-gray-300 px-2">
                <input
                type="text"
                placeholder="lbs"
                className="ml-2 p-1 w-full border-none bg-transparent focus:outline-none"
                />
            </div>
            <div className="md:flex items-center bg-gray-100 p-2 rounded-xl ring-gray-300 px-2">
                <input
                type="text"
                placeholder="oz"
                className="ml-2 p-1 w-full border-none bg-transparent focus:outline-none"
                />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div className="md:flex items-center bg-gray-100 p-2 rounded-xl ring-gray-300 px-2">
            <select className="w-full border border-gray-100 rounded-md p-1 focus:outline-none">
                <option>Select</option>
            </select>
          </div>
        </div>

        {/* Handling time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Handling time</label>
          <div className="md:flex items-center bg-gray-100 p-2 rounded-xl ring-gray-300 px-2">
            <select className="w-full border border-gray-100 rounded-md p-1 focus:outline-none">
                <option>Select</option>
            </select>
          </div>
        </div>

        {/* ASIN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ASIN</label>
          <div className="md:flex items-center bg-gray-100 p-2 rounded-xl ring-gray-300 px-2">
            <select className="w-full border border-gray-100 rounded-md p-1 focus:outline-none">
                <option>Select</option>
            </select>
          </div>
        </div>

        {/* ISBN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
          <div className="md:flex items-center bg-gray-100 p-2 rounded-xl ring-gray-300 px-2">
            <select className="w-full border border-gray-100 rounded-md p-1 focus:outline-none">
                <option>Select</option>
            </select>
          </div>
        </div>

        {/* Warehouse / Bin number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse /Bin number</label>
          <div className="md:flex items-center bg-gray-100 p-2 rounded-xl ring-gray-300 px-2">
                <input
                type="text"
                placeholder="Warehouse"
                className="ml-2 p-1 w-full border-none bg-transparent focus:outline-none"
                />
            </div>
        </div>

        {/* Country of Manufacture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country of Manufacture</label>
            <div className="md:flex items-center bg-gray-100 p-2 rounded-xl ring-gray-300 px-2">
                <input
                type="text"
                placeholder="Arusha, Tanzania"
                className="ml-2 p-1 w-full border-none bg-transparent focus:outline-none"
                />
            </div>
        </div>

        {/* Wholesale price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wholesale price</label>
          <div className="md:flex items-center bg-gray-100 p-2 rounded-xl ring-gray-300 px-2">
                <input
                type="text"
                placeholder="$0.00"
                className="ml-2 p-1 w-full border-none bg-transparent focus:outline-none"
                />
            </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <div className="md:flex items-center bg-gray-100 p-2 rounded-xl ring-gray-300 px-2">
            <select className="w-full border border-gray-100 rounded-md p-1 focus:outline-none">
                <option>Select</option>
            </select>
          </div>
        </div>

        {/* Track stock section - full width */}
        <div className="col-span-1 lg:col-span-2 pt-6 mt-4">
          <div className="flex items-center gap-95 mb-4">
            <h3 className="text-md font-semibold text-gray-800">Track stock</h3>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-green-500" />
            </label>
          </div>

          {/* In Stock and Low Stock */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">In Stock</label>
              <div className="md:flex items-center bg-gray-100 p-2 rounded-xl ring-gray-300 px-2">
                    <input
                    type="number"
                    placeholder="20"
                    className="ml-2 p-1 w-full border-none bg-transparent focus:outline-none"
                    />
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock</label>
              <div className="md:flex items-center bg-gray-100 p-2 rounded-xl ring-gray-300 px-2">
                    <input
                    type="number"
                    placeholder="40"
                    className="ml-2 p-1 w-full border-none bg-transparent focus:outline-none"
                    />
                </div>
              <p className="text-xs text-gray-500 mt-1">Item quantity at which you will be notified about stock</p>
            </div>
          </div>
        </div>

        {/* Product Images section - full width */}
        <div className="col-span-1 lg:col-span-2 pt-6 mt-4">
          <h3 className="text-md font-semibold text-gray-800 mb-4">Product images</h3>
          
          <div className="flex gap-4 flex-wrap">
            {/* Upload area */}
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-32 h-32 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition">
              <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <p className="text-xs text-green-600 text-center font-medium">Click to upload<br />or drag and drop</p>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>

            {/* Uploaded images with actions */}
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img src={image} alt={`Product ${index + 1}`} className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                <div className="absolute inset-0 bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                  <button 
                    type="button"
                    onClick={() => handleReplaceImage(index)}
                    className="px-3 py-1 bg-white text-gray-800 text-sm rounded font-medium hover:bg-gray-100"
                  >
                    Replace
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="px-3 py-1 bg-white text-gray-800 text-sm rounded font-medium hover:bg-gray-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions - full width */}
        <div className="col-span-1 lg:col-span-2 flex justify-end gap-3 border-t border-gray-200 pt-6 mt-4">
          <button type="button" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-amber-200 hover:bg-amber-100 rounded-md">Save</button>
        </div>
      </form>
    </div>
  )
}
export default InventoryAdd