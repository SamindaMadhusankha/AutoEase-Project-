import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChLh3x8czZLAe-5dPS_Bk1ETixvA4lLCg", 
  authDomain: "autoease-d2605.firebaseapp.com",
  projectId: "autoease-d2605",
  storageBucket: "autoease-d2605.appspot.com",
  messagingSenderId: "360614805185",
  appId: "1:360614805185:web:dcadc22a5056ec3c80de40" 
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);