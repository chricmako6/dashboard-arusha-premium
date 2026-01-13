"use client"
import React, {useEffect, useState} from 'react'
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Application from '@/components/Application/login'
import { PiDotsThreeOutlineBold } from "react-icons/pi";

function pageAuth() {
  const router = useRouter();
  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWaiting, setShowWaiting] = useState(false); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            if (userData.isVerified === true) {
              router.replace("/auth");
              return;
            } else {
              // Show Firstwait component on this page
              // setShowWaiting(false);
              setCanAccess(true);
              setLoading(false);
              return;
            }
          } else {
            router.replace("/auth");
          }
          
        } catch (error) {
          console.error("Error checking user role:", error);
          router.replace("/auth");
        }
      } else {
        setCanAccess(true);
        // setShowWaiting(false);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <div className="text-gray-700 flex items-center">
          Loading<span className='animate-pulse ml-1'><PiDotsThreeOutlineBold className="w-10 h-10 "/></span>
        </div>
      </div>
    );
  }

  if (showWaiting) {
    // Render Firstwait component directly
    return <Firstwait />;
  }

  // if (!canAccess) {
  //   return null;
  // }

  return (
    <div className='bg-gray-200'>
      <Application />
    </div>
  );
}

export default pageAuth;