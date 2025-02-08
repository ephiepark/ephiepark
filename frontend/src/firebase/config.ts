import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCECwuO5pGGGOv0AmC6-QV-PFvAiLYiKjA",
  authDomain: "ephiepark-d187f.firebaseapp.com",
  projectId: "ephiepark-d187f",
  storageBucket: "ephiepark-d187f.firebasestorage.app",
  messagingSenderId: "578464412830",
  appId: "1:578464412830:web:fecabdc7a5e1aa58f8b78f",
  measurementId: "G-1HJV0CE844"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
