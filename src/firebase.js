// firebase.js – NeuroConecta
// Inicializa Firebase evitando doble llamada en hot-reload (desarrollo).

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider }     from 'firebase/auth';
import { getFirestore }                    from 'firebase/firestore';

// Credenciales del proyecto (Firebase Console → Configuración → Web)
const firebaseConfig = {
  apiKey:            "AIzaSyAOaCNcgXeaw1En3JvYcCU8Eotxp5srdLs",
  authDomain:        "neuroauds.firebaseapp.com",
  projectId:         "neuroauds",
  storageBucket:     "neuroauds.firebasestorage.app",
  messagingSenderId: "708220394298",
  appId:             "1:708220394298:web:669a3d4b0c142d78d18e03",
  measurementId:     "G-W55WP82S9C"
};

// Si ya existe una instancia (hot-reload), la reutiliza; si no, la crea.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth           = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore simple, SIN persistencia local para evitar
// "INTERNAL ASSERTION FAILED: Unexpected state"
export const db = getFirestore(app);
