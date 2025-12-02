// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAvzxXW-c-KOZR2dnnGnTCqEIIORgAHGYk",
  authDomain: "manufacturing-industry-01.firebaseapp.com",
  projectId: "manufacturing-industry-01",
  storageBucket: "manufacturing-industry-01.firebasestorage.app",
  messagingSenderId: "994519760806",
  appId: "1:994519760806:web:a54adf6b02e3c5043c5967",
  measurementId: "G-1J53Y1YPNR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);