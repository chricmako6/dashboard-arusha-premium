"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { PiDotsThreeOutlineBold } from "react-icons/pi";

function Firstwait() {
  const router = useRouter();
  const [message, setMessage] = useState("Verifying your email...");
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if email is verified
        await user.reload();
        
        if (user.emailVerified) {
          // Check Firestore status
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Update Firestore with email verification status
            if (!userData.emailVerified || userData.status === "pending_verification") {
              // This should be updated when email verification link is clicked
              // We'll handle this in the auth page logic
              router.refresh(); // Refresh to trigger auth check
            }
          }
        } else {
          setMessage("Please check your email and click the verification link.");
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    
    try {
      await sendVerificationEmail(auth.currentUser);
      setMessage("Verification email resent! Please check your inbox.");
      setCountdown(30);
      setCanResend(false);
    } catch (error) {
      console.error("Error resending verification:", error);
      setMessage("Failed to resend email. Please try again.");
    }
  };

  return (
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-amber-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Verify Your Email
          </h2>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          <div className="flex items-center justify-center mb-6">
            <PiDotsThreeOutlineBold className="w-10 h-10 text-amber-500 animate-pulse" />
          </div>
          
          <div className="bg-amber-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> Check your spam folder if you don't see the email.
              The verification link will expire in 24 hours.
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => router.refresh()}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              I've Verified My Email
            </button>
            
            <button
              onClick={handleResendVerification}
              disabled={!canResend}
              className={`w-full border border-amber-500 font-medium py-3 px-4 rounded-lg transition-colors ${
                canResend 
                  ? 'text-amber-600 hover:bg-amber-50' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              {canResend ? 'Resend Verification Email' : `Resend in ${countdown}s`}
            </button>
            
            <button
              onClick={() => {
                auth.signOut();
                router.push('/auth');
              }}
              className="w-full text-gray-600 hover:text-gray-800 font-medium py-2"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    
  );
}

export default Firstwait;