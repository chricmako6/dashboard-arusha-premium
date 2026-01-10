import React from 'react'
import { FaMapLocationDot } from 'react-icons/fa6'
import { SiMinutemailer } from "react-icons/si";
import { MdOutlinePhoneAndroid } from "react-icons/md";


function ProCard1({ user, profileData }) {
  const displayName = user?.displayName || profileData?.firstName || "User"
  const email = user?.email || profileData?.email || "No email"
  const location = profileData?.nationality || profileData?.location || "Not specified"
  const phone = profileData?.mobile || profileData?.phone || "Not provided"
  return (
    <div className="bg-gray-100 rounded-md p-4 shadow-xl">
      {/* PROFILE PIC */}
      <div className='border-b-2 border-gray-200 my-4 pb-4 flex flex-col items-center'>
        <div className='relative'>
           <img
            src={profileData?.profileImage || "/default-profile.jpg"}
            alt="Profile Picture"
            className="w-40 h-40 rounded-full mx-auto object-cover border-4 border-amber-100"
            onError={(e) => {
              e.target.src = "/default-profile.jpg"
            }}
          />
          <div className="absolute top-[117px] right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
       </div>
       <h2 className="text-center text-lg font-semibold my-2">{displayName}</h2>
       {/* CHECKING FOR VERIFICATION STATUS */}
             {profileData?.isVerified !== undefined && (
              <div className="mt-5 p-3 bg-gray-50 rounded-full">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    profileData.isVerified 
                      ? 'bg-green-100 text-green-800' 
                      : profileData.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profileData.isVerified ? 'Verified' : profileData.status || 'Not Submitted'}
                  </span>
                </div>
              </div>
            )}
       </div>
        {/* PROFILE DETAILS */}
        <div className='mt-5 pb-4 flex flex-col'>
          <p className="mb-2 mt-3 text-center text-sm items-center flex flex-row gap-2 text-gray-600">
            <FaMapLocationDot className='w-5 h-5 ml-16'/>
            {location}
          </p>
          <p className="mb-2 text-center text-sm items-center flex flex-row gap-2 text-gray-600 overflow-hidden">
            <SiMinutemailer className='w-5 h-5 ml-16' />
            <span className="truncate max-w-[140px]" title={email}>
              {email}
            </span>
          </p>
          <p className="text-center text-sm items-center flex flex-row gap-2 text-gray-600">
            <MdOutlinePhoneAndroid className='w-5 h-5 ml-16' />
            {phone}
          </p>
        </div>
    </div>
  )
}

export default ProCard1