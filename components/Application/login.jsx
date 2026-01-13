"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

function Login() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("signup");
  const [nameInput, setNameInput] = useState("");
  const [emailSignUp, setEmailSignUp] = useState("");
  const [passwordSignUp, setPasswordSignUp] = useState("");
  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");
  const [isLoading, setIsLoading] = useState(false); // FIXED: Changed to setIsLoading
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [error, setError] = useState("");
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  // Check if user is already logged in and verified
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is logged in, check verification status
        await checkUserVerificationStatus(user);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const checkUserVerificationStatus = async (user) => {
    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check if user needs verification
        if (!userData.emailVerified || userData.status === "pending_verification") {
          // User needs verification, show overlay
          setAwaitingVerification(true);
          setCurrentUserEmail(user.email);
          return;
        }
        
        // User is verified, redirect to verification page (profile completion)
        if (userData.status === "verified" || userData.status === "approved") {
          router.push("/verification");
          return;
        } 
      } 
    } catch (error) {
      console.error("Error checking user status:", error);
    }
  };

 
  const isSignUpValid = nameInput.trim() !== "" && 
                       emailSignUp.trim() !== "" && 
                       passwordSignUp.trim() !== "";
  const isLoginValid = emailLogin.trim() !== "" && 
                       passwordLogin.trim() !== "";

  // ✅ UPDATED: Unified function to handle user creation and verification
  const createUserDocument = async (user, additionalData = {}) => {
    try {
      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // New user - create document
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName || nameInput,
          emailVerified: user.emailVerified,
          provider: additionalData.provider || "email",
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          status: user.emailVerified ? "verified" : "pending_verification",
          ...additionalData
        });
      } else {
        // Existing user - update last login
        await setDoc(userRef, {
          lastLogin: serverTimestamp(),
          ...additionalData
        }, { merge: true });
      }
      
      return userDoc;
    } catch (error) {
      console.error("Error creating user document:", error);
      throw error;
    }
  };

  // ✅ UPDATED: Handle sign up with EMAIL LINK verification (Magic Link)
  const handleSignUp = async () => {
    if (!isSignUpValid) 
      return;
    try {
      setIsLoading(true);
      setError("");
      setVerificationEmailSent(true);
      
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        emailSignUp, 
        passwordSignUp
      );
      
      // Step 1: Configure the email action settings
      const actionCodeSettings = {
        url: `${window.location.origin}/auth`, // Page where user will complete sign-in
        handleCodeInApp: true, // Important: must be true for email link sign-in
      };
      
      // Step 2: Send the sign-in link to the user's email
      await sendEmailVerification(userCredential.user, actionCodeSettings);
      
      // Step 3: Save the email locally (important for completing sign-in)
      window.localStorage.setItem('emailForSignIn', emailSignUp);
      
      // Step 4: Show success message to user
      setError("Check your email for the verification link! Click the link to complete sign up.");
      setVerificationEmailSent(true);
      
      // Step 5: Show verification overlay
      setAwaitingVerification(true);
      setCurrentUserEmail(emailSignUp);
      
      // Clear the form for better UX
      setNameInput("");
      setEmailSignUp("");
      setPasswordSignUp("");
      
    } catch (error) {
      console.error("Email link sign up error:", error);
      
      // Handle specific Firebase errors
      let errorMessage = error.message;
      
      if (error.code === 'auth/email-already-in-use') {
        toast.error("This email is already registered. Please sign in instead.");
        errorMessage = "This email is already registered. Please sign in instead.";
      } else if (error.code === 'auth/invalid-email') {
        toast.error("Please enter a valid email address.");
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error("Email link sign-in is not enabled. Please contact support.");
        errorMessage = "Email link sign-in is not enabled. Please contact support.";
      } else if (error.code === 'auth/network-request-failed') {
        toast.error("Network error. Please check your internet connection.");
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.code === 'auth/too-many-requests') {
        toast.error("Too many requests. Please try again later.");
        errorMessage = "Too many requests. Please try again later.";
      } else {
        toast.error(error.message);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ UPDATED: Handle sign in with verification check
  const handleSignInClick = async () => {
    if (!isLoginValid) return;
    
    try {
      setIsLoading(true);
      setError("");
      
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        emailLogin, 
        passwordLogin
      );
      
      const user = userCredential.user;
      
      // Update user document
      await createUserDocument(user);
      
      // Check if email is verified
      if (!user.emailVerified) {
        // Send verification email again
        const actionCodeSettings = {
          url: `${window.location.origin}/auth?verified=true`,
          handleCodeInApp: true
        };
        
        await sendEmailVerification(user, actionCodeSettings);

        window.localStorage.setItem('emailForSignIn', user.email);
        
        // Show verification overlay
        setAwaitingVerification(true);
        setCurrentUserEmail(user.email);
        setError("Please verify your email. We've sent a new verification email.");
        setIsLoading(false);
        return;
      }
      
      // Check user status in Firestore
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userData.status === "pending_verification") {
          // Update status to verified
          await setDoc(doc(db, "users", user.uid), {
            emailVerified: true,
            status: "verified",
            lastLogin: serverTimestamp()
          }, { merge: true });
        }
      }
      
      // Redirect to verification page (profile completion)
      router.push("/verification");
      
    } catch (error) {
      console.error("Sign in error:", error);
      
      let errorMessage = "Failed to sign in. Please try again.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password.";
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password.";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.code === 'auth/email-not-verified') {
        errorMessage = "Email not verified. Please check your inbox.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ UPDATED: Handle social login with verification check
  const handleLogin = async (provider) => {
    try {
      setIsLoading(true);
      setError("");
      
      const auth = getAuth(); 
      
      if (provider === "google") {
        const googleProvider = new GoogleAuthProvider();
        
        // Add scopes if needed
        googleProvider.addScope('profile');
        googleProvider.addScope('email');
        
        // Set custom parameters
        googleProvider.setCustomParameters({
          prompt: 'select_account'
        });
        
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        console.log("Google login successful:", user.email);
        
        // Create/update user document
        await createUserDocument(user, {
          provider: "google",
          // Social login emails are already verified by provider
          emailVerified: true,
          status: "verified"
        });
        
        // Check if this is a new user
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (userData.status === "pending_verification") {
            // Update status since social login emails are verified
            await setDoc(doc(db, "users", user.uid), {
              emailVerified: true,
              status: "verified",
              lastLogin: serverTimestamp()
            }, { merge: true });
          }
        }
        
        // Redirect to verification page (profile completion)
        router.push("/verification");
        
      } else if (provider === "apple") {
        // Note: Apple Sign-In requires additional setup
        setError("Apple Sign-In is not configured yet. Please use Google or email.");
        toast.error("Apple Sign-In is not configured yet. Please use Google or email.");
      }
      
    } catch (error) {
      console.error(`${provider} login error:`, error);
      
      let errorMessage = `Failed to sign in with ${provider}.`;
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign in was cancelled.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Popup was blocked. Please allow popups for this site.";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for sign-in.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = `${provider} sign-in is not enabled. Please contact support.`;
      } else if (error.code === 'auth/configuration-not-found') {
        errorMessage = `${provider} sign-in is not properly configured.`;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ UPDATED: Forgot password function
  const handleForgotPassword = async () => {
    if (!emailLogin.trim()) {
      setError("Please enter your email address to reset password.");
      toast.error("Please enter your email address to reset password.");
      return;
    }
    
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, emailLogin);
      const message = `Password reset email sent to ${emailLogin}. Please check your inbox.`;
      setError(message);
      toast.success("Password reset email sent!");
    } catch (error) {
      console.error("Password reset error:", error);
      setError("Failed to send reset email. Please check your email address.");
      toast.error("Failed to send reset email. Please check your email address.");
    }
  };

  // ✅ NEW: Function to resend verification email
  const handleResendVerification = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setError("No user found. Please sign in again.");
        return;
      }
      
      const actionCodeSettings = {
        url: `${window.location.origin}/auth?verified=true`,
        handleCodeInApp: true
      };
      
      await sendEmailVerification(user, actionCodeSettings);
      setError("Verification email resent! Please check your inbox.");
      toast.success("Verification email resent!");
      
    } catch (error) {
      console.error("Error resending verification:", error);
      setError("Failed to resend verification email.");
      toast.error("Failed to resend verification email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="z-10 w-full max-w-md bg-[#111118]/60 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/10">
        {/* Tab Navigation */}
        <div className="flex space-x-6 mb-6 justify-center">
          <button
            onClick={() => {
              setActiveTab("signup");
              setError("");
            }}
            className={`font-semibold border-2 rounded-full py-1 px-3 cursor-pointer transition-colors ${
              activeTab === "signup"
                ? "text-white border-amber-200"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            Sign up
          </button>
          <button
            onClick={() => {
              setActiveTab("signin");
              setError("");
            }}
            className={`font-semibold border-2 rounded-full py-1 px-3 cursor-pointer transition-colors ${
              activeTab === "signin"
                ? "text-white border-amber-200"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            Sign in
          </button>
        </div>
        
        <h2 className="text-white text-2xl font-semibold mb-6 text-center">
          {activeTab === "signup" ? "Create an account" : "Welcome back"}
        </h2>

        {/* Error Message Display */}
        {error && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${
            error.includes("sent") || error.includes("Check your email") 
              ? "bg-green-500/20 border border-green-500 text-green-400"
              : "bg-red-500/20 border border-red-500 text-red-400"
          }`}>
            {error}
          </div>
        )}

        {/* Success Message for Verification */}
        {verificationEmailSent && !error && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-xl text-green-400 text-sm">
            Verification email sent! Please check your inbox.
          </div>
        )}

        <div className="space-y-4">
          {activeTab === "signup" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="bg-gray-200 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-amber-200"
                  required
                />
                <input
                  type="text"
                  placeholder="Last name"
                  className="bg-gray-200 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-amber-200"
                />
              </div>

              <input
                type="email"
                placeholder="Enter your email"
                value={emailSignUp}
                onChange={(e) => setEmailSignUp(e.target.value)}
                className="w-full bg-gray-200 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-amber-200"
                required
              />

              <input
                type="password"
                placeholder="Enter your password (min. 6 characters)"
                value={passwordSignUp}
                onChange={(e) => setPasswordSignUp(e.target.value)}
                className="w-full bg-gray-200 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-amber-200"
                minLength="6"
                required
              />

              <button
                onClick={handleSignUp}
                disabled={isLoading || !isSignUpValid}
                className="w-full hover:bg-amber-200 bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-xl py-3 mt-4 transition-colors"
              >
                {isLoading ? "Creating..." : "Create an account"}
              </button>
            </>
          )}

          {activeTab === "signin" && (
            <>
              <input
                type="email"
                placeholder="Enter your email"
                value={emailLogin}
                onChange={(e) => setEmailLogin(e.target.value)}
                className="w-full bg-gray-200 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-amber-200"
                required
              />

              <input
                type="password"
                placeholder="Enter your password"
                value={passwordLogin}
                onChange={(e) => setPasswordLogin(e.target.value)}
                className="w-full bg-gray-200 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-amber-200"
                required
              />

              <div className="flex justify-end">
                <button
                  onClick={handleForgotPassword}
                  className="text-amber-300 hover:text-amber-200 text-sm"
                >
                  Forgot password?
                </button>
              </div>

              <button
                onClick={handleSignInClick}
                disabled={isLoading || !isLoginValid}
                className="w-full hover:bg-amber-200 bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-xl py-3 transition-colors"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </>
          )}
        </div>

        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="px-4 text-gray-400 text-sm">
            or continue with
          </span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => handleLogin("google")}
            disabled={isLoading}
            className="flex-1 cursor-pointer bg-gray-200 border border-white/10 rounded-xl py-3 flex items-center justify-center hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button
            onClick={() => handleLogin("apple")}
            disabled={isLoading}
            className="flex-1 bg-gray-200 border border-white/10 rounded-xl py-3 flex items-center justify-center hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.94 5.19A4.38 4.38 0 0 0 16 2a4.44 4.44 0 0 0-3 1.52 4.17 4.17 0 0 0-1 3.09 3.69 3.69 0 0 0 2.94-1.42zm2.52 7.44a4.51 4.51 0 0 1 2.16-3.81 4.66 4.66 0 0 0-3.66-2c-1.56-.16-3 .91-3.83.91s-2-.89-3.3-.87a4.92 4.92 0 0 0-4.14 2.53C2.93 12.45 4.24 17 6 19.47c.8 1.21 1.8 2.58 3.12 2.53s1.75-.76 3.28-.76 2 .76 3.3.73 2.22-1.24 3.06-2.45a11 11 0 0 0 1.38-2.85a4.41 4.41 0 0 1-2.68-4.04z"/>
            </svg>
            Apple
          </button>
        </div>

        <p className="text-gray-500 text-xs text-center mt-6">
          {activeTab === "signup"
            ? "By creating an account, you agree to our Terms of Service and Privacy Policy"
            : "Don't have an account? Click 'Sign up' above"}
        </p>
      </div>
    </div>
  );
}

export default Login;