import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB4zofp2-JxhdN_DxK9uHRX6hEt4uX31TE",
  authDomain: "audix-music.firebaseapp.com",
  projectId: "audix-music",
  storageBucket: "audix-music.firebasestorage.app",
  messagingSenderId: "711145517934",
  appId: "1:711145517934:web:00d34f51dfdb428e85477f",
  measurementId: "G-V2QBEKSE06",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
};
