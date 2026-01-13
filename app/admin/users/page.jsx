"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaEye, FaPlus, FaTrash, FaUserCheck, FaUserLargeSlash } from "react-icons/fa6";
import { HiDotsHorizontal, HiDotsVertical } from "react-icons/hi";
import PaginationComponent from "@/components/ui01/PaginationComponent";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import toast from "react-hot-toast";
import { FaExclamationTriangle } from "react-icons/fa";

function PageUser() {
  // State for users
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // State for selected user IDs
  const [selected, setSelected] = useState([]);
  const masterRef = useRef(null);

  // Fetch current admin user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentAdmin(user);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch users from Firestore
  useEffect(() => {
    if (currentAdmin) {
      fetchUsers();
    }
  }, [currentAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const db = getFirestore();
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      
      const usersList = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.displayName || data.email?.split('@')[0] || "Unknown User",
          image: data.photoURL || "/user1.png",
          email: data.email || "No email",
          access: data.isAdmin ? "Admin: Full Access" : data.accessLevel || "Data Entry",
          last: formatDate(data.lastLogin?.toDate()) || "Never",
          date: formatDate(data.createdAt?.toDate()) || formatDate(data.dateAdded?.toDate()) || "Unknown",
          stat: getUserStatus(data),
          isAdmin: data.isAdmin || false,
          isVerified: data.isVerified || false,
          status: data.status || "inactive",
          uid: data.uid || doc.id // Store the Firebase Auth UID
        };
      });

      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(`Failed to load users: ${error.message}`);
      toast.error("Failed to load users. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserStatus = (userData) => {
    if (userData.status === "active") return "Active";
    if (userData.status === "pending") return "Pending";
    if (userData.status === "suspended") return "Suspended";
    if (userData.isVerified === false) return "Inactive";
    return "Active";
  };

  // Update master checkbox indeterminate state
  useEffect(() => {
    if (!masterRef.current) return;
    const allCount = users.length;
    const selectedCount = selected.length;

    masterRef.current.indeterminate =
      selectedCount > 0 && selectedCount < allCount;
  }, [selected, users.length]);

  const isAllSelected = selected.length === users.length && users.length > 0;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelected([]);
    } else {
      setSelected(users.map((u) => u.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Function to delete user from Firestore (fallback method)
  const deleteUserFromFirestore = async (userId) => {
    try {
      const db = getFirestore();
      
      // Delete from users collection
      const userRef = doc(db, "users", userId);
      await deleteDoc(userRef);
      
      // Also delete from verifications collection if exists
      const verificationRef = doc(db, "verifications", userId);
      const verificationDoc = await getDoc(verificationRef);
      if (verificationDoc.exists()) {
        await deleteDoc(verificationRef);
      }
      
      return { success: true, message: "User deleted from Firestore" };
    } catch (error) {
      console.error("Error deleting user from Firestore:", error);
      throw new Error(`Firestore deletion failed: ${error.message}`);
    }
  };

  // Handle complete user deletion with Cloud Function fallback
  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to DELETE this user? This action cannot be undone.")) return;
    
    try {
      const userToDelete = users.find(user => user.id === userId);
      if (!userToDelete) {
        toast.error("User not found!");
        return;
      }
      
      // Try Cloud Function if available, otherwise fallback to Firestore deletion
      try {
        // Import dynamically to avoid errors if functions not available
        const { getFunctions, httpsCallable } = await import('firebase/functions');
        const functions = getFunctions();
        
        // Check if function exists
        const deleteUserAccount = httpsCallable(functions, 'deleteUserAccount');
        
        // Call the function with a timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Cloud Function timeout")), 10000)
        );
        
        const functionPromise = deleteUserAccount({
          userId: userId,
          uid: userToDelete.uid || userToDelete.id
        });
        
        const result = await Promise.race([functionPromise, timeoutPromise]);
        
        console.log("Cloud Function successful:", result.data);
        toast.success("User completely deleted (Auth + Firestore)");
        
      } catch (cloudError) {
        console.warn("Cloud Function unavailable or failed:", cloudError);
        
        // Fallback to Firestore-only deletion
        await deleteUserFromFirestore(userId);
        toast.success("User deleted from database (Auth deletion requires Cloud Function setup)");
        toast.info("Note: To completely delete users from authentication, deploy the Cloud Function.");
      }
      
      // Remove from local state regardless of method
      setUsers(users.filter(user => user.id !== userId));
      setSelected(selected.filter(id => id !== userId));
      
      // Refresh the list
      fetchUsers();
      
    } catch (error) {
      console.error("Error in user deletion:", error);
      toast.error(`Deletion failed: ${error.message}`);
    }
  };

  // Handle allow/enable user
  const handleAllowUser = async (userId) => {
    try {
      const db = getFirestore();
      
      // Update user in 'users' collection
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        status: "active",
        isVerified: true,
        updatedAt: new Date()
      });
      
      // Also update verification document if exists
      const verificationRef = doc(db, "verifications", userId);
      const verificationDoc = await getDoc(verificationRef);
      
      if (verificationDoc.exists()) {
        await updateDoc(verificationRef, {
          isVerified: true,
          status: "verified",
          updatedAt: new Date()
        });
      } else {
        // Create verification document if it doesn't exist
        await updateDoc(verificationRef, {
          userId: userId,
          isVerified: true,
          status: "verified",
          verifiedAt: new Date(),
          updatedAt: new Date()
        }, { merge: true });
      }
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              stat: "Active", 
              status: "active", 
              isVerified: true 
            }
          : user
      ));
      
      toast.success("User activated successfully!");
      
    } catch (error) {
      console.error("Error activating user:", error);
      toast.error(`Failed to activate user: ${error.message}`);
    }
  };

  // Handle disable user
  const handleDisableAccount = async (userId) => {
    try {
      const db = getFirestore();
      
      // Update user in 'users' collection
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        status: "suspended",
        isVerified: false,
        updatedAt: new Date()
      });
      
      // Also update verification document
      const verificationRef = doc(db, "verifications", userId);
      const verificationDoc = await getDoc(verificationRef);
      
      if (verificationDoc.exists()) {
        await updateDoc(verificationRef, {
          isVerified: false,
          status: "suspended",
          updatedAt: new Date()
        });
      } else {
        // Create verification document if it doesn't exist
        await updateDoc(verificationRef, {
          userId: userId,
          isVerified: false,
          status: "suspended",
          suspendedAt: new Date(),
          updatedAt: new Date()
        }, { merge: true });
      }
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              stat: "Suspended", 
              status: "suspended", 
              isVerified: false 
            }
          : user
      ));
      
      toast.success("Account disabled successfully!");
      
    } catch (error) {
      console.error("Error disabling account:", error);
      toast.error(`Failed to disable account: ${error.message}`);
    }
  };

  // Handle bulk actions
  const handleBulkDelete = async () => {
    if (selected.length === 0) {
      toast.error("Please select users to delete");
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selected.length} user(s)? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const results = [];
      for (const userId of selected) {
        try {
          await deleteUserFromFirestore(userId);
          results.push({ userId, success: true });
        } catch (error) {
          results.push({ userId, success: false, error: error.message });
        }
      }
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      // Update local state
      setUsers(users.filter(user => !selected.includes(user.id)));
      setSelected([]);
      
      if (successful > 0) {
        toast.success(`${successful} user(s) deleted successfully!`);
      }
      if (failed > 0) {
        toast.error(`${failed} user(s) failed to delete.`);
      }
      
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error(`Failed to delete users: ${error.message}`);
    }
  };

  const handleBulkEnable = async () => {
    if (selected.length === 0) {
      toast.error("Please select users to enable");
      return;
    }
    
    try {
      const db = getFirestore();
      const results = [];
      
      for (const userId of selected) {
        try {
          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, {
            status: "active",
            isVerified: true,
            updatedAt: new Date()
          });
          
          const verificationRef = doc(db, "verifications", userId);
          await updateDoc(verificationRef, {
            isVerified: true,
            status: "verified",
            updatedAt: new Date()
          }, { merge: true });
          
          results.push({ userId, success: true });
        } catch (error) {
          results.push({ userId, success: false, error: error.message });
        }
      }
      
      // Update local state
      setUsers(users.map(user => 
        selected.includes(user.id) 
          ? { ...user, stat: "Active", status: "active", isVerified: true }
          : user
      ));
      
      const successful = results.filter(r => r.success).length;
      if (successful > 0) {
        toast.success(`${successful} user(s) enabled successfully!`);
      }
      
    } catch (error) {
      console.error("Error in bulk enable:", error);
      toast.error(`Failed to enable users: ${error.message}`);
    }
  };

  const handleBulkDisable = async () => {
    if (selected.length === 0) {
      toast.error("Please select users to disable");
      return;
    }
    
    try {
      const db = getFirestore();
      const results = [];
      
      for (const userId of selected) {
        try {
          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, {
            status: "suspended",
            isVerified: false,
            updatedAt: new Date()
          });
          
          const verificationRef = doc(db, "verifications", userId);
          await updateDoc(verificationRef, {
            isVerified: false,
            status: "suspended",
            updatedAt: new Date()
          }, { merge: true });
          
          results.push({ userId, success: true });
        } catch (error) {
          results.push({ userId, success: false, error: error.message });
        }
      }
      
      // Update local state
      setUsers(users.map(user => 
        selected.includes(user.id) 
          ? { ...user, stat: "Suspended", status: "suspended", isVerified: false }
          : user
      ));
      
      const successful = results.filter(r => r.success).length;
      if (successful > 0) {
        toast.success(`${successful} user(s) disabled successfully!`);
      }
      
    } catch (error) {
      console.error("Error in bulk disable:", error);
      toast.error(`Failed to disable users: ${error.message}`);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(users.length / usersPerPage);
  const currentUsers = users.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Bulk action buttons
  const BulkActions = () => {
    if (selected.length === 0) return null;
    
    return (
      <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex items-center justify-between">
        <span className="text-sm font-medium text-yellow-800">
          {selected.length} user(s) selected
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleBulkEnable}
            className="px-3 py-1.5 text-xs bg-green-100 text-green-800 hover:bg-green-200 rounded-md flex items-center gap-1"
          >
            <FaUserCheck className="w-3 h-3" />
            Enable Selected
          </button>
          <button
            onClick={handleBulkDisable}
            className="px-3 py-1.5 text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded-md flex items-center gap-1"
          >
            <FaUserLargeSlash className="w-3 h-3" />
            Disable Selected
          </button>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1.5 text-xs bg-red-100 text-red-800 hover:bg-red-200 rounded-md flex items-center gap-1"
          >
            <FaTrash className="w-3 h-3" />
            Delete Selected
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-md p-4 mt-4 shadow-md w-[98%] mx-auto">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <FaExclamationTriangle className="text-red-500" />
          <div>
            <p className="text-red-700 font-medium">Error Loading Users</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-2 text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">All Users List</h1>
        <span className="flex justify-between items-center gap-2">
          {/* SEARCH BAR */}
          <div className="hidden md:flex items-center bg-gray-200 p-1 rounded-full ring-gray-300 px-2">
            <Image
              src="/search.svg"
              alt="Search Icon"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <input
              type="text"
              placeholder="Search by ID, Name, Email..."
              className="px-2 py-2 w-80 border-none bg-transparent text-xs gap-2 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* BUTTONS */}
          <span className="bg-[#fae27c] p-2 justify-between rounded-full cursor-pointer hover:bg-yellow-300">
            <HiDotsHorizontal />
          </span>
          <span 
            className="bg-[#fae27c] p-2 flex rounded-full cursor-pointer hover:bg-yellow-300"
            onClick={() => window.location.href = '/add-user'}
          >
            <FaPlus />
            <p className="text-xs ml-1.5">Add User</p>
          </span>
        </span>
      </div>

      {/* Bulk Actions */}
      <BulkActions />

      {/* USERS TABLE */}
      <div className="">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#fae27c] rounded-t-md text-gray-600 text-md">
            <tr className="">
              <th className="px-4 py-2 rounded-tl-xl">
                <input
                  ref={masterRef}
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  aria-label="Select all users"
                  className="w-4 h-4"
                />
              </th>
              <th className="px-4 py-3 w-[350px]">User name</th>
              <th className="px-4 py-3 w-[300px]">Access</th>
              <th className="px-4 py-3 w-[200px]">Last active</th>
              <th className="px-4 py-3 w-[190px]">Date added</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 rounded-tr-xl w-[150px]"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500 mr-3"></div>
                    <span>Loading users...</span>
                  </div>
                </td>
              </tr>
            ) : currentUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  {error ? "Error loading users" : "No users found."} {searchTerm && "Try a different search term."}
                </td>
              </tr>
            ) : (
              currentUsers.map((user) => {
                const checked = selected.includes(user.id);
                return (
                  <tr key={user.id} className="border-b items-center border-gray-200 hover:bg-amber-50 transition-colors">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelectOne(user.id)}
                        aria-label={`Select ${user.name}`}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="flex px-4 py-4 w-[400px] items-center">
                      <Image
                        src={user.image}
                        alt={user.name}
                        width={30}
                        height={30}
                        className="w-10 h-10 mr-2 rounded-full object-cover bg-amber-400"
                      />
                      <span>
                        <p className="font-medium text-gray-700">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-1">ID: {user.id.substring(0, 8)}...</p>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.access.includes('Admin') 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.access}
                      </span>
                    </td>
                    <td className="px-4 py-4">{user.last}</td>
                    <td className="px-4 py-4">{user.date}</td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.stat === 'Active' ? 'bg-green-100 text-green-800' :
                        user.stat === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        user.stat === 'Suspended' ? 'bg-red-100 text-red-800' :
                        user.stat === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'}`}>
                        {user.stat}
                      </span>
                    </td>
                    <td className="px-4 py-4 relative group">
                      <HiDotsVertical className="w-6 h-6 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50 cursor-pointer transition-colors mx-auto" />
                      
                      {/* Dropdown menu */}
                      <div className="absolute z-50 right-0 mt-1 w-48 bg-white shadow-lg rounded-lg border border-gray-200 opacity-0 hidden group-hover:opacity-100 group-hover:block transition-all duration-200">
                        <div className="py-1">
                          <button 
                            onClick={() => console.log("View details:", user.id)}
                            className="cursor-pointer w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FaEye className="w-3.5 h-3.5" />
                            View Details
                          </button>
                          
                          {user.stat !== 'Active' && user.stat !== 'Pending' && (
                            <button 
                              onClick={() => handleAllowUser(user.id)}
                              className="cursor-pointer w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 flex items-center gap-2"
                            >
                              <FaUserCheck className="w-3.5 h-3.5" />
                              Activate User
                            </button>
                          )}
                          
                          {user.stat === 'Active' && (
                            <button 
                              onClick={() => handleDisableAccount(user.id)}
                              className="cursor-pointer w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 flex items-center gap-2"
                            >
                              <FaUserLargeSlash className="w-3.5 h-3.5" />
                              Suspend Account
                            </button>
                          )}
                          
                          <div className="border-t border-gray-100 my-1"></div>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="cursor-pointer w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <FaTrash className="w-3.5 h-3.5" />
                            Delete Permanently
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION SECTION */}
      {!loading && users.length > 0 && (
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

export default PageUser;