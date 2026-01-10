'use client'
import React, {useState} from 'react'
import { FiEdit } from "react-icons/fi";

function ProAccount({ profileData, onEdit }) {
  const [isEditing, setIsEditing] = useState(false)

   // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not provided"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  } 

  return (
    <div className='bg-gray-100 rounded-md p-4 shadow-xl mb-6'>
        <div className='flex flex-row justify-between items-center'>
            <h2 className='font-bold'>Account Information</h2>
              <button 
                onClick={() => onEdit ? onEdit() : setIsEditing(!isEditing)}
                className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                <FiEdit className='w-5 h-5 text-gray-500'/> 
              </button>
        </div>

        <div className='mt-4'>
            <p className='text-sm text-gray-600 mb-2'>Username
              <span className='font-bold text-gray-500 float-end'>
                {profileData?.username || profileData?.userDisplayName || "Not set"}
              </span>
            </p>
            <p className='text-sm text-gray-600 mb-2'>First Name 
              <span className='font-bold text-gray-500 float-end'>
                  {profileData?.firstName || "Not provided"}
              </span>
            </p>
            <p className='text-sm text-gray-600 mb-2'>Last Name 
              <span className='font-bold text-gray-500 float-end'>
                {profileData?.lastName || "Not provided"}
              </span>
            </p>
            <p className='text-sm text-gray-600 mb-2'>Date of Birth 
              <span className='font-bold text-gray-500 float-end'>
                {formatDate(profileData?.dateBirth)}
              </span>
            </p>
             <p className='text-sm text-gray-600 mb-2'>Gender 
              <span className='font-bold text-gray-500 float-end'>
                 {profileData?.gender || "Not specified"}
              </span>
            </p>
        </div>
    </div>
  )
}

export default ProAccount