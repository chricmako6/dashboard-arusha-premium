"use client"
import React, {useState, useEffect} from 'react'
import { FaUser, FaCreditCard, FaFileAlt, FaEye } from "react-icons/fa";
import { FiLogOut, FiCheckCircle, FiEdit } from "react-icons/fi";
import { AiOutlineCamera } from "react-icons/ai";
import { TiTick } from "react-icons/ti";
import { CgProfile } from "react-icons/cg";
import { useRouter } from "next/navigation";
import { auth, getFirebaseAuth } from '@/lib/firebase';
import { getAuth, onAuthStateChanged, signOut, updateCurrentUser } from 'firebase/auth';
import toast from 'react-hot-toast';
import Approvalwait from '@/components/Application/approvalwait';
import { doc, getDoc, getFirestore, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { PiDotsThreeOutlineBold } from 'react-icons/pi';
import { MdPayments } from 'react-icons/md';
import { IoDocumentAttachOutline } from 'react-icons/io5';

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
  const [profileImage, setProfileImage] = useState(null);
  const [proofAddressFile, setProofAddressFile] = useState(null);

   // Form data state
  const [formData, setFormData] = useState({
    // User Details
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    dateBirth: "",
    nationality: "",
    mobile: "",
    gender: "",

    
    // Payment Info
    cardType: "",
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    stat: "",
    
    // Documents
    passport: "",
    proofAddress: "",
    doctype: "",
    tin: "",
    nida: "",
    education: "",
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

  // THIS IS FOR UPLOADING AN IMAGE
      const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileImage(reader.result);
          // ALSO update formData
          setFormData(prev => ({
            ...prev,
            profilePicture: reader.result
          }));
        };
        reader.readAsDataURL(file);
      }
    };

    // Add this function to handle document upload
    const handleProofAddressUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        setProofAddressFile(file);
        
        // Update formData with file name or base64 if needed
        setFormData(prev => ({
          ...prev,
          proofAddress: file.name // or you can store as base64 like the profile
        }));
        
        // If you want to store as base64 for preview:
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            proofAddress: reader.result // Store base64 string
          }));
        };
        reader.readAsDataURL(file);
      }
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

  // THIS IS FOR HANDLE LOGOUT
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

      await setDoc(userDocRef, verificationData, { merge: true });
      
      console.log("✅ Data saved to Firestore with isVerified: false");
      return true;
      
    } catch (error) {
      console.error("Firestore save error:", error);
      throw new Error(`Failed to save data: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
  e?.preventDefault();
  setSubmitError("");
  
  try {
    setSubmitting(true);
    console.log("Starting submission process...");
    
    // VALIDATE ALL REQUIRED FIELDS
    const requiredFields = {
      // Personal Info
      username: "Username",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      mobile: "Mobile Number",
      nationality: "Nationality",
      gender: "Gender",
      dateBirth: "Date of Birth",
      
      // Payment Info
      cardType: "Card Type",
      cardholderName: "Card Holder Name",
      cardNumber: "Card Number",
      expiryDate: "Expiry Date",
      stat: "stat",
      
      // Document Info
      tin: "TIN Number",
      nida: "NIDA Number",
      education: "Education Level",
      doctype: "Document Type",
      proofAddress: "Proof of Address"
    };
    
    // Check for missing required fields
    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        missingFields.push(label);
      }
    }
    
    if (missingFields.length > 0) {
      setSubmitError(`Please fill in: ${missingFields.join(', ')}`);
      toast.error(`Missing fields: ${missingFields.join(', ')}`);
      setSubmitting(false);
      return;
    }
    
    console.log("Calling saveToFirestore...");
    await saveToFirestore();
    
    console.log("Submission successful");
    
    // Show success toast
    toast.success('Data has been submitted for verification!');
    
    // Update UI state after delay
    setTimeout(() => {
      setShowForm(false);
      setWaitingForApproval(true);
      setIsVerified(false);

      if (typeof window !== 'undefined') {
        localStorage.setItem('verificationSubmitted', 'true');
        localStorage.setItem('verificationUserId', User?.uid || '');
      }
    }, 1500); // 1.5 second delay
    
  } catch (error) {
    console.error("Submission error:", error);
    setSubmitError(error.message || "Failed to submit verification. Please try again.");
    toast.error('Submission failed. Please try again.');
    // Keep the form visible so user can retry
    setShowForm(true);
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
        <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
          <div className="text-gray-700 flex items-center">
              Loading<span className='animate-pulse ml-1'><PiDotsThreeOutlineBold className="w-10 h-10 "/></span>
          </div>
        </div>
      );
    }

  return (
     <div className="min-h-screen bg-gray-200 p-6 flex flex-col items-center">
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
      <p className="text-sm mb-10">Fill in your information to get started</p>

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
                      ${isCompleted ? "bg-amber-200" : ""}
                      ${isActive ? "bg-amber-200" : ""}
                      ${isPending && step < s.id ? "bg-gray-700" : ""}
                    `}
                  ></div>
                )}

                <div className="text-center">
                  <div
                    className={`
                      w-12 h-12 rounded-full border flex items-center justify-center mx-auto
                      transition-all duration-300
                      ${isCompleted ? "bg-amber-200 border-amber-200" : ""}
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
                  {isCompleted && <span className="text-amber-200 text-xs">Completed</span>}
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
                  {/* Profile Picture */}
                    <div className="text-center border-b-2 pb-6 mb-6">
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          {profileImage ? (
                            <img
                              src={profileImage}
                              alt="Profile"
                              className="w-35 h-35 rounded-full object-cover border-4 border-white shadow-md"
                            />
                          ) : (
                            <CgProfile className="w-35 h-35 rounded-full text-gray-400" />
                          )}
                          <label
                            htmlFor="profile-upload"
                            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition"
                          >
                            <AiOutlineCamera className="w-5 h-5" />
                          </label>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="profile-upload"
                          onChange={handleImageUpload}
                        />
                      </div>
                      <h2 className="my-2 text-md font-bold text-gray-700">Upload Profile Picture</h2>
                    </div>
                  {/* Row 2: Name and Mobile Number */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2">Name</label>
                      <div className="md:flex items-center bg-gray-100 p-1 rounded-xl ring-gray-300 px-2">
                        <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="ml-2 text-black text-xs p-2 w-full border-none bg-transparent focus:outline-none"
                        required
                        placeholder="Enter your name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile number</label>
                      <div className="md:flex items-center bg-gray-100 p-1 rounded-xl ring-gray-300 px-2">
                        <input
                          type="tel"
                          name="mobile" 
                          value={formData.mobile}
                          onChange={handleInputChange}
                          className="ml-2 text-black text-xs p-2 w-full border-none bg-transparent focus:outline-none"
                          required
                          placeholder="Enter mobile number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 3: First Name and Last Name */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                      <div className="md:flex items-center bg-gray-100 p-1 rounded-xl ring-gray-300 px-2">
                        <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                       className="ml-2 text-black text-xs p-2 w-full border-none bg-transparent focus:outline-none"
                        required
                        placeholder="Enter your first name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                      <div className="md:flex items-center bg-gray-100 p-1 rounded-xl ring-gray-300 px-2">
                        <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="ml-2 text-black text-xs p-2 w-full border-none bg-transparent focus:outline-none"
                          required
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Email and Nationality */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <div className="md:flex items-center bg-gray-100 p-1 rounded-xl ring-gray-300 px-2">
                        <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="ml-2 text-black text-xs p-2 w-full border-none bg-transparent focus:outline-none"
                          required
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="flex-start text-sm font-semibold text-gray-700 mb-2">Nationality</label>
                      <div className="md:flex items-center bg-gray-100 p-1 rounded-xl ring-gray-300 px-2">
                        <select
                          name="nationality"
                          value={formData.nationality}
                          onChange={handleInputChange}
                          className="ml-2 text-black text-xs p-2 w-full border-none bg-transparent focus:outline-none"
                          required
                        >
                          <option value="">Select Nationality</option>
                          <option value="Tanzania">Tanzania</option>
                          <option value="Kenya">Kenya</option>
                          <option value="Uganda">Uganda</option>
                          <option value="Congo">Congo</option>
                        </select>
                      </div>
                    </div>
                     <div>
                      <label className="flex-start text-sm font-semibold text-gray-700 mb-2">Date birth</label>
                      <div className="md:flex items-center bg-gray-100 p-1 rounded-xl ring-gray-300 px-2">
                        <input
                        type="date"
                        name="dateBirth"
                        value={formData.dateBirth}
                        onChange={handleInputChange}
                        className="ml-2 text-black text-xs p-2 w-full border-none bg-transparent focus:outline-none"
                          required
                          placeholder="Enter your date of birth"
                        />
                      </div>
                    </div>
                     <div>
                      <label className="flex-start text-sm font-semibold text-gray-700 mb-2">Gender *</label>
                      <div className="md:flex items-center bg-gray-100 p-1 rounded-xl ring-gray-300 px-2">
                       <select
                          name="gender" 
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="ml-2 text-black text-xs p-2 w-full border-none bg-transparent focus:outline-none"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
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
                  <h1 className="text-3xl font-bold text-gray-800">Payment Information</h1>
                </div>

                <form className="space-y-6">
                  {/* Row 1: Gender and Date of Birth */}
                 {/* Profile Picture */}
                  <div className="text-center border-b-2 pb-6 mb-6">
                    <div className="flex flex-col items-center">
                      <MdPayments htmlFor="profile-upload" className="mx-auto cursor-pointer w-55 h-40 my-1.5 text-gray-300" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="profile-upload"
                        />
                    </div>
                    <h2 className="my-2 text-md font-bold text-gray-700">Waiting for your Payment Info</h2>
                  </div>
                  {/* Row 2: Name and Mobile Number */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2">Card holder name</label>
                      <div className="md:flex items-center bg-gray-100 p-1 rounded-xl ring-gray-300 px-2">
                        <input
                        type="text"
                        name="cardholderName"
                        value={formData.cardholderName}
                        onChange={handleInputChange}
                        className="ml-2 text-black text-xs p-2 w-full border-none bg-transparent focus:outline-none"
                        required
                        placeholder="Enter your name"
                        />
                      </div>
                    </div>

                      {/* card type  */}
                     <div>
                       <label className="flex-start text-sm font-semibold text-gray-700 mb-2">Card Type</label>
                       <div className="md:flex items-center bg-gray-100 p-1 rounded-xl ring-gray-300 px-2">
                        <select
                            name="cardType" 
                            value={formData.cardType}
                            onChange={handleInputChange}
                            className="ml-2 text-black text-xs p-2 w-full border-none bg-transparent focus:outline-none"
                            required
                              >
                            <option value="">Select Type</option>
                            <option value="amex">AMEX</option>
                            <option value="visa">VISA</option>
                            <option value="mastercard">MASTERCARD</option>
                          </select>
                      </div>
                     </div>
                   </div>

                  {/* CARD NUMBER, EXPIRE AND STATUS */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* card number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Card number</label>
                      <div className="md:flex items-center bg-gray-100 p-1 rounded-xl ring-gray-300 px-2">
                        <input
                          type="tel"
                          name="cardNumber" 
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className="ml-2 text-black text-xs p-2 w-full border-none bg-transparent focus:outline-none"
                          required
                          placeholder="Enter mobile number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Expire Date</label>
                      <div className="md:flex items-center bg-gray-100 p-1 rounded-xl ring-gray-300 px-2">
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          className="ml-2 text-black text-xs p-2 w-full border-none bg-transparent focus:outline-none"
                          required
                          placeholder="••/••"
                          />
                      </div>
                     </div>
                  </div>

                  {/* status */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="flex-start text-sm font-semibold text-gray-700 mb-2">Status</label>
                      <div className="md:flex items-center bg-gray-100 p-1 rounded-xl ring-gray-300 px-2">
                        <select
                          name="stat"
                          value={formData.stat}
                          onChange={handleInputChange}
                          className="ml-2 text-black text-xs p-2 w-full border-none bg-transparent focus:outline-none"
                          required
                        >
                          <option value="">Select status</option>
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
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
                  <h1 className="text-3xl font-bold text-gray-800">Document Information</h1>
                </div>

                <form className="space-y-6">
                 {/* Profile Picture */}
                  <div className="text-center border-b-2 pb-6 mb-6">
                  <div className="flex flex-col items-center">
                    <label htmlFor="proof-address-upload" className="cursor-pointer">
                      {formData.proofAddress ? (
                        // Show preview if file is uploaded
                        <div className="relative">
                          {/* Check if it's an image or document */}
                          {formData.proofAddress.startsWith('data:image/') ? (
                            // Image preview
                            <img 
                              src={formData.proofAddress} 
                              alt="Proof of Address" 
                              className="w-35 h-35 object-cover rounded-lg border border-gray-300 shadow-sm"
                            />
                          ) : (
                            // Document preview (showing file icon)
                            <div className="w-35 h-35 bg-yellow-50 rounded-lg border border-yellow-200 flex flex-col items-center justify-center p-4">
                              <IoDocumentAttachOutline className="text-blue-500 w-16 h-16 mb-2" />
                              <span className="text-xs text-gray-600 truncate max-w-full px-2">
                                {proofAddressFile?.name || "Document uploaded"}
                              </span>
                            </div>
                          )}
                          {/* Change/Upload overlay */}
                          <div className="absolute inset-0 bg-black  rounded-lg transition-all duration-200 flex items-center justify-center">
                            <AiOutlineCamera className="text-white text-2xl opacity-0 hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ) : (
                        // Default upload icon
                        <div className="w-45 h-35 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                          <IoDocumentAttachOutline className="text-gray-400 w-20 h-20 mb-2" />
                          <p className="text-xs text-gray-500">Click to upload</p>
                          <p className="text-xs text-gray-400">(JPG, PNG, PDF, DOC)</p>
                        </div>
                      )}
                    </label>
                    
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.txt" // Accept both images and documents
                      className="hidden"
                      id="proof-address-upload"
                      onChange={handleProofAddressUpload}
                    />
                  </div>
                  
                  <h2 className="my-2 text-md font-bold text-gray-700">Upload Proof of Address</h2>
                  
                  {/* File info display */}
                  {proofAddressFile && (
                    <div className="mt-2 p-2 bg-green-50 rounded-lg">
                      <span className="text-xs text-green-700 flex items-center justify-center gap-1">
                        <FiCheckCircle className="text-green-500" />
                        Uploaded: {proofAddressFile.name}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Size: {(proofAddressFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  )}
                </div>
                  {/* Row 2: Name and Mobile Number */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2">TIN</label>
                      <div className="md:flex items-center bg-gray-100 p-1 rounded-xl ring-gray-300 px-2">
                        <input
                        type="tel"
                        name="tin"
                        value={formData.tin}
                        onChange={handleInputChange}
                        className="ml-2 text-black text-xs p-2 w-full border-none bg-transparent focus:outline-none"
                        required
                        placeholder="Enter TIN number"
                        />
                      </div>
                     </div>

                     
                      {/* status */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="flex-start text-sm font-semibold text-gray-700 mb-2">Level of Education</label>
                          <div className="md:flex items-center bg-gray-100 p-1 rounded-xl ring-gray-300 px-2">
                            <select
                              name="education"
                              value={formData.education}
                              onChange={handleInputChange}
                              className="ml-2 text-black text-xs p-2 w-full border-none bg-transparent focus:outline-none"
                              required
                            >
                              <option value="">Select Level</option>
                              <option value="primary">Primary</option>
                              <option value="secondary">Secondary</option>
                              <option value="high level">High Level</option>
                              <option value="diploma">Diploma</option>
                              <option value="bachelor">Bachelor's Degree</option>
                              <option value="master">Master's Degree</option>
                              <option value="doctorate">Doctorate</option>
                            </select>
                          </div>
                        </div>

                        {/* document type */}
                        <div>
                          <label className="flex-start text-sm font-semibold text-gray-700 mb-2">Document type</label>
                          <div className="md:flex items-center bg-gray-100 p-1 rounded-xl ring-gray-300 px-2">
                            <select
                              name="doctype"
                              value={formData.doctype}
                              onChange={handleInputChange}
                              className="ml-2 text-black text-xs p-2 w-full border-none bg-transparent focus:outline-none"
                              required
                            >
                              <option value="">Select document</option>
                              <option value="id or passport">ID or Passport</option>
                              <option value="proof address">Proof of address</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* card number */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">NIDA</label>
                        <div className="md:flex items-center bg-gray-100 p-1 rounded-xl ring-gray-300 px-2">
                          <input
                            type="tel"
                            name="nida" 
                            value={formData.nida}
                            onChange={handleInputChange}
                            className="ml-2 text-black text-xs p-2 w-full border-none bg-transparent focus:outline-none"
                            required
                            placeholder="Enter NIDA number"
                          />
                        </div>
                      </div>
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
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaUser className="text-blue-600" />
                        Personal Information
                      </h2>
                      <button 
                        onClick={() => handleEditSection('user')}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <FiEdit />
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Profile Picture Section */}
                      <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                        <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center">
                          {formData.profilePicture ? (
                            <img 
                              src={formData.profilePicture} 
                              alt="Profile" 
                              className="w-40 h-40 rounded-full object-cover"
                            />
                          ) : (
                            <FaUser className="text-gray-400 w-10 h-10" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Profile Picture</p>
                          <p className="text-sm text-gray-700">
                            {formData.profilePicture ? "Uploaded" : <span className="bg-red-100 text-red-800 p-1 rounded-full text-xs">Not uploaded</span>}
                          </p>
                        </div>
                      </div>
                      
                      {/* Username Section */}
                      <div className="pb-4 border-b border-gray-100">
                        <div className="flex">
                          <p className="text-sm text-gray-500">Username</p>
                          <span className="text-gray-800 font-medium flex-end ml-5">
                            {formData.username || "Not provided"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Main Information Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <div className="pb-3 border-b border-gray-100 flex justify-between">
                            <p className="text-sm text-gray-500 mb-1">First Name</p>
                            <p className="text-gray-800 font-medium">
                              {formData.firstName || "Not provided"}
                            </p>
                          </div>
                          
                          <div className="pb-3 border-b border-gray-100 flex justify-between">
                            <p className="text-sm text-gray-500 mb-1">Last Name</p>
                            <p className="text-gray-800 font-medium">
                              {formData.lastName || "Not provided"}
                            </p>
                          </div>
                          
                          <div className="pb-3 border-b border-gray-100 flex justify-between">
                            <p className="text-sm text-gray-500 mb-1">Email</p>
                            <p className="text-gray-800 font-medium truncate w-[160px]">
                              {formData.email || "Not provided"}
                            </p>
                          </div>
                        </div>
                        
                        {/* Right Column */}
                        <div className="space-y-4">
                          <div className="pb-3 border-b border-gray-100 flex justify-between">
                            <p className="text-sm text-gray-500 mb-1">Mobile</p>
                            <p className="text-gray-800 font-medium">
                              {formData.mobile || "Not provided"}
                            </p>
                          </div>
                          
                          <div className="pb-3 border-b border-gray-100 flex justify-between">
                            <p className="text-sm text-gray-500 mb-1">Nationality</p>
                            <p className="text-gray-800 font-medium">
                              {formData.nationality || "Not provided"}
                            </p>
                          </div>
                          
                          <div className="pb-3 border-b border-gray-100 flex justify-between">
                            <p className="text-sm text-gray-500 mb-1">Gender</p>
                            <p className="text-gray-800 font-medium">
                              {formData.gender || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info Preview Card */}
                  <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaCreditCard className="text-green-600" />
                        Payment Information
                      </h2>
                      <button 
                        onClick={() => handleEditSection('payment')}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <FiEdit />
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Card Details Section */}
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                            {formData.cardType ? (
                              <span className="text-xs text-white font-bold">
                                {formData.cardType === 'visa' ? 'VISA' : 
                                formData.cardType === 'mastercard' ? 'MC' : 
                                formData.cardType === 'amex' ? 'AMEX' : 'CARD'}
                              </span>
                            ) : (
                              <FaCreditCard className="text-white text-xs" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Primary Card</p>
                            <p className="font-medium text-gray-800">
                              {formData.cardNumber ? `•••• •••• •••• ${formData.cardNumber.slice(-4)}` : "No card on file"}
                            </p>
                          </div>

                            <div className="h-8 w-px bg-gray-300"/>
                            <div className="flex flex-wrap items-center gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Card holder Name</p>
                                <p className="font-medium text-gray-800">
                                  {formData.cardholderName || "Not provided"}
                                </p>
                              </div>
                            </div>
                            <div className="h-8 w-px bg-gray-300"/>
                           <div className="flex flex-wrap items-center gap-4">
                             <div>
                              <p className="text-sm text-gray-500">Expiry Date</p>
                              <p className="font-medium text-gray-800">
                                {formData.expiryDate || "Not provided"}
                              </p>
                            </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents Preview Card */}
                  <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaFileAlt className="text-purple-600" />
                        Document Information
                      </h2>
                      <button 
                        onClick={() => handleEditSection('document')}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <FiEdit />
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Document Header Section */}
                      <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-3 mb-4">
                          {/* Document Icon with Hover Preview */}
                          <div className="relative group">
                            
                            {/* Hover Tooltip - Now shows actual document preview */}
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-all duration-200 transform group-hover:translate-x-0 translate-x-2 z-50">
                              <div className="bg-gray-800 rounded-lg p-2 shadow-2xl border border-gray-700">
                                {/* Document Preview */}
                                {formData.proofAddress ? (
                                  <div className="max-w-xs">
                                    {/* Check if it's an image */}
                                    {formData.proofAddress.startsWith('data:image/') ? (
                                      <div>
                                        <div className="font-semibold text-amber-100 text-xs mb-1">Document Preview:</div>
                                        <div className="bg-black/50 p-1 rounded">
                                          <img 
                                            src={formData.proofAddress} 
                                            alt="Document Preview" 
                                            className="w-full max-w-[240px] h-auto max-h-[160px] object-contain rounded"
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='160' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'%3E%3C/path%3E%3Cpolyline points='14 2 14 8 20 8'%3E%3C/polyline%3E%3Cline x1='16' y1='13' x2='8' y2='13'%3E%3C/line%3E%3Cline x1='16' y1='17' x2='8' y2='17'%3E%3C/line%3E%3Cpolyline points='10 9 9 9 8 9'%3E%3C/polyline%3E%3C/svg%3E";
                                            }}
                                          />
                                        </div>
                                        <div className="mt-1 text-xs text-gray-300 flex items-center justify-between">
                                          <span className="flex items-center gap-1">
                                            <FiCheckCircle className="text-green-400" />
                                            {formData.doctype || "Document"}
                                          </span>
                                          {proofAddressFile && (
                                            <span className="text-gray-400">
                                              {(proofAddressFile.size / 1024).toFixed(2)} KB
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      /* If it's not an image, show document icon with info */
                                      <div className="flex flex-col items-center p-3">
                                        <IoDocumentAttachOutline className="text-blue-400 w-12 h-12 mb-2" />
                                        <div className="font-semibold text-amber-100 text-sm">Document Uploaded</div>
                                        <div className="text-xs text-gray-300 text-center mt-1">
                                          {formData.doctype || "Document Type"}
                                        </div>
                                        {proofAddressFile && (
                                          <div className="text-xs text-gray-400 mt-2">
                                            File: {proofAddressFile.name}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="p-3 text-center">
                                    <div className="text-red-300 text-sm">No document uploaded</div>
                                  </div>
                                )}
                                
                                {/* Tooltip arrow */}
                                <div className="absolute right-full top-1/2 -translate-y-1/2">
                                  <div className="w-0 h-0 border-t-4 border-b-4 border-l-0 border-r-4 border-r-gray-800 border-t-transparent border-b-transparent"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Document Type</p>
                                <p className="font-medium text-gray-800 text-lg">
                                  {formData.doctype || "Not specified"}
                                </p>
                              </div>
                              <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
                              <div>
                                <p className="text-sm text-gray-500">TIN</p>
                                <p className="font-medium text-gray-800 font-mono">
                                  {formData.nida || "Not provided"}
                                </p>
                              </div>
                              <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
                              <div>
                                <p className="text-sm text-gray-500">NIDA</p>
                                <p className="font-medium text-gray-800 font-mono">
                                  {formData.tin || "Not provided"}
                                </p>
                              </div>
                              <div className="h-8 w-px bg-gray-300"/>
                              <div>
                                <p className="text-sm text-gray-500">Education</p>
                                <p className="font-medium text-gray-800 font-mono">
                                  {formData.education || "Not provided"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Document Preview Section (if document is uploaded) */}
                        {formData.proofAddress && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Document Preview:</p>
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                              {formData.proofAddress.startsWith('data:image/') ? (
                                /* Image Preview */
                                <div className="flex flex-col items-center">
                                  <div className="relative bg-white p-2 rounded border border-gray-300 shadow-sm">
                                    <img 
                                      src={formData.proofAddress} 
                                      alt="Uploaded Document" 
                                      className="max-w-full h-auto max-h-[200px] object-contain"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'%3E%3C/path%3E%3Cpolyline points='14 2 14 8 20 8'%3E%3C/polyline%3E%3Cline x1='16' y1='13' x2='8' y2='13'%3E%3C/line%3E%3Cline x1='16' y1='17' x2='8' y2='17'%3E%3C/line%3E%3Cpolyline points='10 9 9 9 8 9'%3E%3C/polyline%3E%3C/svg%3E";
                                      }}
                                    />
                                  </div>
                                  <div className="mt-2 flex items-center gap-2">
                                    <div className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                                      <FiCheckCircle className="text-xs" />
                                      Image Document Uploaded
                                    </div>
                                    {proofAddressFile && (
                                      <div className="text-xs text-gray-500">
                                        Size: {(proofAddressFile.size / 1024).toFixed(2)} KB
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                /* Non-image Document Preview */
                                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <IoDocumentAttachOutline className="text-white w-8 h-8" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-800">Document Uploaded</p>
                                    <p className="text-sm text-gray-600">
                                      Type: {formData.doctype || "Document"}
                                    </p>
                                    {proofAddressFile && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        File: {proofAddressFile.name} • {(proofAddressFile.size / 1024).toFixed(2)} KB
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                                    <FiCheckCircle className="inline mr-1" />
                                    Ready
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mb-8">
                  <button
                      type="button"
                      onClick={(e) => {
                        handleSubmit(e);
                      }}
                      disabled={submitting || waitingForApproval}
                      className="flex-1 cursor-pointer bg-gradient-to-r from-amber-200 to-amber-300 hover:from-amber-500 hover:to-amber-500 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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