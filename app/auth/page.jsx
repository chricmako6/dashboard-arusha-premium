"use client"
import React, {useEffect, useState} from 'react'
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import Application from '@/components/Application/login'
import { PiDotsThreeOutlineBold } from "react-icons/pi";

function pageAuth() {
  const router = useRouter();
   const searchParams = useSearchParams();
  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  // const [showWaiting, setShowWaiting] = useState(false); 

   useEffect(() => {
    // Check for email verification callback
    const verified = searchParams.get('verified');
    if (verified === 'true') {
      handleEmailVerificationCallback();
    }
  }, [searchParams]);

  const handleEmailVerificationCallback = async () => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          // Update Firestore
          const db = getFirestore();
          await setDoc(doc(db, "users", auth.currentUser.uid), {
            emailVerified: true,
            status: "verified",
            lastLogin: new Date()
          }, { merge: true });
          
          setEmailVerified(true);
          router.replace("/verification");
        }
      } catch (error) {
        console.error("Error handling verification callback:", error);
      }
    }
  };

 useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await user.reload(); // Refresh user data to get latest emailVerified status
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // User signed up with email/password and needs verification
            if (userData.provider === "email" && !user.emailVerified) {
              // setShowWaiting(true); 
              setCanAccess(false);
              setLoading(false);
              return;
            }
            
            // User is verified (either email verified or social login)
            if (user.emailVerified || userData.emailVerified === true || userData.provider !== "email") {
              // Ensure Firestore is updated
              if (!userData.emailVerified && user.emailVerified) {
                await setDoc(doc(db, "users", user.uid), {
                  emailVerified: true,
                  status: "verified"
                }, { merge: true });
              }
              
              router.replace("/verification");
              return;
            }
            
            // User exists but status is not verified
            setShowWaiting(true);
            setCanAccess(true);
            setLoading(false);
          } else {
            router.replace("/auth");
          }
          
        } catch (error) {
          console.error("Error checking user role:", error);
          router.replace("/auth");
        }
      } else {
        setCanAccess(true);
        setLoading(false);
      }
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

  // if (showWaiting) {
  //   // Render Firstwait component directly
  //   return <Firstwait />;
  // }

  return (
    <div className='bg-gray-200'>
      <Application />
    </div>
  );
}

export default pageAuth;