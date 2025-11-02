import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAQxg2C4zgbYiVgo9hPW1586o5wrtUTNr8",
  authDomain: "stc-25.firebaseapp.com",
  projectId: "stc-25",
  storageBucket: "stc-25.firebasestorage.app",
  messagingSenderId: "557377028041",
  appId: "1:557377028041:web:81c08fb17637a7703ef218",
  measurementId: "G-H4Y1L8M380",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export {auth, app};
