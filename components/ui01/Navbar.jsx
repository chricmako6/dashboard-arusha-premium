import React from 'react';
import Image from 'next/image';

export default function Navbar() {
  return (
    <div className="flex items-center justify-between p-4 ">
      {/* SEARCHING BAR */}
      <div className="hidden md:flex items-center bg-gray-200 p-2 rounded-xl ring-gray-300 px-2">
        <Image
          src="/search.svg"
          alt="Search Icon"
          width={20}
          height={20}
          className="w-5 h-5"
        />
        <input
          type="text"
          placeholder="Search..."
          className="ml-2 p-1 w-96 border-none bg-transparent focus:outline-none"
        />
      </div>

      {/* ICONS AND USER */}
      <div className='flex items-center gap-4 justify-end w-full'>
        <div className='bg-white rounded-full w-8 h-8 flex items-center justify-center'>
          <Image 
          src="/message2.svg" 
          alt='message2'
          width={25}
          height={25}
          className="w-6 h-6"/>
        </div>

        <div className='relative bg-white rounded-full w-8 h-8 flex items-center justify-center'>
          <Image 
          src="/bell.svg" 
          alt='notifiacation'
          width={25}
          height={25}
          className="w-6 h-6"/>
          <div className='absolute -right-1 -top-2  w-4 h-4 flex items-center justify-center bg-red-500 text-white text-xs rounded-full'>
            1
          </div>
        </div>

        <div className="flex flex-col">
          <span className='text-xs leading-3 font-medium'>Chriss Mac</span>
          <span className='text-[10px] text-gray-500 text-right'>Admin</span>
        </div>
        <Image src='/profile2.svg' alt='profile' width={25} height={25} className='bg-white rounded-full w-8 h-8'/>
      </div>
    </div>
  );
}
