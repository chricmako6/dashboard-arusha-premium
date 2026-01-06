"use client"
import React, {useEffect, useState} from 'react'
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Choose ONE method to get auth
import Application from '@/components/Application/login'

function pageAuth() {
  const router = useRouter();
  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, prevent access
        router.replace("/verification");
      } else {
        // User is not logged in, allow access
        setCanAccess(true);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading || !canAccess) {
    return null; // Show nothing, preventing access
  }

  return (
    <div>
        <Application />
    </div>
  )
}

export default pageAuth