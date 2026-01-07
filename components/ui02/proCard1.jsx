import React from 'react'
import { FaMapLocationDot } from 'react-icons/fa6'
import { SiMinutemailer } from "react-icons/si";
import { MdOutlinePhoneAndroid } from "react-icons/md";


function ProCard1() {
  return (
    <div className="bg-gray-100 rounded-md p-4 shadow-xl">
      {/* PROFILE PIC */}
      <div className='border-b-2 border-gray-200 my-4 pb-4 flex flex-col items-center'>
        <img
          src="/profile-pic.jpg"
          alt="Profile Picture"
          className="w-40 h-40 rounded-full mx-auto bg-amber-400"
        />
         <h2 className="text-center text-lg font-semibold my-2">Chris Dev</h2>
         <span className="items-center mb-3 rounded-full p-2 px-3 bg-amber-200">Balance: $1,200.00</span>
      </div>
        {/* PROFILE DETAILS */}
        <div className='mt-5 pb-4 flex flex-col items-center'>
          <p className="mb-2 mt-3 text-center text-sm items-center flex flex-row gap-2 text-gray-600">
            <FaMapLocationDot className='w-5 h-5'/>
            Arusha, Tanzania
          </p>
          <p className="mb-2 text-center text-sm items-center flex flex-row gap-2 text-gray-600">
            <SiMinutemailer className='w-5 h-5 ml-7' />
            christoper@gmail.com
          </p>
          <p className="text-center text-sm items-center flex flex-row gap-2 text-gray-600">
            <MdOutlinePhoneAndroid className='w-5 h-5 ml-0' />
            +255 754 123 456
          </p>
        </div>
    </div>
  )
}

export default ProCard1