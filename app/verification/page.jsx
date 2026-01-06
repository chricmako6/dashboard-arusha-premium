"use client"
import React, {useState, useEffect} from 'react'
import { FaUser, FaCreditCard, FaFileAlt, FaEye } from "react-icons/fa";
import { FiLogOut, FiCheckCircle, FiEdit2 } from "react-icons/fi";
import { TiTick } from "react-icons/ti";
import { useRouter } from "next/navigation";
import { auth, getFirebaseAuth } from '@/lib/firebase';
import { getAuth, onAuthStateChanged, signOut, updateCurrentUser } from 'firebase/auth';
import toast from 'react-hot-toast';
import Approvalwait from '@/components/Application/approvalwait';
import { doc, getDoc, getFirestore, onSnapshot, serverTimestamp } from 'firebase/firestore';

function pageVerification() {
  const router = useRouter(); 
  const [step, setStep] = useState(1);
  const [isApproved, setIsApproved] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [User, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [canAccess, setCanAccess] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isVerified, setIsVerified] = useState(false);

   // Form data state
  const [formData, setFormData] = useState({
    // User Details
    gender: "",
    dateOfBirth: "",
    identifyCode: "",
    hometown: "",
    nationality: "",
    religion: "",
    language: "",
    maritalStatus: "",
    
    // Payment Info
    cardholderName: "",
    cardType: "",
    cardNumber: "",
    expiryDate: "",
    bankName: "",
    accountType: "",
    paymentMethod: "",
    currency: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZipCode: "",
    
    // Documents
    documentType: "",
    documentNumber: "",
    issueDate: "",
    docExpiryDate: "",
    issuingAuthority: "",
    issuingCountry: "",
    placeOfIssue: "",
    documentStatus: "",
    fullName: "",
    docDateOfBirth: "",
    documentNotes: ""
  });

 // 🔐 AUTH GUARD with Verification Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/auth");
        return;
      }

      try {
        // Set user immediately for UI
        setUser(currentUser);
        
        // Check if verification exists
        const verificationData = await checkExistingVerification(currentUser.uid);
        
        if (verificationData) {
          // User has verification data
          if (verificationData.isVerified === true) {
            // User is verified, redirect to dashboard
            router.replace("/dashboard");
            return;
          } else if (verificationData.status === "pending" || verificationData.isVerified === false) {
            // User is not verified, show approval wait
            setWaitingForApproval(true);
            setShowForm(false);
            setIsVerified(false);
          }
        }
        
        setCanAccess(true);
      } catch (err) {
        console.warn("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

    // Real-time listener for verification status changes
    useEffect(() => {
    if (!User?.uid) return;
    const db = getFirestore();
      const verificationRef = doc(db, "verifications", User.uid);
      
      const unsubscribe = onSnapshot(verificationRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const verified = data.isVerified === true;
          
          setIsVerified(verified);
          
          if (verified) {
            // User is now verified, redirect to dashboard
            router.replace("/dashboard");
          }
        }
      });

      return () => unsubscribe();
    }, [User?.uid, router]);

  // Prevent background scrolling when overlays are shown
  useEffect(() => {
    const locked = showEmailPrompt || waitingForApproval;
    if (typeof window !== "undefined") {
      document.body.style.overflow = locked ? "hidden" : "";
    }
    return () => {
      if (typeof window !== "undefined") document.body.style.overflow = "";
    };
  }, [showEmailPrompt, waitingForApproval]);

  useEffect(() => {
  // Check localStorage for existing submission
  if (typeof window !== 'undefined') {
    const submitted = localStorage.getItem('verificationSubmitted');
    const storedUserId = localStorage.getItem('verificationUserId');
    
    if (submitted === 'true' && storedUserId === User?.uid) {
      setWaitingForApproval(true);
      setShowForm(false);
    }
  }
}, [User]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

    const steps = [
    { id: 1, title: "User Details", icon: FaUser },
    { id: 2, title: "Payment Info", icon: FaCreditCard },
    { id: 3, title: "Documents", icon: FaFileAlt },
    { id: 4, title: "Preview", icon: FaEye },
  ];

  const nextStep = () => step < 4 && setStep(step + 1);
  const prevStep = () => step > 1 && setStep(step - 1);

  const initials = User?.displayName
  ? User.displayName
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
  : User?.email.charAt(0).toUpperCase() || "U";

const checkExistingVerification = async (userId) => {
    try {
      const db = getFirestore();
      const verificationRef = doc(db, "verifications", userId);
      const verificationDoc = await getDoc(verificationRef);
      
      if (verificationDoc.exists()) {
        const data = verificationDoc.data();
        return {
          ...data,
          isVerified: data.isVerified || false // Default to false if not set
        };
      }
      return null;
    } catch (error) {
      console.error("Error checking existing verification:", error);
      return null;
    }
  };

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

 const saveToFirestore = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No user is logged in");
      }

      const db = getFirestore();
      const userDocRef = doc(db, "verifications", currentUser.uid);
      
      // Prepare the data to save with isVerified defaulting to false
      const verificationData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userDisplayName: currentUser.displayName || "",
        ...formData,
        isVerified: false, 
        status: "pending",
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await getDoc(userDocRef, verificationData, { merge: true });
      
      console.log("✅ Data saved to Firestore with isVerified: false");
      return true;
      
    } catch (error) {
      console.error("❌ Firestore save error:", error);
      throw new Error(`Failed to save data: ${error.message}`);
    }
  };

 const handleSubmit = async (e) => {
    e?.preventDefault();
    setSubmitError("");
    
    try {
      setSubmitting(true);
      console.log("Starting submission process...");
      console.log("Form data submitted:", formData);
      
      // Validate form data
      if (!formData.identifyCode) {
        setSubmitError("Please fill in required User Details");
        setSubmitting(false);
        return;
      }
      
      if (!formData.documentNumber) {
        setSubmitError("Please fill in Document Number");
        setSubmitting(false);
        return;
      }
      
      console.log("Calling saveToFirestore...");
      await saveToFirestore();
      
      console.log("Submission successful");
      
      // Update UI state
      setShowForm(false);
      setWaitingForApproval(true);
      setIsVerified(false);

       if (typeof window !== 'undefined') {
      localStorage.setItem('verificationSubmitted', 'true');
      localStorage.setItem('verificationUserId', User?.uid || '');
    }
      
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError(error.message || "Failed to submit verification. Please try again.");
      // Keep the form visible so user can retry
      setShowForm(false);
      setWaitingForApproval(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSection = (section) => {
    switch(section) {
      case 'user':
        setStep(1);
        break;
      case 'payment':
        setStep(2);
        break;
      case 'document':
        setStep(3);
        break;
      default:
        break;
    }
  };

   // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-black to-amber-200 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
     <div className="min-h-screen bg-linear-to-br from-black to-amber-200 p-6 flex flex-col items-center">
      {/* Top Profile Card */}
      <div className="w-full max-w-3xl bg-[#111118]/70 backdrop-blur-xl p-5 rounded-xl shadow-2xl border border-white/10 mb-10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center text-xl font-bold">
              {initials}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
               {User?.displayName || "User"}
            </h2>
            <p className="text-white text-sm">
               {User?.email || "No email"}
            </p>
          </div>
          <div className="grow flex justify-end">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-2 rounded-full text-white/90 hover:text-black hover:bg-yellow-100"
            >
              <FiLogOut className="size-5"/>
            </button>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-semibold mb-2">Complete Your Profile</h1>
      <p className="text-gray-400 text-sm mb-10">Fill in your information to get started</p>

      {/* WAITING FOR APPROVAL OVERLAY isVerified is true */}
      {waitingForApproval && !isVerified && (
       <div className='fixed inset-0 z-50 backdrop-blur-xl'>
         <div className="fixed top-48 left-1/2 transform -translate-x-1/2 z-9999 backdrop-blur-sm flex items-center justify-center">
          <Approvalwait/>
        </div>
       </div>
      )}

      {/* Steps Card */}
      <div className="w-full max-w-3xl bg-[#111118]/60 backdrop-blur-xl p-10 rounded-2xl shadow-xl border border-white/10">
        {/* Step Navigation With Progress Lines */}
        <div className="flex items-center justify-between mb-10 relative w-full">
          {steps.map((s, index) => {
            const isCompleted = step > s.id;
            const isActive = step === s.id;
            const isPending = step < s.id;

            return (
              <div key={s.id} className="flex items-center relative">
                {index !== 0 && (
                  <div
                    className={`
                      h-1 w-24 mx-4 rounded-full transition-all duration-300
                      ${isCompleted ? "bg-green-400" : ""}
                      ${isActive ? "bg-green-400" : ""}
                      ${isPending && step < s.id ? "bg-gray-700" : ""}
                    `}
                  ></div>
                )}

                <div className="text-center">
                  <div
                    className={`
                      w-12 h-12 rounded-full border flex items-center justify-center mx-auto
                      transition-all duration-300
                      ${isCompleted ? "bg-green-500 border-green-400" : ""}
                      ${isActive ? "border-white bg-white/10" : ""}
                      ${isPending ? "border-white/10 bg-white/5" : ""}
                    `}
                  >
                    {isCompleted ? (
                      <span className="text-white text-xl w-5 h-5">
                        <TiTick />
                      </span>
                    ) : (
                      <s.icon className="text-sm text-gray-300 w-5 h-5" />
                    )}
                  </div>

                  <p className="mt-2 text-sm">step {s.id}</p>
                  <p className="text-sm">{s.title}</p>

                  {isActive && <span className="text-blue-400 text-xs">In Progress</span>}
                  {isPending && <span className="text-gray-500 text-xs">Pending</span>}
                  {isCompleted && <span className="text-green-400 text-xs">Completed</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="text-center text-gray-300 mb-10">
          {/* USER DETAILS */}
          {step === 1 && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800">Edit Personal Information</h1>
                </div>

                <form className="space-y-6">
                  {/* Row 1: Gender and Date of Birth */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                      <input
                        type="text"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date of birth</label>
                      <input
                        type="text"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Row 2: Identify Code and Hometown */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Identify code *</label>
                      <input
                        type="tel"
                        name="identifyCode"
                        value={formData.identifyCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Hometown</label>
                      <input
                        type="text"
                        name="hometown"
                        value={formData.hometown}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Row 3: Nationality and Religion */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nationality</label>
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Religion</label>
                      <input
                        type="text"
                        name="religion"
                        value={formData.religion}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Row 4: Language and Marital Status */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                      <input
                        type="text"
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Marital status</label>
                      <input
                        type="text"
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* PAYMENT INFO */}
          {step === 2 && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800">Edit Payment Information</h1>
                </div>

                <form className="space-y-6">
                  {/* Row 1: Cardholder Name and Card Type */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        name="cardholderName"
                        value={formData.cardholderName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Card Type</label>
                      <input
                        type="text"
                        name="cardType"
                        value={formData.cardType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Row 2: Card Number and Expiry Date */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Row 3: Bank Name and Account Type */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Name</label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
                      <input
                        type="text"
                        name="accountType"
                        value={formData.accountType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Row 4: Payment Method and Currency */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                      <input
                        type="text"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
                      <input
                        type="text"
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Billing Address</label>
                  </div>

                  {/* Row 5: City, State, Zip Code */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        name="billingCity"
                        value={formData.billingCity}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        name="billingState"
                        value={formData.billingState}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Zip Code</label>
                      <input
                        type="text"
                        name="billingZipCode"
                        value={formData.billingZipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* DOCUMENTS */}
          {step === 3 && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800">Edit Document Information</h1>
                </div>

                <form className="space-y-6">
                  {/* Row 1: Document Type and Document Number */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Document Type</label>
                      <input
                        type="text"
                        name="documentType"
                        value={formData.documentType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Document Number *</label>
                      <input
                        type="text"
                        name="documentNumber"
                        value={formData.documentNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 2: Issue Date and Expiry Date */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Issue Date</label>
                      <input
                        type="text"
                        name="issueDate"
                        value={formData.issueDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        name="docExpiryDate"
                        value={formData.docExpiryDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Row 3: Issuing Authority and Country */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Issuing Authority</label>
                      <input
                        type="text"
                        name="issuingAuthority"
                        value={formData.issuingAuthority}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Issuing Country</label>
                      <input
                        type="text"
                        name="issuingCountry"
                        value={formData.issuingCountry}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Row 4: Place of Issue and Document Status */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Place of Issue</label>
                      <input
                        type="text"
                        name="placeOfIssue"
                        value={formData.placeOfIssue}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Document Status</label>
                      <input
                        type="text"
                        name="documentStatus"
                        value={formData.documentStatus}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Row 5: Full Name and Date of Birth */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="text"
                        name="docDateOfBirth"
                        value={formData.docDateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Document Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Document Notes</label>
                    <textarea
                      name="documentNotes"
                      value={formData.documentNotes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* PREVIEW PAGE */}
          {step === 4 && (
            <>
              {showForm && (
                <div className="max-w-5xl mx-auto">
                  {/* Header */}
                  <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Verification Preview</h1>
                    <p className="text-gray-600">Review all information before final submission</p>
                  </div>
          
                  {/* User Details Preview Card */}
                  <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaUser className="text-blue-600" />
                        Personal Information
                      </h2>
                      <button 
                        onClick={() => handleEditSection('user')}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <FiEdit2 /> Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="font-medium">{formData.gender || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium">{formData.dateOfBirth || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ID Code</p>
                        <p className="font-medium">{formData.identifyCode || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Hometown</p>
                        <p className="font-medium">{formData.hometown || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nationality</p>
                        <p className="font-medium">{formData.nationality || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Religion</p>
                        <p className="font-medium">{formData.religion || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Language</p>
                        <p className="font-medium">{formData.language || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Marital Status</p>
                        <p className="font-medium">{formData.maritalStatus || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
          
                  {/* Payment Info Preview Card */}
                  <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaCreditCard className="text-green-600" />
                        Payment Information
                      </h2>
                      <button 
                        onClick={() => handleEditSection('payment')}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <FiEdit2 /> Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Cardholder Name</p>
                        <p className="font-medium">{formData.cardholderName || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Card Type</p>
                        <p className="font-medium">{formData.cardType || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Card Number</p>
                        <p className="font-medium">{formData.cardNumber ? `****${formData.cardNumber.slice(-4)}` : "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expiry Date</p>
                        <p className="font-medium">{formData.expiryDate || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bank Name</p>
                        <p className="font-medium">{formData.bankName || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Account Type</p>
                        <p className="font-medium">{formData.accountType || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-medium">{formData.paymentMethod || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Currency</p>
                        <p className="font-medium">{formData.currency || "Not provided"}</p>
                      </div>
                      <div className="md:col-span-3">
                        <p className="text-sm text-gray-500">Billing Address</p>
                        <p className="font-medium">
                          {formData.billingAddress ? `${formData.billingAddress}, ${formData.billingCity}, ${formData.billingState} ${formData.billingZipCode}` : "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
          
                  {/* Documents Preview Card */}
                  <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaFileAlt className="text-purple-600" />
                        Document Information
                      </h2>
                      <button 
                        onClick={() => handleEditSection('document')}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <FiEdit2 /> Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Document Type</p>
                        <p className="font-medium">{formData.documentType || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Document Number</p>
                        <p className="font-medium">{formData.documentNumber || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Issue Date</p>
                        <p className="font-medium">{formData.issueDate || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expiry Date</p>
                        <p className="font-medium">{formData.docExpiryDate || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Issuing Authority</p>
                        <p className="font-medium">{formData.issuingAuthority || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Issuing Country</p>
                        <p className="font-medium">{formData.issuingCountry || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Place of Issue</p>
                        <p className="font-medium">{formData.placeOfIssue || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Document Status</p>
                        <p className="font-medium">{formData.documentStatus || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{formData.fullName || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium">{formData.docDateOfBirth || "Not provided"}</p>
                      </div>
                      <div className="md:col-span-3">
                        <p className="text-sm text-gray-500">Document Notes</p>
                        <p className="font-medium">{formData.documentNotes || "No notes provided"}</p>
                      </div>
                    </div>
                  </div>
          
                  {/* Action Buttons */}
                  <div className="flex gap-4 mb-8">
                   <button
                      type="button"
                      onClick={() => {
                        // Check validation before calling handleSubmit
                        if (!formData.identifyCode || !formData.documentNumber) {
                          toast.error('You can`t submit empty fields. Please fill all required fields!');
                          return;
                        }
                        
                        handleSubmit();
                        
                        // Show success toast after submission
                        setTimeout(() => {
                          if (!submitting && !waitingForApproval && !submitError) {
                            if (isApproved) {
                              toast.success('Verification Complete!');
                            } else {
                              toast.success('Data has been submitted for verification!');
                            }
                          }
                        }, 120);
                      }}
                      disabled={submitting || waitingForApproval}
                      className="flex-1 bg-linear-to-r from-amber-200 to-amber-300 hover:from-amber-500 hover:to-amber-500 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FiCheckCircle size={20} />
                          {waitingForApproval ? 'Waiting for Approval' : isApproved ? 'Verified & Wait for Approval' : 'Submit for Verification'}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition"
                    >
                      Go Back
                    </button>
                  </div>
          
                  {/* Footer Note */}
                  <div className="bg-amber-50 border-l-4 border-amber-200 p-4 rounded">
                    <p className="text-sm text-amber-300">
                      Please review all information carefully. Click on the edit button next to each section to make corrections.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`cursor-pointer px-6 py-2 rounded-xl border border-white/20 ${
              step === 1
                ? "text-gray-600 border-gray-800"
                : "hover:bg-white/10"
            }`}
          >
            Previous
          </button>

          <button
            onClick={nextStep}
            disabled={step === 4}
            className={`cursor-pointer px-6 py-2 rounded-xl bg-white/10 border border-white/20 ${
              step === 4 ? "opacity-30" : "hover:bg-white/20"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default pageVerification