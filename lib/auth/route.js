import { query } from "firebase/firestore";
import { getFirebaseAuth } from "../firebase";
import { createUserWithEmailAndPassword,signOut, updateProfile } from "firebase/auth";

// Query for signup
export const signup = async (email, password, displayName) => {
  try {
    const auth = getFirebaseAuth();
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Update user profile with display name
    if (displayName) {
      await updateProfile(user, {
        displayName: displayName
      });
    }
    // IMPORTANT: Return the full userCredential, not just user
    return userCredential;
    
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

// Query for logout
export const logout = async () => {
  const auth = getFirebaseAuth();
  return await signOut(auth);
};

