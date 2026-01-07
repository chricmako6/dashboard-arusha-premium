import React from 'react'
import { FiEdit } from 'react-icons/fi'

function ProPay() {
  return (
    <div className='bg-gray-100 rounded-md p-4 shadow-xl mb-6'>
        <div className='flex flex-row justify-between items-center mb-5'>
        <h2 className='font-bold'>Payment Information</h2>
            <FiEdit className='w-5 h-5 cursor-pointer text-gray-500'/> 
        </div>

        <div className='mt-4 border-b-2 border-gray-200 pb-8 flex flex-col items-center'>
            <img
            src="/profile-pic.jpg"
            alt="Card Picture"
            className="w-72 h-40 rounded-md mx-auto bg-amber-200"
            />
        </div>

        <div className='mt-7'>
             <p className='text-sm text-gray-600 mb-2'>Card Type
              <span className='font-bold text-gray-500 float-end'>chris_dev</span>
            </p>
            <p className='text-sm text-gray-600 mb-2'>Card Holder Name 
              <span className='font-bold text-gray-500 float-end'>Chris</span>
            </p>
            <p className='text-sm text-gray-600 mb-2'>Expire Date
              <span className='font-bold text-gray-500 float-end'>Mak0</span>
            </p>
            <p className='text-sm text-gray-600 mb-2'>Card Number
              <span className='font-bold text-gray-500 float-end'>June 10, 2024</span>
            </p>
             <p className='text-sm text-gray-600 mb-2'>Balance
              <span className='font-bold text-gray-500 float-end'>Male</span>
            </p>
        </div>
    </div>
  )
}

export default ProPay