"use client";
import React,{useState, useEffect} from 'react';
import Image from 'next/image';
import { getFirebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';
import { signOut } from 'firebase/auth';
import { useRouter } from "next/navigation";
import { FaUserAlt } from 'react-icons/fa';
import { BiSolidMessageAltDetail, BiSupport } from 'react-icons/bi';
import { IoSettingsSharp } from 'react-icons/io5';
import { RiLogoutCircleLine } from 'react-icons/ri';

function Navbar({ displayName, profilePicture }) {
   const router = useRouter(); 
   const [isLoggingOut, setIsLoggingOut] = useState(false);
   const [User, setUser] = useState(null);
   const [canAccess, setCanAccess] = useState(false);

  // Fetch current user
   useEffect(() => {
     const auth = getFirebaseAuth();
     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
       if (currentUser) {
         setUser({
           displayName: currentUser.displayName,
           email: currentUser.email,
           photoURL: currentUser.photoURL
         });
       } else {
         setUser(null);
       }
       setLoading(false);
     }, 1000);
     
     return () => unsubscribe();
   }, []); 

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
            <span className='text-xs leading-2 mt-2 font-bold'>{displayName}</span>
            <span className='text-xs leading-2 text-gray-500 my-2'>Welcome User</span>
          </div>
          <img 
            src={profilePicture || '/profile2.svg'}
            alt='profile'
            className='bg-white rounded-full w-10 h-10 object-cover'
            onError={(e) => {
              e.target.src = '/profile2.svg';
              e.target.onerror = null;
            }}
          />
        
           {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            <div className="py-1">
              <a href="/dashboard/profile" className="hover:text-amber-200 font-bold flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
                <FaUserAlt className='w-5 h-5' />
                Profile
              </a>
              <a href="/dashboard/#" className="hover:text-amber-200 font-bold flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
                <BiSolidMessageAltDetail className='w-5 h-5' />
                Inbox
              </a>
              <a href="/dashboard/setting" className="hover:text-amber-200font-bold flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
                <IoSettingsSharp className='w-5 h-5'/>
                Setting
              </a>
              <a href="/dashboard/#" className="hover:text-amber-200 font-bold flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
                <BiSupport className='w-5 h-5' />
                Support
              </a>
              <hr className="my-1 border-gray-200" />
              <a onClick={handleLogout} className="font-bold items-center gap-2 flex px-3 py-2 text-xs hover:text-red-600 ">
                <RiLogoutCircleLine className='w-5 h-5'/>
                Logout
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Navbar;