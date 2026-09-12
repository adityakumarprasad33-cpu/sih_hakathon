import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

export const isFirebaseConfigured = (): boolean => {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!key || !project) return false;
  if (key.includes("your_") || project.includes("your_") || project.includes("placeholder")) return false;
  return true;
};

export const isRealtimeDatabaseConfigured = (): boolean => {
  if (!isFirebaseConfigured()) return false;
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  if (!dbUrl) return false;
  if (dbUrl.includes("your_project") || dbUrl.includes("placeholder") || dbUrl.includes("example")) return false;
  return true;
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let database: Database | null = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    // Realtime Database connection (regional URL support)
    if (isRealtimeDatabaseConfigured() && firebaseConfig.databaseURL) {
      database = getDatabase(app, firebaseConfig.databaseURL);
    }
  } catch (err) {
    console.warn("Firebase initialization warning (credentials pending):", err);
  }
}

export { app, auth, database };
