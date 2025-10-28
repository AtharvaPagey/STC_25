// src/firebaseConfig.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// This line is new - it imports the authentication function
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQxg2C4zgbYiVgo9hPW1586o5wrtUTNr8",
  authDomain: "stc-25.firebaseapp.com",
  projectId: "stc-25",
  storageBucket: "stc-25.firebasestorage.app",
  messagingSenderId: "557377028041",
  appId: "1:557377028041:web:81c08fb17637a7703ef218",
  measurementId: "G-H4Y1L8M380",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (optional, but good to keep)
const analytics = getAnalytics(app);

// This is the most important part: initialize Auth and export it
export const auth = getAuth(app);
