"use client"
import React, {useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import UserCard from '@/components/ui01/UserCard'
import CountChart from '@/components/ui01/CountChart'
import AttendanceChart from '@/components/ui01/AttendanceChart'
import FinanceChart from '@/components/ui01/FinanceChart'
import EventCalendar from '@/components/ui01/EventCalendar'
import Announcement from '@/components/ui01/Announcement'
import { PiDotsThreeOutlineBold } from 'react-icons/pi';

function MainDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

   useEffect(() => {
      const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) {
          router.replace('/auth');
          return;
        }

        setUser(currentUser);
        
        const db = getFirestore();
        const verificationRef = doc(db, "verifications", currentUser.uid);
        
        // Real-time listener for verification status
        const unsubscribeVerification = onSnapshot(verificationRef, (docSnapshot) => {
          if (!docSnapshot.exists()) {
            // No verification document exists, redirect to verification
            router.replace('/verification');
            return;
          }

          const data = docSnapshot.data();
          const isVerified = data.isVerified === true;
          
          if (!isVerified) {
            // User is not verified, redirect to verification page
            router.replace('/verification');
          } else {
            // User is verified, allow access
            setLoading(false);
          }
        });

        return () => unsubscribeVerification();
      });

      return () => unsubscribeAuth();
    }, [router]);

   // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
        <div className="text-gray-700 flex items-center">
            Loading<span className='animate-pulse ml-1'><PiDotsThreeOutlineBold className="w-10 h-10 "/></span>
        </div>
      </div>
    );
  }

  return (
    <div className='flex md:flex-row flex-col gap-4 p-4'>
      {/* LEFT */}
       <div className='w-full lg:w-2/3 col-span-2'>
        {/* USER CARD */}
        <div className='flex justify-between gap-4'>
          <UserCard/>
        </div>

        {/* MIDDLE CHART */}
          <div className="flex gap-4 flex-col lg:flex-row mt-10">
            {/* COUNT CHART */}
            <div className='w-full lg:w-1/3 h-[450px] '>
              <CountChart/>
            </div>
            {/* ATTENDANCE CHART */}
            <div className='w-full'>
              <AttendanceChart/>
            </div>
          </div>

        {/* BOTTOM CHART */}
          <div className="w-full h-[500px] mt-10">
            <FinanceChart/>
          </div>
       </div>
       {/* RIGHT */}
       <div className='w-full lg:w-1/3 flex-col gap-8'>
         <EventCalendar/>
         <Announcement />
       </div>
    </div>
  )
}
export default MainDashboard;