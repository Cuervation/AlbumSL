import { initializeApp, type FirebaseOptions } from "firebase/app";
import { connectAuthEmulator, getAuth, GoogleAuthProvider } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

function getRequiredEnvValue(key: string): string {
  const value = import.meta.env[key];

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing required Firebase environment variable: ${key}`);
  }

  return value;
}

const firebaseConfig: FirebaseOptions = {
  apiKey: getRequiredEnvValue("VITE_FIREBASE_API_KEY"),
  authDomain: getRequiredEnvValue("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getRequiredEnvValue("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getRequiredEnvValue("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getRequiredEnvValue("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getRequiredEnvValue("VITE_FIREBASE_APP_ID"),
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firestoreDb = getFirestore(firebaseApp);
export const firebaseFunctions = getFunctions(firebaseApp);
export const googleAuthProvider = new GoogleAuthProvider();

if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true") {
  connectAuthEmulator(firebaseAuth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(firestoreDb, "127.0.0.1", 8080);
  connectFunctionsEmulator(firebaseFunctions, "127.0.0.1", 5001);
}
