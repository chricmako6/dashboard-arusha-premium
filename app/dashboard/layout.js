"use client";
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import Sidebar from "@/components/ui01/Sidebar";
import Navbar from "@/components/ui01/Navbar";
import { auth } from '@/lib/firebase';
import { PiDotsThreeOutlineBold } from 'react-icons/pi';

function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch user profile data from Firestore
        try {
          const db = getFirestore();
          const userDocRef = doc(db, "verifications", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setProfileData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
      } else {
        setUser(null);
        setProfileData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Optional: Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
        <div className="text-gray-700 flex items-center">
          Loading<span className='animate-pulse ml-1'><PiDotsThreeOutlineBold className="w-10 h-10"/></span>
        </div>
      </div>
    )
    }

  return (
    <div className="flex h-full bg-gray-100 text-gray-900">
      <Sidebar />
      <main className="w-[86%] md:w-[92%] lg:w-[84%] bg-[#f7f8fa] overflow-y-scroll">
          <Navbar 
          displayName={user?.displayName || profileData?.firstName || profileData?.profileImage || "User"} 
          user={user}
          profileData={profileData}
        />
        {children}
      </main>
    </div>
  );
}
export default DashboardLayout;