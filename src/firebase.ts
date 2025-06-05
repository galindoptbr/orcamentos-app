import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCtQlEjw6XZLZbKuebkng_-l03XoHvOW8E",
  authDomain: "orcamentos-6d3c2.firebaseapp.com",
  projectId: "orcamentos-6d3c2",
  storageBucket: "orcamentos-6d3c2.appspot.com",
  messagingSenderId: "893804312962",
  appId: "1:893804312962:web:923c36a1b0b9857e1cf79b",
  measurementId: "G-JM6LFY97K8"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app); 