import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Replace these with your Firebase config values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set auth persistence to LOCAL (persists even when browser is closed)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting auth persistence:', error);
});

export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app);
