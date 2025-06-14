import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyAofg0OwInVu3AMemeMEW9LoAgoYkL8ZTE",
  authDomain: "glscarros.firebaseapp.com",
  projectId: "glscarros",
  storageBucket: "glscarros.firebasestorage.app",
  messagingSenderId: "27050867729",
  appId: "1:27050867729:web:64a8d57717352dc65485b0",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
