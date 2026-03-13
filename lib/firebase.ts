import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth,
  initializeAuth,
  GoogleAuthProvider, 
  signInWithPopup, 
  browserLocalPersistence,
  browserPopupRedirectResolver,
  User 
} from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use getAuth if already initialized, otherwise use initializeAuth
const auth = (() => {
  if (typeof window === 'undefined') return getAuth(app);
  try {
    const existingAuth = getAuth(app);
    return existingAuth;
  } catch (e) {
    return initializeAuth(app, {
      persistence: browserLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  }
})();

const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { app, auth, db, googleProvider, signInWithPopup };

