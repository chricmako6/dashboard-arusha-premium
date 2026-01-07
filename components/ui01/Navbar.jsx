"use client";
import React,{useState} from 'react';
import Image from 'next/image';
import { getFirebaseAuth } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { signOut } from 'firebase/auth';
import { useRouter } from "next/navigation";

function Navbar() {
   const router = useRouter(); 
   const [isLoggingOut, setIsLoggingOut] = useState(false);
   const [User, setUser] = useState(null);
   const [canAccess, setCanAccess] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const auth = getFirebaseAuth();
      await signOut(auth);
      setUser(null);
      setCanAccess(false);
      console.log("Logout successful");
      router.replace("/auth");
      
    } catch (error) {
      // Handle errors
      console.error("Logout error:", error);
      toast(`Logout failed: ${error.message}`);
      setIsLoggingOut(false);
    }
  };

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

        <div className='relative group flex gap-2 cursor-pointer'>
          <div className="flex flex-col">
            <span className='text-xs leading-3 font-medium'>Chriss Mac</span>
            <span className='text-[10px] text-gray-500 text-right'>Admin</span>
          </div>
          <Image src='/profile2.svg' alt='profile' width={25} height={25} className='bg-white rounded-full w-8 h-8'/>
        
           {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            <div className="py-1">
              <a href="/dashboard/profile" className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-100">My Profile</a>
              <a href="/dashboard/setting" className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-100">Setting</a>
              <hr className="my-1 border-gray-200" />
              <a  onClick={handleLogout} className="block px-3 py-2 text-xs text-red-600 hover:bg-red-50">Logout</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Navbar;