import React, { useState } from 'react'
import { FiEdit } from 'react-icons/fi'
import { FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa'

function ProPay({ profileData, onEdit }) {
 const [isEditing, setIsEditing] = useState(false)

  // Get card icon based on type
  const getCardIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'visa':
        return <FaCcVisa className="text-blue-600 text-9xl" />
      case 'mastercard':
        return <FaCcMastercard className="text-red-600 text-9xl" />
      case 'amex':
        return <FaCcAmex className="text-blue-400 text-8xl" />
      default:
        return <div className="w-12 h-8 bg-gray-300 rounded"></div>
    }
  }

   // Mask card number
  const maskCardNumber = (number) => {
    if (!number) return "•••• •••• •••• ••••"
    const lastFour = number.slice(-4)
    return `•••• •••• •••• ${lastFour}`
  }

  return (
    <div className='bg-gray-100 rounded-md p-4 shadow-xl mb-6'>
        <div className='flex flex-row justify-between items-center mb-5'>
        <h2 className='font-bold'>Payment Information</h2>
           <button 
            onClick={() => onEdit ? onEdit() : setIsEditing(!isEditing)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiEdit className='w-5 h-5 text-gray-500 cursor-pointer'/> 
          </button>
        </div>

       {/* Card Preview */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start mb-8">
            {getCardIcon(profileData?.cardType)}
            <div className="text-right">
              <div className="text-xs opacity-80">Status</div>
              <div className={`text-sm font-semibold ${profileData?.status === 'active' ? 'text-green-300' : 'text-yellow-300'}`}>
                {profileData?.status || 'Inactive'}
              </div>
            </div>
          </div>
        </div>

        <div className='mt-7'>
             <p className='text-sm text-gray-600 mb-2'>Card Type
              <span className='font-bold text-gray-500 float-end'>
                {profileData?.cardType || "Not set"}
              </span>
            </p>
            <p className='text-sm text-gray-600 mb-2'>Card Holder Name 
              <span className='font-bold text-gray-500 float-end'>
                {profileData?.cardholderName || "Not set"}
              </span>
            </p>
            <p className='text-sm text-gray-600 mb-2'>Expire Date
              <span className='font-bold text-gray-500 float-end'>
                {profileData?.expiryDate || "••/••"}
              </span>
            </p>
            <p className='text-sm text-gray-600 mb-2'>Card Number
              <span className='font-bold text-gray-500 float-end'>
                {maskCardNumber(profileData?.cardNumber)}
              </span>
            </p>
             <p className='text-sm text-gray-600 mb-2'>Status
              <span className={`text-sm font-semibold float-end ${profileData?.status === 'active' ? 'text-green-300' : 'text-yellow-300'}`}>
                {profileData?.status || 'Inactive'}
              </span>
            </p>
        </div>
    </div>
  )
}

export default ProPay