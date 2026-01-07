import React from 'react'
import { FiEdit } from 'react-icons/fi'

function ProDoc() {
  return (
    <div className='bg-gray-100 rounded-md p-4 shadow-xl '>
      <div className='flex flex-row justify-between items-center'>
          <h2 className='font-bold'>Document Information</h2>
            <FiEdit className='w-5 h-5 cursor-pointer text-gray-500'/> 
      </div>

      <div className='mt-4'>
          <p className='text-sm text-gray-600 mb-2'>Addresss
            <span className='font-bold text-gray-500 float-end'>chris_dev</span>
          </p>
          <p className='text-sm text-gray-600 mb-2'>City
            <span className='font-bold text-gray-500 float-end'>Chris</span>
          </p>
          <p className='text-sm text-gray-600 mb-2'>Country
            <span className='font-bold text-gray-500 float-end'>Mak0</span>
          </p>
          <p className='text-sm text-gray-600 mb-2'>State
            <span className='font-bold text-gray-500 float-end'>June 10, 2024</span>
          </p>
            <p className='text-sm text-gray-600 mb-2'>Zip Code 
            <span className='font-bold text-gray-500 float-end'>Male</span>
          </p>
        </div>
    </div>
  )
}

export default ProDoc