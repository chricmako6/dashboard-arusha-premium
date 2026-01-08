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
          <div className='flex gap-4'>
            <p className='text-sm text-gray-600 mb-2 font-bold'>ID/Passport
              <span className='font-bold text-gray-500 flex flex-col'>
                <img
                  src="/profile-pic.jpg"
                  alt="Profile Picture"
                  className="w-40 h-25 rounded-md my-1.5 bg-amber-400"
                />
              </span>
            </p>
            <p className='text-sm text-gray-600 mb-2 font-bold'>Proof of Address
              <span className='font-bold text-gray-500 flex flex-col'>
                <img
                  src="/profile-pic.jpg"
                  alt="Profile Picture"
                  className="w-40 h-25 rounded-md my-1.5 bg-amber-400"
                />
              </span>
            </p>
          </div>
          <p className='text-sm text-gray-600 mb-2'>TIN Number
            <span className='font-bold text-gray-500 float-end'>Chris</span>
          </p>
          <p className='text-sm text-gray-600 mb-2'>NIDA
            <span className='font-bold text-gray-500 float-end'>Mak0</span>
          </p>
          <p className='text-sm text-gray-600 mb-2'>Education Level
            <span className='font-bold text-gray-500 float-end'>Male</span>
          </p>
        </div>
    </div>
  )
}

export default ProDoc