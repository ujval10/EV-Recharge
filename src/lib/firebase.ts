// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSBPYxPMyhbq7t9V0hAniYQZYoGcvTVz4",
  authDomain: "ev-recharge-f7841.firebaseapp.com",
  projectId: "ev-recharge-f7841",
  storageBucket: "ev-recharge-f7841.appspot.com",
  messagingSenderId: "135268635824",
  appId: "1:135268635824:web:8e381d5656890245a2d775"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
