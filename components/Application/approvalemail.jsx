"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, sendEmailVerification, onAuthStateChanged, signOut } from "firebase/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/auth");
        return;
      }

      if (currentUser.emailVerified) {
        router.push("/verification");
        return;
      }

      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleResendVerification = async () => {
    if (!user) return;
    
    try {
      setSending(true);
      setError("");
      
      const actionCodeSettings = {
        url: `${window.location.origin}/verification`,
        handleCodeInApp: true
      };
      
      await sendEmailVerification(user, actionCodeSettings);
      
      setSuccess("Verification email sent! Please check your inbox.");
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      setError("Failed to send verification email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      router.push("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-amber-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-amber-900 p-4">
      <div className="w-full max-w-md bg-[#0f0f11]/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Verify Your Email</h1>
        
        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <p className="text-yellow-300 text-sm">
            We've sent a verification email to:
          </p>
          <p className="text-amber-200 font-semibold mt-2 break-all">{user?.email}</p>
        </div>
        
        <p className="text-gray-400 mb-6">
          Please check your inbox and click the verification link to activate your account.
          You won't be able to access the app until your email is verified.
        </p>
        
        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-xl text-green-400 text-sm">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={handleResendVerification}
            disabled={sending}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-xl py-3 transition-colors"
          >
            {sending ? "Sending..." : "Resend Verification Email"}
          </button>
          
          <button
            onClick={() => router.push("/auth")}
            className="w-full bg-transparent border border-white/20 hover:bg-white/5 text-white font-semibold rounded-xl py-3 transition-colors"
          >
            Back to Login
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full bg-transparent border border-red-500/30 hover:bg-red-500/10 text-red-400 font-semibold rounded-xl py-3 transition-colors"
          >
            Sign Out
          </button>
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-gray-500 text-xs text-center">
            Having issues? Check your spam folder or try signing in with a different email.
          </p>
        </div>
      </div>
    </div>
  );
}