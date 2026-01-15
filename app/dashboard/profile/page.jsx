'use client'
import React,{useState, useEffect} from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { auth } from '@/lib/firebase'
import { PiDotsThreeOutlineBold } from 'react-icons/pi'
import toast from 'react-hot-toast'
import ProCard1 from '@/components/ui02/proCard1';
import ProAccount from '@/components/ui02/proAccount';
import ProDoc from '@/components/ui02/proDoc';
import ProPay from '@/components/ui02/proPay';

function pageProfile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (!currentUser) {
      router.replace('/auth')
      return
    }

    setUser(currentUser)
    
    try {
      // Fetch profile data from Firestore
      await fetchProfileData(currentUser.uid)
    } catch (err) {
      setError('Failed to load profile data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  })

    return () => unsubscribe()
  }, [router])

    const fetchProfileData = async (userId) => {
    try {
      const db = getFirestore()
      
      // Try to fetch from verifications collection (where verification data is stored)
      const verificationRef = doc(db, 'verifications', userId)
      const verificationDoc = await getDoc(verificationRef)
      
      if (verificationDoc.exists()) {
        setProfileData(verificationDoc.data())
        return
      }
      
      // If not found in verifications, try users collection
      const userRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists()) {
        setProfileData(userDoc.data())
        return
      }
      
      // If no data found, set empty state
      setProfileData({})
    } catch (err) {
      console.error('Error fetching profile data:', err)
      throw err
    }
  }

  // const handleEditProfile = () => {
  // router.push('/verification')
  // }

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
    <div className='bg-white mb-10 rounded-md p-6 mt-4 shadow-md w-[98%] mx-auto'>
      <h2 className='text-lg font-semibold'>Profile Page</h2>
      <div className='flex flex-row gap-4 my-4'>
        {/* Profile content goes here */}
        <div className="w-1/2 h-96">
          <ProCard1
            user={user}
            profileData={profileData}
          />
        </div>
        <div className="w-2/3 h-auto">
          <ProAccount profileData={profileData}/>
          <ProDoc profileData={profileData}/>
        </div>
        <div className="w-1/2 h-96">
          <ProPay profileData={profileData}/>
        </div>

         {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
export default pageProfile;