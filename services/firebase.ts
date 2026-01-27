import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDT8YgicyNid8QUjsVaqEJFG9glgPKWCkk",
  authDomain: "trifaw-b91d0.firebaseapp.com",
  projectId: "trifaw-b91d0",
  storageBucket: "trifaw-b91d0.firebasestorage.app",
  messagingSenderId: "971515188033",
  appId: "1:971515188033:web:dd8ebf6b7f673bffe287c0",
  measurementId: "G-5LBFF4KC0V"
};

// Singleton para a instância do App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);