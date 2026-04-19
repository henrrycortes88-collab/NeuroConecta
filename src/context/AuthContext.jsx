/**
 * AuthContext.jsx - NeuroConecta
 * -----------------------------------------------
 * Contexto global de autenticación de la aplicación.
 * Gestiona el estado del usuario autenticado, su rol (paciente,
 * cuidador, médico) y sus datos de perfil desde Firestore.
 *
 * Funcionalidades:
 *  - loginWithGoogle: Inicia sesión con Google y crea/actualiza
 *    el documento del usuario en Firestore.
 *  - linkPatient: Vincula un paciente a un doctor o cuidador
 *    buscando por email; actualiza los documentos de ambos.
 *  - linkPatientToCaregiver: Vincula un paciente a un cuidador
 *    buscando al paciente por su email.
 *  - logout: Cierra sesión y limpia el estado local.
 *
 * Uso: envuelve la app en <AuthProvider> y consume con useAuth().
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  doc, getDoc, setDoc, updateDoc, 
  onSnapshot, arrayUnion, query, collection, where, getDocs 
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

// Creamos el contexto con valor inicial null
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Estado del usuario de Firebase Auth
  const [user, setUser]         = useState(null);
  // Estado del documento del usuario en Firestore (incluye rol, linkedPatients, etc.)
  const [userData, setUserData] = useState(null);
  // Rol activo: 'patient' | 'caregiver' | 'doctor'
  const [role, setRole]         = useState(null);
  // Indicador de carga mientras se resuelve el estado de auth
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let unsubFirestore = null;

    // Escucha cambios en el estado de autenticación de Firebase
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Si hay usuario autenticado, escucha su documento en Firestore en tiempo real
        const ref = doc(db, 'users', firebaseUser.uid);
        unsubFirestore = onSnapshot(ref, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setUserData(data);   // Actualiza datos del perfil
            setRole(data.role);  // Actualiza el rol desde Firestore
          }
        });
        setUser(firebaseUser);
      } else {
        // Si no hay usuario, limpiamos el estado
        setUser(null);
        setUserData(null);
        setRole(null);
        if (unsubFirestore) unsubFirestore();
      }
      setLoading(false);
    });

    // Cleanup al desmontar el provider
    return () => {
      unsubAuth();
      if (unsubFirestore) unsubFirestore();
    };
  }, []);

  /**
   * loginWithGoogle
   * Inicia sesión con Google OAuth.
   * Si el usuario es nuevo, crea su documento en Firestore con el rol seleccionado.
   * Si ya existe, solo actualiza el rol.
   *
   * @param {string} selectedRole - 'patient' | 'caregiver' | 'doctor'
   */
  const loginWithGoogle = async (selectedRole) => {
    const result = await signInWithPopup(auth, googleProvider);
    const ref    = doc(db, 'users', result.user.uid);
    const snap   = await getDoc(ref);
    if (!snap.exists()) {
      // Usuario nuevo: crear documento completo
      await setDoc(ref, {
        uid:            result.user.uid,
        name:           result.user.displayName,
        email:          result.user.email,
        photo:          result.user.photoURL,
        role:           selectedRole,
        createdAt:      new Date(),
        linkedPatients: [],   // Lista de UIDs de pacientes vinculados
        fcmToken:       null  // Token para notificaciones push (futuro)
      });
    } else {
      // Usuario existente: solo actualizar rol
      await updateDoc(ref, { role: selectedRole });
    }
    setRole(selectedRole);
    return result.user;
  };

  /**
   * linkPatient
   * Vincula un paciente a un DOCTOR buscando al paciente por email.
   * - Agrega el UID del paciente al array `linkedPatients` del doctor.
   * - Guarda el UID del doctor en el documento del paciente (`doctorUid`).
   *
   * @param {string} patientEmail - Email del paciente a vincular
   * @param {string} doctorUid    - UID del doctor que vincula
   * @returns {object} Datos del paciente vinculado
   */
  const linkPatient = async (patientEmail, doctorUid) => {
    // Buscar al paciente por email y rol
    const q = query(
      collection(db, 'users'),
      where('email', '==', patientEmail),
      where('role', '==', 'patient')
    );
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Paciente no encontrado con ese email');
    
    const patientDoc = snap.docs[0];
    const patientUid = patientDoc.id;

    // Actualizar la lista del doctor
    await updateDoc(doc(db, 'users', doctorUid), {
      linkedPatients: arrayUnion(patientUid)
    });

    // Marcar al paciente con el UID del doctor
    await updateDoc(doc(db, 'users', patientUid), {
      doctorUid: doctorUid
    });

    return { id: patientUid, ...patientDoc.data() };
  };

  /**
   * linkPatientToCaregiver
   * Vincula un paciente a un CUIDADOR buscando al paciente por email.
   * - Agrega el UID del paciente al array `linkedPatients` del cuidador.
   * - Agrega el UID del cuidador al array `linkedCaregivers` del paciente.
   *
   * @param {string} patientEmail  - Email del paciente a vincular
   * @param {string} caregiverUid  - UID del cuidador que vincula
   * @returns {object} Datos del paciente vinculado
   */
  const linkPatientToCaregiver = async (patientEmail, caregiverUid) => {
    // Buscar al paciente por email y rol
    const q = query(
      collection(db, 'users'),
      where('email', '==', patientEmail),
      where('role', '==', 'patient')
    );
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Paciente no encontrado con ese email');

    const patientDoc = snap.docs[0];
    const patientUid = patientDoc.id;

    // Agregar paciente al cuidador
    await updateDoc(doc(db, 'users', caregiverUid), {
      linkedPatients: arrayUnion(patientUid)
    });

    // Agregar cuidador al paciente
    await updateDoc(doc(db, 'users', patientUid), {
      linkedCaregivers: arrayUnion(caregiverUid)
    });

    return { id: patientUid, ...patientDoc.data() };
  };

  /**
   * logout
   * Cierra la sesión de Firebase y limpia el estado local.
   */
  const logout = () => {
    setUser(null);
    setUserData(null);
    setRole(null);
    return signOut(auth);
  };

  // Exponemos todas las funciones y el estado a la aplicación
  return (
    <AuthContext.Provider value={{ 
      user, userData, role, loading, 
      loginWithGoogle, logout, setRole, linkPatient, linkPatientToCaregiver
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para consumir el contexto de autenticación
export const useAuth = () => useContext(AuthContext);
