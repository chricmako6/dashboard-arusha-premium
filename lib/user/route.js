import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from "firebase/firestore";

export const usersService = {
  // Get all users
  async getAllUsers() {
    const db = getFirestore();
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Get user by ID
  async getUserById(userId) {
    const db = getFirestore();
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  },

  // Update user status
  async updateUserStatus(userId, status, updates = {}) {
    const db = getFirestore();
    const userRef = doc(db, "users", userId);
    
    const updateData = {
      status,
      updatedAt: new Date(),
      ...updates
    };
    
    await updateDoc(userRef, updateData);
  },

  // Search users
  async searchUsers(searchTerm) {
    const db = getFirestore();
    const usersRef = collection(db, "users");
    
    // You can add more complex queries here
    const q = query(
      usersRef,
      where("email", ">=", searchTerm),
      where("email", "<=", searchTerm + '\uf8ff')
      // Note: Firestore doesn't support OR queries directly
      // You might need to run multiple queries
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Delete user
  async deleteUser(userId) {
    const db = getFirestore();
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);
  }
};
